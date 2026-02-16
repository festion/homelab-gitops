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
