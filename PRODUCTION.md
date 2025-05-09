# Production Deployment Guide

This document explains how to deploy and update the GitOps Auditor in a production environment.

## Initial Deployment

For a fresh installation on a new LXC container:

1. Ensure the LXC has the required dependencies:
   - Node.js 20+ and npm
   - Git
   - jq
   - curl

2. Create the required directories:
   ```bash
   mkdir -p /opt/gitops/{scripts,api,audit-history,logs}
   ```

3. Copy the repository files to the LXC:
   ```bash
   # From your development machine
   ./update-production.sh
   ```

4. The script will:
   - Copy all necessary files to the LXC
   - Build the dashboard
   - Install dependencies
   - Configure systemd services
   - Run initial audit

## Updating the Production Environment

When you've made changes to the codebase and want to update the production LXC:

```bash
./update-production.sh
```

This script:
1. Establishes SSH connection to the LXC
2. Makes a backup of critical data
3. Transfers updated files
4. Rebuilds the dashboard
5. Updates the API
6. Restarts services
7. Runs a test to verify functionality

## Manual Deployment Steps

If you need to deploy manually or troubleshoot the deployment:

1. **Copy files to production:**
   ```bash
   rsync -avz --exclude 'node_modules' --exclude '.git' /mnt/c/GIT/homelab-gitops-auditor/ root@192.168.1.58:/opt/gitops/
   ```

2. **Build the dashboard:**
   ```bash
   ssh root@192.168.1.58 "cd /opt/gitops/dashboard && npm install && npm run build"
   ```

3. **Copy build files to web server:**
   ```bash
   ssh root@192.168.1.58 "mkdir -p /var/www/gitops-dashboard && cp -r /opt/gitops/dashboard/dist/* /var/www/gitops-dashboard/"
   ```

4. **Update the API:**
   ```bash
   ssh root@192.168.1.58 "cd /opt/gitops/api && npm install express"
   ```

5. **Restart services:**
   ```bash
   ssh root@192.168.1.58 "systemctl daemon-reload && systemctl restart gitops-audit-api && systemctl restart nginx"
   ```

## Troubleshooting Production Issues

If you encounter issues with the production deployment:

1. **Check API logs:**
   ```bash
   ssh root@192.168.1.58 "journalctl -u gitops-audit-api -n 50"
   ```

2. **Verify audit history:**
   ```bash
   ssh root@192.168.1.58 "ls -la /opt/gitops/audit-history"
   ```

3. **Test API endpoint:**
   ```bash
   curl http://192.168.1.58:3070/audit
   ```

4. **Run the debug script:**
   ```bash
   ssh root@192.168.1.58 "cd /opt/gitops/scripts && bash debug-api.sh"
   ```

5. **Common issues:**
   - Missing API dependencies: `npm install express` in the `/opt/gitops/api` directory
   - Invalid JSON in audit history: Check `/opt/gitops/audit-history/latest.json`
   - Missing audit data: Run `/opt/gitops/scripts/sync_github_repos.sh`
   - Dashboard build issues: Check for errors in the build process

## Production File Structure

The production environment uses this directory structure:

```
/opt/gitops/
│
├── api/                  # API server files
│   ├── server.js         # Main API server
│   └── node_modules/     # API dependencies
│
├── audit-history/        # Audit report history
│   ├── latest.json       # Symlink to latest audit
│   └── *.json            # Historical audit reports
│
├── dashboard/            # Dashboard source files
│   ├── src/              # Source code
│   ├── public/           # Static files
│   └── dist/             # Built files
│
├── logs/                 # Log files
│   ├── nightly_audit.log # Audit log
│   └── *.log             # Other logs
│
└── scripts/              # Utility scripts
    ├── sync_github_repos.sh    # Main audit script
    ├── deploy.sh               # Deployment script
    ├── debug-api.sh            # Debugging utility
    └── *.sh                    # Other scripts
```

## Service Configuration

The GitOps Auditor uses two main services:

1. **API Service** (`gitops-audit-api.service`):
   - Runs the Express.js API server
   - Listens on port 3070
   - Provides data to the dashboard

2. **Web Server** (typically `nginx`):
   - Serves static dashboard files from `/var/www/gitops-dashboard`
   - Should include SPA redirect for React Router
   - May proxy API requests

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name gitops.local;
    
    root /var/www/gitops-dashboard;
    index index.html;
    
    # SPA redirect for React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Optional API proxy
    location /api/ {
        proxy_pass http://localhost:3070/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```