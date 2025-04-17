# 🧭 GitOps Audit Dashboard

This project provides a visual dashboard for auditing the health and status of your Git repositories in a GitOps-managed homelab. It checks for uncommitted changes, stale branches, and missing files, and presents the results in an interactive web interface.

---

## 📊 Features

- **Bar & Pie Charts** for repository status breakdown
- **Live auto-refreshing** data from local or GitHub source
- **Searchable repository cards**
- **Lightweight, portable static site**
- Built with **React**, **Recharts**, and **TailwindCSS**
- Designed for self-hosting (LXC, Proxmox, etc.)

---

## 🧠 AdGuard DNS Rewrite Sync

This repository includes tooling to automate AdGuard Home rewrite records based on Nginx Proxy Manager entries.

### How It Works

- **NPM database** (`database.sqlite`) is copied from container 105 each night
- Internal domains matching `*.internal.lakehouse.wtf` are extracted
- DNS rewrites are applied to AdGuard via API using a dry-run → commit pipeline

### Cron Schedule

| Task                         | Time       |
|-----------------------------|------------|
| Fetch NPM DB snapshot       | 3:00 AM    |
| Generate dry-run rewrite log| immediately |
| Commit rewrites to AdGuard  | if dry-run found |

### Files

- `/opt/gitops/scripts/fetch_npm_config.sh`
- `/opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py`
- `/opt/gitops/scripts/gitops_dns_sync.sh`
- Logs saved in `/opt/gitops/logs/`

### Manual Testing

```bash
bash /opt/gitops/scripts/gitops_dns_sync.sh
```

Or run components separately:

```bash
bash /opt/gitops/scripts/fetch_npm_config.sh
python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py
python3 /opt/gitops/scripts/generate_adguard_rewrites_from_sqlite.py --commit
```

### Files & Logs

- Snapshots: `/opt/gitops/npm_proxy_snapshot/YYYYMMDD_HHMMSS/database.sqlite`
- Dry-run plan: `/opt/gitops/.last_adguard_dry_run.json`
- Logs: `/opt/gitops/logs/*.log`

### Requirements

- AdGuard Home API enabled with basic auth
- NPM container on LXC 105
- GitOps container on LXC 123 (with SSH access to Proxmox)
- Domain scheme:
  - External: `*.lakehouse.wtf`
  - Internal: `*.internal.lakehouse.wtf`

### Safety

- Sync is **idempotent**: no changes are made unless dry-run confirms delta
- Only touches domains ending in `.internal.lakehouse.wtf`
- Must run `--dry-run` before `--commit` is allowed

### Testing Cron Jobs

Use `env -i` to simulate cron environment:

```bash
env -i bash -c '/opt/gitops/scripts/gitops_dns_sync.sh'
```

Or temporarily schedule a one-off:

```cron
* * * * * root /opt/gitops/scripts/gitops_dns_sync.sh
```

Monitor logs:

```bash
tail -f /opt/gitops/logs/gitops_dns_sync.log
```

---

## 🔍 Audit Terminology

### 🔖 Stale Tags

A Git tag is considered **stale** if:

- It points to a commit that is not reachable from any current branch
- It refers to outdated releases that are no longer part of active history

**Why it matters**: Stale tags can confuse CI/CD pipelines or versioning tools by referencing irrelevant or outdated points in the project.

### 📁 Missing Files

A repository is marked with **missing files** if:

- It lacks key project indicators like `README.md`, `Dockerfile`, or other required files
- Its structure doesn’t meet expected criteria (e.g. missing `main.py`, `kustomization.yaml`, etc.)

**Why it matters**: Repos missing essential files are likely broken or incomplete, and can’t reliably be used in automated workflows.

---

## 📁 Project Structure

```text
homelab-gitops-auditor/
├── dashboard/             # Frontend React app (Vite)
│   ├── src/               # Main application code
│   └── dist/              # Build output
├── output/                # GitRepoReport.json output
├── scripts/               # Utility scripts
│   └── deploy.sh          # Build + deploy script
├── GitRepoAudit.py        # Main repo auditing script
└── ...
```

