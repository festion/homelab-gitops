# homelab-gitops — GitOps Auditor

Audits the homelab's git repos for uncommitted changes, stale tags, missing
files, and local-vs-GitHub sync drift, then serves the result as a React
dashboard backed by an Express API.

<!-- Kept short deliberately (Anthropic's Claude 5 context guidance). Anything
     Claude can read off the repo — the component breakdown, the audit rules,
     what each dashboard control does — does not belong here. Claude does not
     click the dashboard UI; ~100 lines of end-user instructions for it were
     removed. This file holds production wiring and non-obvious traps only. -->

## Production wiring

| Thing | Value |
|---|---|
| Install root | `/opt/gitops` |
| API service | `gitops-audit-api` (systemd), port **3070** |
| Repos scanned | `/repos` |
| Current report | `/output/GitRepoReport.json` |
| Historical snapshots | `/audit-history/` |
| Nightly audit | 03:00 |
| Manual audit | `/opt/gitops/scripts/sync_github_repos.sh` |
| Deploy | `scripts/deploy.sh` (API) · `scripts/install-dashboard.sh` (dashboard) |

## Traps

- **A blank dashboard is usually a missing CSS build, not a broken app.** The
  frontend generates `dashboard/src/generated.css` from `src/index.css` via
  `npm run tw:watch`; without that step the page renders empty and the console
  is clean.
- **An empty repo list with a healthy API means the report is missing or
  invalid**, not that there is nothing to audit — check
  `/output/GitRepoReport.json` parses before debugging the scan itself.

## Recall project knowledge

The learnings base for this repo (4 KB) is **not** preloaded — it used to be
`@`-imported, which expanded ~2k tokens into every session. Search it instead:

```bash
memory-search "<what you're about to change>" --project homelab-gitops
```

Query it before changing a route, a deploy path, or anything CodeQL has flagged.
