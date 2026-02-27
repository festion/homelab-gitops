# Management Subdomain DNS Architecture

> **Canonical reference:** `operations/docs/network/dns-architecture.md`
> This file is retained for Serena context but the operations doc is authoritative.

## Overview

The homelab uses two DNS subdomain patterns for different purposes:

- `*.internal.lakehouse.wtf` → Routes through **Traefik** (192.168.1.110) for services/web apps
- `*.mgmt.lakehouse.wtf` → **Direct device access** bypassing Traefik for administration

## mgmt.lakehouse.wtf Entries

| DNS Name | IP | Port | Purpose |
|----------|-----|------|---------|
| proxmox.mgmt.lakehouse.wtf | 192.168.1.137 | 8006 | Proxmox node 1 WebUI |
| proxmox2.mgmt.lakehouse.wtf | 192.168.1.125 | 8006 | Proxmox node 2 WebUI |
| proxmox3.mgmt.lakehouse.wtf | 192.168.1.126 | 8006 | Proxmox node 3 WebUI |
| adguard.mgmt.lakehouse.wtf | 192.168.1.253 | — | AdGuard replica |
| adguard2.mgmt.lakehouse.wtf | 192.168.1.224 | — | AdGuard source of truth |
| adguard-sync.mgmt.lakehouse.wtf | 192.168.1.225 | 6060 | AdGuard Home sync instance |
| pbs.mgmt.lakehouse.wtf | 192.168.1.31 | 8007 | Proxmox Backup Server |
| stork.mgmt.lakehouse.wtf | 192.168.1.234 | 443 | Stork DHCP monitoring |
| watchyourlan.mgmt.lakehouse.wtf | 192.168.1.195 | 8840 | WatchYourLAN IP/MAC tracker |

## AdGuard DNS Sync Architecture

- **Sync Origin**: AdGuard-2 (192.168.1.224) on proxmox2, container 116
- **Replica**: AdGuard primary (192.168.1.253) on proxmox3, container 1250
- **Sync Service**: adguard-sync container (118) on proxmox1 (192.168.1.137)
- **Sync Schedule**: Every 5 minutes (`*/5 * * * *`)
- **Config Location**: `/root/adguardhome-sync.yaml` in container 118

### Important: Adding New DNS Entries

Always add new DNS rewrites to **AdGuard-2** (192.168.1.224, container 116 on proxmox2) as it is the sync origin. Changes will propagate to replicas within 5 minutes.

```bash
# Add entries to AdGuard-2 (sync origin)
ssh root@192.168.1.125 "pct exec 116 -- vim /opt/AdGuardHome/AdGuardHome.yaml"
ssh root@192.168.1.125 "pct exec 116 -- systemctl restart AdGuardHome"
```

## Adding New mgmt Devices

To add a new device to mgmt subdomain:

1. Edit AdGuard-2 config (sync origin):
```bash
ssh root@192.168.1.125 "pct exec 116 -- bash -c '
sed -i \"/^  rewrites:/a\\
    - domain: newdevice.mgmt.lakehouse.wtf\\n\\
      answer: 192.168.1.XXX\\n\\
      enabled: true\" /opt/AdGuardHome/AdGuardHome.yaml
systemctl restart AdGuardHome
'"
```

2. Wait up to 5 minutes for sync, or trigger manually:
```bash
ssh root@192.168.1.137 "pct exec 118 -- /usr/local/bin/adguardhome-sync run --config /root/adguardhome-sync.yaml"
```

## Key Differences: internal vs mgmt

| Aspect | *.internal.lakehouse.wtf | *.mgmt.lakehouse.wtf |
|--------|--------------------------|----------------------|
| DNS Target | 192.168.1.110 (Traefik) | Direct device IP |
| SSL/TLS | Traefik handles certs | Device self-signed certs |
| Port | 443 (standard HTTPS) | Device-specific (8006, 8007, etc.) |
| Use Case | Services, web apps | Direct device administration |
| Middleware | Compression, headers, auth | None (direct connection) |

## Date Created
2025-12-10
