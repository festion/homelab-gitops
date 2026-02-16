# Weekly Monday Morning Summary — Design

**Date:** 2026-02-16
**Status:** Implemented

## Purpose

A single bash script that generates a comprehensive weekly environment summary every Monday at 6 AM on CT 128 (dev container). Delivers via HTML email and commits a markdown archive to the repo.

## Decisions

- **Trigger:** Local cron on CT 128 (Monday 6:00 AM)
- **Delivery:** HTML email to jeremy.ames@outlook.com + markdown committed to `docs/weekly-summaries/YYYY-MM-DD.md`
- **Architecture:** Single script (`scripts/weekly-summary.sh`), matching existing patterns from `loki-log-audit.sh` and `nightly-email-summary.sh`
- **Error isolation:** Each data source wrapped in its own function; failures produce "Data unavailable" instead of crashing the report

## Data Sources

| Section | Source | Method |
|---------|--------|--------|
| Environment Health | Loki API (192.168.1.170:3100) | HTTP queries for auth failures, 5xx errors, crashes, resource exhaustion, backup failures, cert/DNS issues |
| Infrastructure Status | Proxmox PVE API via SSH (192.168.1.137) | `pvesh get /nodes`, `pct list`, pool health, PBS backup status |
| Automation Report | Loki logs + local cron logs | Query for job names (dns-sync, nightly-email, loki-audit) and check success/failure |
| CI/CD Summary | GitHub CLI (`gh`) | `gh run list` for homelab-gitops workflows — pass/fail per workflow |
| Outstanding Tasks | GitHub CLI + Vikunja API (192.168.1.143:3456) | Open issues across homelab repos + open Vikunja tasks |

## Report Format

### Markdown (committed to repo)

```
# Weekly Environment Summary — YYYY-MM-DD

**Period:** Mon Feb 10 – Sun Feb 16, 2026
**Overall Health:** GREEN / YELLOW / RED

## Environment Health
- Critical: N | Warnings: N | Info: N
- [details per category]

## Infrastructure Status
- Containers: N running, N stopped
- Storage pools: all healthy / degraded
- Backups: N completed, N failed

## Automation Report
| Job | Last Run | Status |
|-----|----------|--------|
| DNS Sync | ... | OK |
| Nightly Email | ... | OK |
| Loki Audit | ... | FAILED |

## CI/CD Summary
| Workflow | Runs | Passed | Failed |
|----------|------|--------|--------|
| audit.yml | 3 | 3 | 0 |
| ...

## Outstanding Tasks
### GitHub Issues (N open)
- repo#123: title
- ...

### Vikunja Tasks (N open)
- task title (project)
- ...
```

### HTML Email

Inline-styled HTML matching `email-notifications.js` patterns:
- Header with date range + overall health badge (green/yellow/red)
- Each section as a styled card with summary + details
- Footer with links to Grafana and GitOps dashboards

## Cron Entry

```
0 6 * * 1 /home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh >> /var/log/weekly-summary.log 2>&1
```

## CLI Interface

```bash
./scripts/weekly-summary.sh              # Full run: collect, email, commit
./scripts/weekly-summary.sh --dry-run    # Generate report, print to stdout, no email/commit
./scripts/weekly-summary.sh --help       # Usage info
```

## Dependencies

- `curl`, `jq` — for Loki and Vikunja API queries
- `ssh` — passwordless SSH to Proxmox host (already configured)
- `gh` — GitHub CLI (authenticated)
- `mail` or `msmtp` — email sending
- `git` — for committing the markdown report

## Git Integration

After generating the report:
1. `git add docs/weekly-summaries/YYYY-MM-DD.md`
2. `git commit -m "docs: weekly summary YYYY-MM-DD"`
3. `git pushx` (auto-updates PROJECT_INDEX.md)
