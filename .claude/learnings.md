# Learnings — homelab-gitops

> Project-specific knowledge for the homelab-gitops repository.
> Global toolchain learnings live in `~/.claude/learnings/`.

---

## Environment

### Automation jobs log locally on CT 123, not to Loki
- IP Consistency Audit and other cron jobs on CT 123 (gitopsdashboard, proxmox2) write to `/opt/gitops/logs/` — they are NOT shipped to Loki.
- To check status programmatically: `ssh root@192.168.1.125 "pct exec 123 -- tail /opt/gitops/logs/<logfile>"`
- Key log files: `ip-audit.log`
- Loki Log Audit (`loki-audit-cron.sh`) exists in repo but is not deployed anywhere as of Feb 2026.

### DNS Sync retired — 2026-02-16
- DNS sync (`gitops_dns_sync.sh` + `fetch_npm_config.sh`) was built for Nginx Proxy Manager (NPM). NPM has been replaced by Traefik.
- Scripts moved to `scripts/retired/`. Cron disabled on CT 123.
- The old approach (stop NPM container, mount rootfs, rsync SQLite, restart) was fragile and had been broken since June 2025 anyway (SSH key auth failure + empty Python script).

### Retired scripts go in scripts/retired/
- When decommissioning automation, move scripts to `scripts/retired/` with a README noting the reason and date.
- Comment out the cron entry in `cron/gitops-schedule` with a retirement note.
- Disable the live cron on the target host.

### ESLint flat config needs `typescript-eslint` package — 2026-02-16
- The dashboard's `eslint.config.js` imports `typescript-eslint` (flat config API), but only `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` (legacy) were in devDependencies. Both the legacy and flat-config packages are needed.

### comprehensive_audit.sh config-loader path — 2026-02-16
- `config-loader.sh` lives in `scripts/config/config-loader.sh`, not `scripts/config-loader.sh`. The CI workflow previously copied the script to `/tmp` via sed, breaking `$SCRIPT_DIR` resolution. Fixed by running in-place with env var override for `LOCAL_GIT_ROOT`.

<!-- migrated from global learnings tier 2026-06-12 (Vikunja #1744) -->

### Atomic-swap deploy with idempotent systemd reconciliation — 2026-04-22
- **Pattern:** When deploying to a server whose systemd unit references legacy paths (e.g. old entry-file name, wrong WorkingDirectory), make the deploy step rewrite the unit only if it still matches the legacy shape. Idempotent `grep + sed + systemctl daemon-reload`.
- **Why:** Lets you ship config changes alongside code without a separate manual ops step. After the first successful deploy, the check is a no-op forever.
- **Example:** homelab-gitops deploy-homelab job at `.github/workflows/deploy.yml` — rewrites `ExecStart=/usr/bin/node server.js` and `WorkingDirectory=/opt/gitops/api` if unit still points at `minimal-phase2-server.js`.
- **Applies to:** Any long-lived prod host where systemd unit drift can't be assumed fixed.

### Deploys MUST serialize — deploy-homelab ships to a shared /opt/gitops-new staging dir — 2026-07-02
- **Bug:** `deploy-homelab` extracts the tarball to a fixed `/opt/gitops-new` on CT 123, `npm ci` + `npm rebuild sqlite3 --build-from-source` there, then atomic-swaps into `/opt/gitops`. Two overlapping runs clobber that shared staging tree mid-build → the swapped-in tree has a half-rebuilt native sqlite3 and the service crash-loops (`ERR_DLOPEN_FAILED`, sqlite3 vs GLIBC).
- **Cause seen 2026-07-02:** a push deploy (merge to main) raced a `workflow_dispatch` verify deploy → live outage. Recovery: `cd /opt/gitops/api && npm rebuild sqlite3 --build-from-source && systemctl restart gitops-audit-api`.
- **Fix in repo:** `deploy.yml` now has `concurrency: {group: deploy-to-production, cancel-in-progress: false}` (PR #167). NEVER manually `gh workflow run deploy.yml` while a push deploy may be in flight.

### deploy-homelab SSH auth is self-contained (HA pattern), not runner-key-dependent — 2026-07-02
- `deploy.yml` injects the `DEPLOY_SSH_KEY` repo secret to `~/.ssh/deploy_key` and uses `scp/ssh -i` explicitly (PR #166). Dedicated keypair `homelab-gitops-deploy@ci-cd` is authorised on `root@192.168.1.136` (gitopsdashboard). Works on either org runner. Previously used a bare `scp` relying on a runner-placed `id_ed25519` → failed on github-runner-2 (runner roulette, #2003).
