# Production Deployment Configuration

## Production Server Details
- **IP Address**: 192.168.1.58
- **Environment**: Production LXC Container
- **Base Directory**: `/opt/gitops/`
- **Dashboard URL**: http://192.168.1.58/
- **API URL**: http://192.168.1.58:3070
- **DNS**: gitopsdashboard.local (should resolve to 192.168.1.58)

## Production vs Development Differences
| Component | Development | Production |
|-----------|-------------|------------|
| Base Directory | `/mnt/c/GIT/homelab-gitops-auditor` | `/opt/gitops/` |
| Dashboard URL | `http://localhost:5173` | `http://192.168.1.58/` |
| API URL | `http://localhost:3070` | `http://192.168.1.58:3070` |
| Local Git Root | `/mnt/c/GIT` | `/mnt/c/GIT` (mounted from host) |
| Service Management | Manual start | systemd services |
| Web Server | Vite dev server | Nginx reverse proxy |

## Production Services
- **GitOps Audit API**: `systemctl status gitops-audit-api`
- **Nginx**: `systemctl status nginx`
- **Cron Jobs**: Scheduled audit scripts in `/opt/gitops/cron/`

## Production Deployment Commands
```bash
# Deploy to production server
bash scripts/deploy.sh --target=192.168.1.58

# Manual deployment with specific IP
bash manual-deploy.sh --port=3070 --host=192.168.1.58

# Update production configuration
bash update-production.sh
```

## Network Configuration
- **Internal Network**: 192.168.1.0/24
- **Production Server**: 192.168.1.58
- **DNS Resolution**: gitopsdashboard.local → 192.168.1.58
- **Firewall Ports**: 80 (HTTP), 3070 (API), 22 (SSH)

## Production Monitoring
- **Health Check**: `curl http://192.168.1.58/audit`
- **API Status**: `curl http://192.168.1.58:3070/audit`
- **Log Files**: `/opt/gitops/logs/`
- **Service Status**: `systemctl status gitops-audit-api nginx`

## Backup and Maintenance
- **Audit History**: `/opt/gitops/audit-history/`
- **Configuration**: `/opt/gitops/` (version controlled)
- **Logs**: `/opt/gitops/logs/` (rotated daily)
- **Database Snapshots**: `/opt/gitops/npm_proxy_snapshot/`