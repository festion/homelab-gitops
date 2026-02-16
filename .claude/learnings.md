# Learnings — homelab-gitops

> Project-specific knowledge for the homelab-gitops repository.
> Global toolchain learnings live in `~/.claude/learnings/`.

---

## Environment

### Automation jobs log locally on CT 123, not to Loki
- DNS Sync, IP Consistency Audit, and other cron jobs on CT 123 (gitopsdashboard, proxmox2) write to `/opt/gitops/logs/` — they are NOT shipped to Loki.
- To check status programmatically: `ssh root@192.168.1.125 "pct exec 123 -- tail /opt/gitops/logs/<logfile>"`
- Key log files: `gitops_dns_sync.log`, `ip-audit.log`
- Loki Log Audit (`loki-audit-cron.sh`) exists in repo but is not deployed anywhere as of Feb 2026.

### DNS Sync has been broken since June 2025
- Last successful run: 2025-06-22. Fails with `RuntimeError: database.sqlite not found in latest snapshot` in `generate_adguard_rewrites_from_sqlite.py`.
- The NPM database snapshot fetch may be failing or the path changed.
