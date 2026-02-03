# Proxmox Datacenter Manager (PDM) Deployment

## Overview
Proxmox Datacenter Manager deployed on LXC 127 (proxmox3/192.168.1.126), providing centralized management for the 3-node Proxmox cluster.

## Container Details
- **LXC ID**: 127
- **Host Node**: proxmox3 (192.168.1.126)
- **IP Address**: 192.168.1.41 (DHCP reserved)
- **MAC Address**: bc:24:11:73:93:52
- **Hostname**: proxmox-datacenter-manager
- **Services**: proxmox-datacenter-api, proxmox-datacenter-privileged-api
- **Port**: 8443 (HTTPS with self-signed cert)

## Infrastructure Configuration

### DHCP Reservation (Kea HA)
Added to both Kea servers (192.168.1.133 and 192.168.1.134):
```json
{
  "hw-address": "bc:24:11:73:93:52",
  "ip-address": "192.168.1.41",
  "hostname": "proxmox-datacenter-manager"
}
```

### DNS Rewrite (AdGuard HA)
Added to both AdGuard servers (192.168.1.253 and 192.168.1.224):
```yaml
- domain: pdm.internal.lakehouse.wtf
  answer: 192.168.1.110
  enabled: true
```

### Traefik Configuration (HA)
Added to both Traefik instances (LXC 110 and LXC 121):

**services.yml:**
```yaml
pdm-service:
  loadBalancer:
    serversTransport: insecure-transport
    servers:
    - url: https://192.168.1.41:8443
    healthCheck:
      path: /
      interval: 30s
      timeout: 5s
```

**routers.yml:**
```yaml
pdm-router:
  rule: Host(`pdm.internal.lakehouse.wtf`)
  service: pdm-service
  entryPoints:
  - websecure
  middlewares:
  - internal-whitelist
  - esphome-iframe-headers
  tls:
    certResolver: cloudflare
    domains:
    - main: "*.internal.lakehouse.wtf"
```

### Uptime Kuma Monitoring
- **Monitor ID**: 24
- **URL**: https://pdm.internal.lakehouse.wtf
- **Type**: HTTP GET
- **Interval**: 120 seconds
- **Status**: Active

## Access URLs
- **Internal (via Traefik)**: https://pdm.internal.lakehouse.wtf
- **Direct**: https://192.168.1.41:8443

## Deployment Date
2025-12-02

## Notes
- Uses insecure-transport in Traefik due to self-signed certificate on PDM
- Part of Tier 2 monitoring (essential services)
- Provides federation capabilities for multi-node Proxmox management
