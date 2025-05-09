# Development Guide for GitOps Auditor

This document provides instructions for setting up and running the GitOps Auditor in a development environment.

## Overview

The GitOps Auditor consists of multiple components:

1. **API Server** (Express.js)
2. **Dashboard** (React/Vite)
3. **Audit Scripts** (Bash/Python)

During development, we use a modified architecture that works with relative paths instead of the production paths (`/opt/gitops/`).

## Development Setup

### Prerequisites

- Node.js v20 or later
- npm
- Bash environment (WSL on Windows)
- Git

### Running the Development Environment

We've provided a single script to start all components in development mode:

```bash
# From the project root
./dev-run.sh
```

This script:
- Creates necessary directories
- Installs dependencies
- Starts API server on http://localhost:3070
- Starts dashboard on http://localhost:5173
- Sets up auto-reloading for both components

### Manual Setup

If you prefer to run components manually:

**1. Start the API server:**

```bash
cd /mnt/c/GIT/homelab-gitops-auditor
NODE_ENV=development node api/server.js
```

**2. Start the Dashboard:**

```bash
cd /mnt/c/GIT/homelab-gitops-auditor/dashboard
npm run dev
```

**3. Run the GitHub sync script in dev mode:**

```bash
cd /mnt/c/GIT/homelab-gitops-auditor
bash scripts/sync_github_repos.sh --dev
```

## Development Architecture

In development mode, the GitOps Auditor uses these modifications:

1. **Path adaptations:**
   - Uses relative paths based on project root
   - API detects environment and adjusts paths

2. **Data storage:**
   - Stores audit history in `./audit-history/` instead of `/opt/gitops/audit-history/`
   - Falls back to static JSON file if no history exists

3. **CORS and networking:**
   - API enables CORS for development
   - Dashboard connects to API via `http://localhost:3070`

## Testing Your Changes

1. Modify dashboard components in `./dashboard/src/`
2. Edit API endpoints in `./api/server.js`
3. Changes to bash scripts can be tested with the `--dev` flag

## Production vs Development

The primary differences in development mode:

| Feature | Development | Production |
|---------|-------------|------------|
| Base directory | Project folder | `/opt/gitops/` |
| API Server | Manual start | systemd service |
| Dashboard | Vite dev server | Static NGINX |
| API URL | `http://localhost:3070` | Relative paths |
| Data Persistence | Project folder | `/opt/gitops/audit-history/` |

## Troubleshooting

- **API Connection Issues**: Check that the API server is running and CORS is properly configured
- **Missing directories**: Ensure `audit-history` exists in the project root
- **Dashboard display issues**: Check browser console for errors
- **Data loading failures**: Verify that JSON data exists in either `audit-history/latest.json` or `dashboard/public/GitRepoReport.json`

## Building for Production

To build the dashboard for production:

```bash
cd /mnt/c/GIT/homelab-gitops-auditor/dashboard
npm run build
```

To deploy everything to production:

```bash
cd /mnt/c/GIT/homelab-gitops-auditor
bash scripts/deploy.sh
```