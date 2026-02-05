# Lakehouse Infrastructure & Management Context

Site-specific configuration for the Lakehouse homelab Omada deployment.

---

## Omada Controller

| Property | Value |
|----------|-------|
| LXC ID | 111 |
| Node | proxmox3 |
| IP | 192.168.1.47 |
| Version | 6.0.0.24 |
| Web UI | https://omada.internal.lakehouse.wtf |
| Direct Access | https://192.168.1.47:8043 |
| SSH | ssh root@omada-controller.mgmt.lakehouse.wtf |

### Local Files

| Purpose | Path |
|---------|------|
| Firmware Storage | `/home/dev/workspace/Omada_firmware/` |
| Backups | `/home/dev/workspace/backups/omada/` |
| Config Restore | `/home/dev/workspace/omada_config_restore.cfg` |

---

## DHCP Infrastructure (Kea HA)

### Servers

| Role | IP | LXC ID |
|------|-----|--------|
| Primary | 192.168.1.133 | 133 |
| Secondary | 192.168.1.134 | 134 |

### DHCP Option 138 (CAPWAP)

This option enables Omada devices on different subnets to discover the controller.

**Value**: `192.168.1.47`

**Verification:**
```bash
ssh root@192.168.1.133 "grep -A5 'option-data' /etc/kea/kea-dhcp4.conf | grep -A2 '138'"
```

### After Reservation Changes

Always sync configurations between Kea servers:

```bash
# On kea-dhcp-1 (192.168.1.133)
ssh root@kea-dhcp-1.mgmt.lakehouse.wtf
kea-config-sync
```

Or from development environment:
```bash
ssh -i ~/.ssh/homelab root@192.168.1.133 "kea-config-sync"
```

---

## DNS Infrastructure (AdGuard HA)

### Servers

| Role | IP | LXC ID | Notes |
|------|-----|--------|-------|
| **Authoritative** | 192.168.1.224 | 116 | adguard-2 - Make changes HERE |
| Replica | 192.168.1.253 | 1250 | adguard - Auto-synced |
| Sync Service | 192.168.1.225 | 118 | Runs every 5 minutes |

### Key Principle

**Always make DNS changes on adguard-2 (192.168.1.224)**

Changes automatically propagate to adguard (192.168.1.253) via the sync service.

### Adding DNS Rewrites

**Option 1: Management Script**
```bash
cd /home/dev/workspace/operations
./scripts/adguard-rewrite.sh add omada.internal.lakehouse.wtf 192.168.1.47
```

**Option 2: Direct API**
```bash
curl -s -X POST http://192.168.1.224/control/rewrite/add \
  -u "root:PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"domain":"omada.internal.lakehouse.wtf","answer":"192.168.1.110"}'
```

---

## Reverse Proxy (Traefik)

| Property | Value |
|----------|-------|
| IP | 192.168.1.110 |
| LXC ID | 110 |
| Dashboard | https://traefik.internal.lakehouse.wtf |

### Domain Pattern

Internal services use: `*.internal.lakehouse.wtf`

| Service | URL |
|---------|-----|
| Omada Controller | https://omada.internal.lakehouse.wtf |
| Traefik Dashboard | https://traefik.internal.lakehouse.wtf |

### Traefik Configuration

Omada is configured as a Traefik backend:

**Router:** `/etc/traefik/dynamic/routers.yml`
```yaml
omada-router:
  rule: "Host(`omada.internal.lakehouse.wtf`)"
  entryPoints:
    - websecure
  service: omada-service
  tls:
    certResolver: cloudflare
```

**Service:** `/etc/traefik/dynamic/services.yml`
```yaml
omada-service:
  loadBalancer:
    servers:
      - url: "https://192.168.1.47:8043"
```

---

## Management Zone (mgmt.lakehouse.wtf)

For direct SSH or IP access (bypassing Traefik):

| Host | mgmt DNS |
|------|----------|
| Omada Controller | omada-controller.mgmt.lakehouse.wtf |
| Core Switch | (DHCP assigned) |
| EAP773 | (DHCP assigned) |
| EAP225 | (DHCP assigned) |

### Usage

```bash
# SSH to controller
ssh root@omada-controller.mgmt.lakehouse.wtf

# Direct HTTPS to controller
curl -k https://omada-controller.mgmt.lakehouse.wtf:8043
```

---

## Network Device Inventory

### Current Devices

| Device | Model | IP | MAC | Notes |
|--------|-------|-----|-----|-------|
| Controller | VM/LXC | 192.168.1.47 | - | LXC 111 on proxmox3 |
| Core Switch | SG3218XP-M2 | 192.168.1.210 | EC-75-0C-A5-C1-9D | Main switch |
| DownstairsAP | EAP773 | 192.168.1.242 | 20-36-26-DD-7E-E0 | WiFi 7, Port 8 |
| UpstairsAP | EAP773 | 192.168.1.22 | A8-29-48-C0-01-60 | WiFi 7, Port 3 |
| Attic AP | EAP225 | 192.168.1.109 | 78-20-51-D8-FA-48 | WiFi 5 |

### DHCP Reservations

Add/verify reservations in Kea for all Omada hardware:

```bash
# View current reservations
ssh root@192.168.1.133 "jq '.Dhcp4.subnet4[0].reservations[] | select(.hostname | contains(\"eap\") or contains(\"sg\"))' /etc/kea/kea-dhcp4.conf"
```

---

## Backup Procedures

### Controller Backup

**Manual:**
1. Settings → Maintenance → Backup & Restore
2. Select "Settings Only"
3. Download .cfg file
4. Store in `/home/dev/workspace/backups/omada/`

**Naming Convention:**
```
omada_backup_YYYYMMDD_HHMMSS.cfg
```

### Pre-Change Checklist

Before making significant changes:

1. [ ] Create controller backup
2. [ ] Document current state
3. [ ] Test in isolation if possible
4. [ ] Have rollback plan

---

## Common Tasks

### Adopt New Device

1. Connect device to network
2. Verify DHCP Option 138 is configured
3. Wait for device to appear in Devices → Pending
4. If "Managed by Others", get password from Settings → Site → Device Account
5. Click Adopt
6. Monitor status through Adopting → Provisioning → Connected
7. Add DHCP reservation in Kea
8. Run `kea-config-sync`

### Update Controller

```bash
# SSH to controller
ssh root@omada-controller.mgmt.lakehouse.wtf

# Check current version
dpkg -l | grep omada

# Download new version to /tmp
cd /tmp
wget https://static.tp-link.com/upload/software/...

# Install
dpkg -i Omada_SDN_Controller_*.deb

# Verify
systemctl status omada
```

### Factory Reset Device

**Via GUI:**
Devices → [Device] → Config → Factory Reset

**Via Physical Reset:**
Hold reset button for 7+ seconds until LED indicates reset

---

## Monitoring Integration

### Uptime Kuma

| Monitor | URL | Type |
|---------|-----|------|
| Omada Controller | https://omada.internal.lakehouse.wtf | HTTPS |
| Controller API | https://192.168.1.47:8043/api/info | HTTPS |

### Grafana/Prometheus

Consider monitoring:
- Controller service status
- Device online count
- Client count
- PoE power usage (via SNMP)
