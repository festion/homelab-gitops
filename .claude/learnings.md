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

### A global `express.json()` registered before a route-scoped `express.raw()` eats the body — the GitHub webhook 400s on EVERY request and signature validation becomes unreachable — 2026-08-03
- **Context:** ops #2524. `POST /api/v2/webhooks/github` returned `400 {"error":"Invalid JSON payload"}` for every well-formed delivery. Measured against the live service on CT 123 before the fix: three separate well-formed POSTs (no signature / bogus signature / repository_dispatch) all 400'd, with `SyntaxError: "[object Object]" is not valid JSON` in the journal.
- **Mechanism:** Express runs middleware in **registration order**. `app.use(express.json())` at the top of the app consumed and parsed the stream first, so the route's own `express.raw()` found nothing left to read and `req.body` was already a parsed object. `JSON.parse(req.body)` then stringified that object to `[object Object]` and threw. Fix is ordering alone — register the route-scoped raw parser BEFORE the global json one.
- **The worse, quieter consequence:** `validateWebhookSignature()` sits after the parse and was therefore **never reached**. The endpoint appeared to "reject unsigned requests", but that behaviour was an artefact of the 400 — every request failed identically whether signed, unsigned, or forged. A security control that is unreachable looks exactly like a security control that is working, because both produce rejections.
- **Do not "fix" this by parsing earlier.** HMAC must be computed over the exact bytes GitHub sent. Any fix that restores 200s while discarding the raw buffer leaves signature verification broken and is strictly worse than the original bug — it converts a loud failure into a silent one. The regression suite asserts `rawBody` is a Buffer AND that its length equals the serialized payload length, precisely to catch that.
- **Testing note:** use Node's `http` client, not supertest — supertest is only installed under `api/node_modules`, and more usefully the raw client sends the body bytes verbatim, which is the thing under test. The suite also pins the OLD ordering in a `REGRESSION` case, so the passing tests are demonstrably passing because of the ordering rather than by luck.
- **Applies to:** any Express route needing raw bytes alongside a global body parser — webhook receivers (GitHub, Stripe, Slack), multipart uploads, and anything doing signature or digest verification.

### A REQUIRED status check with `paths-ignore` blocks every PR that misses those paths — forever, with nothing to point at — 2026-09-04
- **Context:** ops #3560. PR #306 added one file under `docs/`. It sat `BLOCKED` with three of four required checks green and the fourth **absent**.
- **Mechanism:** `Secret Detection` is a required check on `main`; its workflow (`security-enhanced.yml`) carried `paths-ignore: ['**/*.md', '.claude/**', '.serena/**', 'docs/**']`. **A filtered-out required check does not report "skipped" — it never reports at all.** GitHub then blocks the PR with no failing check to click, no re-run to trigger, and no way to satisfy it. Every docs-only PR in this repo was structurally unmergeable.
- **This is NOT the "a skipped job satisfies a required check" behaviour.** A skipped job still reports and counts as satisfied. A job that is never *created* reports nothing, and the two look identical from the PR page — you have to notice the check is missing from the list rather than red.
- **The security half was worse than the deadlock.** Those ignore patterns turned the secret scan off for exactly the files where credentials have leaked here: a live Vaultwarden admin token sat in a `.serena/memories/*.md` for 6.5 months, this repo publishes `.serena/` from a **public** remote, and a credential written into a prose sentence matches no shape-based rule — so a content scan is the only thing that would find it.
- **Right:** remove the path filters (PR #308). Running TruffleHog on documentation changes is cheap and is the case the scan exists for. **Verify the job NAMES are unchanged** — renaming one creates a second, identical deadlock.
- **A base change does not re-trigger a PR's checks.** After merging the fix, #306 still showed the old check set; rebasing its branch onto the new `main` and force-pushing is what made `Enhanced Security Scanning` queue for the first time and report `Secret Detection: SUCCESS`.
- **Detector:** compare `gh api repos/O/R/branches/main/protection --jq .required_status_checks.contexts` against `gh pr view N --json statusCheckRollup`. A required name that is **absent** from the rollup — not red, absent — is this defect.
- **Applies to:** every required check in this repo; the other workflows are unaudited for the same shape.

### `config.get()` returns a STRING for anything set in a conf file, and the environment cannot introduce a key at all — 2026-09-04
- **Context:** ops #3586. Four services read `MONITORED_REPOSITORIES` and treated the result as an array.
- **`config-loader.js` has two loaders and they behave differently.** `loadConfigFile()` (50–82) parses `config/settings.conf` and `settings.local.conf` as `KEY=value` text, matches any `[A-Z_][A-Z0-9_]*`, strips quotes, and assigns — **always a string**. `loadEnvironmentVariables()` (86–92) iterates `for (const key in this.config)`, so it only overrides keys **already declared** in the constructor's defaults.
- **Consequence, both directions:** setting `MONITORED_REPOSITORIES` in the environment does **nothing** — the key is not among the 23 declared, so nothing copies it in. Setting it in a conf file works and yields a string, which callers expecting a list then iterate one **character** at a time. `docs/PIPELINE-API.md:241` and `docs/COMPLIANCE-API.md:405` both document it as comma-separated, so following the documentation is what triggers it.
- **A string passes the obvious guards.** `configRepos.length > 0` is true for a string; `Array.isArray(repos) ? repos.filter(Boolean) : []` collapses it to `[]` — so one reader silently monitored **nothing** while three monitored the right repos.
- **Right:** normalise through one shared helper (`api/utils/configList.js`) at every reader, applied **before** any array guard, so the guard stays a safety net rather than the thing that eats a valid value.
- **Applies to:** any `config.get()` caller expecting a list. `ALLOWED_ORIGINS` is a plausible second instance and is unexamined.
