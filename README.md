# 📽 GitOps Audit Dashboard

This project provides a visual dashboard for auditing the health and status of your Git repositories in a GitOps-managed homelab. It checks for uncommitted changes, stale branches, and missing files, and presents the results in an interactive web interface.

**Latest Version: v1.0.4** - Added repository-specific viewing with improved routing

## 📦 Quick Install

```bash
# Clone the repository
git clone https://github.com/festion/homelab-gitops-auditor.git /tmp/gitops-install

# Create deployment package (with port 8080, without Nginx)
cd /tmp/gitops-install
bash manual-deploy.sh --port=8080 --no-nginx

# Install the package
cd gitops_deploy_*
bash install.sh

# Access at http://YOUR_SERVER_IP:8080
```

---

## 📊 Features

- **Bar & Pie Charts** for repository status breakdown
- **Live auto-refreshing** data from local or GitHub source
- **Searchable repository cards**
- **Lightweight, portable static site**
- Built with **React**, **Recharts**, and **TailwindCSS**
- Designed for self-hosting (LXC, Proxmox, etc.)

---

## 🧠 GitHub to Local Repository Sync Auditor

### Overview
This script audits and remediates differences between your local Git repositories and your remote GitHub repositories. It is designed for use in GitOps-managed environments to ensure local and remote repositories stay in sync and compliant with expectations.

### Script Location
```
/opt/gitops/scripts/sync_github_repos.sh
```

### Output Location
```
/opt/gitops/audit-history/
```

### Purpose
- Ensures all GitHub repositories exist locally
- Flags extra local repositories not found on GitHub
- Detects uncommitted changes in local repositories
- Outputs structured JSON for UI integration
- Maintains full audit history with symlink to the latest result

### Dependencies
- `jq`: for parsing JSON
- `curl`: for GitHub API access
- Bash 4+

### Usage
```bash
chmod +x /opt/gitops/scripts/sync_github_repos.sh
/opt/gitops/scripts/sync_github_repos.sh
```

### Output Files
Each run creates a file:
```
/opt/gitops/audit-history/YYYY-MM-DDTHH:MM:SSZ.json
```
And updates the symlink:
```
/opt/gitops/audit-history/latest.json
```

### JSON Output Structure
```json
{
  "timestamp": "2025-04-18T15:00:00Z",
  "health_status": "yellow",
  "summary": {
    "total": 42,
    "missing": 2,
    "extra": 1,
    "dirty": 3,
    "clean": 36
  },
  "repos": [
    {
      "name": "habitica",
      "status": "missing",
      "clone_url": "https://github.com/festion/habitica.git",
      "dashboard_link": "http://gitopsdashboard.local/audit/habitica?action=clone"
    },
    {
      "name": "untracked-repo",
      "status": "extra",
      "local_path": "/mnt/c/GIT/untracked-repo",
      "dashboard_link": "http://gitopsdashboard.local/audit/untracked-repo?action=delete"
    },
    {
      "name": "homebox",
      "status": "dirty",
      "local_path": "/mnt/c/GIT/homebox",
      "dashboard_link": "http://gitopsdashboard.local/audit/homebox?action=review"
    }
  ]
}
```

### Traffic Light Indicator Rules
- **green**: All repos exist and are clean
- **yellow**: Some repos are dirty or extra
- **red**: One or more repos are missing

### Integrations
- This script supports full integration with the GitOps Dashboard.
- `dashboard_link` entries allow remediation links in the UI to directly trigger repair actions.

### Future Enhancements
- API endpoint triggers for remediation: clone, delete, commit, discard
- Commit JSON results to Git or notify via email/webhook
- Dashboard history view with diffs between snapshots

---

## 👀 AdGuard DNS Rewrite Sync

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

