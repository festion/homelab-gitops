# Homelab GitOps Auditor Documentation

## Project Overview

The Homelab GitOps Auditor is a comprehensive tool designed to monitor, audit, and visualize the health and status of Git repositories in a homelab GitOps environment. It helps identify issues such as uncommitted changes, stale branches, and missing files, presenting the results through an interactive dashboard.

## Key Components

1. **Dashboard Frontend** (`/dashboard/`):

   - React-based web interface with charts and visualizations
   - Shows repository status with filtering capabilities
   - Auto-refreshing data with configurable intervals

2. **API Backend** (`/api/`):

   - Express.js server providing API endpoints for dashboard
   - Handles repository operations (clone, commit, discard changes)
   - Serves audit report data

3. **Audit Scripts** (`/scripts/`):

   - Repository synchronization with GitHub (`sync_github_repos.sh`)
   - Deployment utilities (`deploy.sh`, `install-dashboard.sh`)

4. **Data Storage**:
   - Audit reports stored in `/output/` as JSON and Markdown
   - Historical snapshots in `/audit-history/`

## Core Functionality

### 1. Repository Auditing

The system audits Git repositories for:

- **Uncommitted changes**: Identifies repos with local modifications
- **Stale tags**: Flags tags pointing to unreachable commits
- **Missing files**: Detects repos missing key files like README.md
- **Sync status**: Compares local repos with GitHub to identify missing/extra repos

### 2. Interactive Dashboard

The dashboard provides:

- Bar and pie charts for overall repository health
- Repository cards with status indicators
- Searchable repository list
- Live auto-refreshing data
- Ability to switch between local and GitHub data sources

## Setup and Usage

### Installation

1. **Dashboard Setup**:

   ```bash
   cd /opt/gitops
   bash scripts/install-dashboard.sh
   ```

2. **API Setup**:

   ```bash
   cd /opt/gitops
   bash scripts/deploy.sh
   ```

3. **Cron Configuration**:
   - Nightly audits run at 3:00 AM

### Dashboard Usage

1. **View Repository Status**:

   - Access dashboard at `http://<your-lxc-ip>/`
   - Use search box to filter repositories
   - View health metrics in charts

2. **Configure Auto-Refresh**:

   - Select refresh interval (5s, 10s, 30s, 60s)
   - Switch between local and GitHub data sources

3. **Repository Actions**:
   - Clone missing repositories
   - Delete extra repositories
   - Commit or discard changes for dirty repositories

### Manual Tools

1. **Run Manual Audit**:

   ```bash
   /opt/gitops/scripts/sync_github_repos.sh
   ```

## Troubleshooting

### Common Issues

1. **Dashboard Not Displaying**:

   - Check for CSS generation issues (`npm run tw:watch`)
   - Verify JSON data exists in `/output/GitRepoReport.json`
   - Check browser console for JavaScript errors
   - Ensure API is running and accessible (`systemctl status gitops-audit-api`)

2. **No Repositories Showing**:

   - Ensure `/repos` directory exists and contains Git repositories
   - Verify `/output/GitRepoReport.json` is valid and contains data
   - Check output of manual audit run

3. **API Connection Issues**:

   - Verify API port (3070) is not blocked by firewall
   - Check API service is running (`systemctl status gitops-audit-api`)
   - Check logs for connection errors


## Learnings KB

@.claude/learnings.md
