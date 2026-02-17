# Proxmox Agent Dashboard

**Status:** Deployed
**Date:** 2026-02-16

## Container Details

| Field | Value |
|-------|-------|
| CT ID | 152 |
| Hostname | proxmox-agent |
| IP Address | 192.168.1.161 |
| Node | proxmox2 (192.168.1.125) |
| Storage | TrueNas_NVMe |
| OS | Debian 12 |

## Services

| Service | Manager | Port | Config |
|---------|---------|------|--------|
| FastAPI backend | supervisor | 8000 | `supervisor.conf` |
| Nginx (frontend) | systemd | 80 | `nginx-site.conf` |
| Traefik route | Traefik (CT 110) | 443 | `traefik-route.yml` |

## Access

- **Dashboard:** https://proxmox-agent.internal.lakehouse.wtf
- **Direct:** http://192.168.1.161
- **SSH:** `ssh root@192.168.1.161`
- **Credentials:** admin / proxmox123 (basic auth)

## Monitoring

Cron jobs run on CT 152:

| Schedule | Script | Log |
|----------|--------|-----|
| Every 2 min | `cluster-monitor.sh monitor` | `/var/log/proxmox-agent/monitor.log` |
| Every 5 min | `cluster-remediation.sh remediate` | `/var/log/proxmox-agent/remediation.log` |

## Deployment

Source repo: `festion/proxmox-agent` (branch: main)

```bash
# Sync code from dev workspace
rsync -av --exclude='.git' --exclude='node_modules' --exclude='__pycache__' --exclude='.env' \
  /home/dev/workspace/proxmox-agent/ root@192.168.1.161:/opt/proxmox-agent/

# Rebuild frontend
ssh root@192.168.1.161 "cd /opt/proxmox-agent/dashboard/frontend && npm install && npm run build"

# Restart backend
ssh root@192.168.1.161 "supervisorctl restart proxmox-agent-backend"
```

## Config Files (Source of Truth)

| File | Deployed To |
|------|-------------|
| `supervisor.conf` | CT 152: `/etc/supervisor/conf.d/proxmox-agent-backend.conf` |
| `nginx-site.conf` | CT 152: `/etc/nginx/sites-available/proxmox-agent` |
| `traefik-route.yml` | CT 110: `/etc/traefik/dynamic/proxmox-agent.yml` |
