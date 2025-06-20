# 📽 GitOps Audit Dashboard

This project provides a visual dashboard for auditing the health and status of your Git repositories in a GitOps-managed homelab. It checks for uncommitted changes, stale branches, missing files, and **GitHub/local repository mismatches**, presenting the results in an interactive web interface with **automated remediation suggestions**.

**Latest Version: v1.1.0** - Added one-line installation, comprehensive local scanning, and user-configurable settings

## 🚀 One-Line Install/Upgrade (Recommended)

**For Proxmox VE hosts:**

```bash
bash -c "$(wget -qLO - https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/install.sh)"
```

**This command works for both:**

- ✅ **Fresh installations** - Creates new LXC container with GitOps Auditor
- ✅ **Upgrades** - Automatically detects and upgrades existing installations

**For detailed setup instructions**: [📖 Quick Start Guide](docs/QUICK_START.md)

This creates a complete GitOps monitoring solution in an LXC container with automatic startup, daily audits, and web dashboard access.

## 📦 Manual Install

For non-Proxmox environments or custom setups:

```bash
# Clone the repository
git clone https://github.com/festion/homelab-gitops-auditor.git /tmp/gitops-install

# Configure for your environment (IMPORTANT)
cd /tmp/gitops-install
./scripts/config-manager.sh interactive

# Create deployment package
bash manual-deploy.sh --port=8080 --no-nginx

# Install the package
cd gitops_deploy_*
bash install.sh

# Access at your configured server
# Production: http://YOUR_SERVER_IP
# Local: http://YOUR_SERVER_IP:8080
```

## ⚙️ Quick Configuration

The one-line installer includes an interactive setup wizard. For manual configuration:

```bash
# Interactive configuration (recommended)
./scripts/config-manager.sh interactive

# Or set key values manually
./scripts/config-manager.sh set PRODUCTION_SERVER_IP "YOUR_IP"
./scripts/config-manager.sh set LOCAL_GIT_ROOT "/your/git/path"
./scripts/config-manager.sh set GITHUB_USER "your-username"
```

For detailed configuration options, see [Configuration Guide](docs/CONFIGURATION.md).

---

## 📊 Features

- **🔍 Comprehensive Repository Auditing** - GitHub/Local mismatch detection and remediation
- **📈 Interactive Dashboard** with bar & pie charts for repository status breakdown
- **⚡ One-Line Installation** - Proxmox LXC container setup in under 5 minutes
- **🔄 Live Auto-Refreshing** data with configurable intervals
- **🔍 Searchable Repository Cards** with detailed status information
- **⚙️ User-Configurable Settings** for production servers and Git paths
- **🤖 Automated Remediation** suggestions for repository mismatches
- **🛠️ Professional Configuration Management** with CLI tools and validation
- Built with **React**, **Recharts**, and **TailwindCSS**
- Designed for **self-hosting** (LXC, Proxmox, Docker)

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

### Dashboard Access

- **Production**: http://192.168.1.58/audit
- **Local Development**: http://localhost:5173
- **API Endpoint**: http://192.168.1.58:3070/audit

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

| Task                         | Time             |
| ---------------------------- | ---------------- |
| Fetch NPM DB snapshot        | 3:00 AM          |
| Generate dry-run rewrite log | immediately      |
| Commit rewrites to AdGuard   | if dry-run found |

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
