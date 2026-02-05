---
name: omada-network-management
description: TP-Link Omada SDN network management for the Lakehouse homelab. Use when managing switches, access points, VLANs, spanning tree, or WiFi infrastructure. Triggers on phrases like "adopt device", "configure VLAN", "switch CLI", "WiFi troubleshooting", "Omada API", "STP blocking", "PoE budget", or any network hardware management.
---

# TP-Link Omada Network Management Skill

Manage the Lakehouse TP-Link Omada SDN infrastructure including switches, access points, VLANs, and spanning tree configuration.

## Infrastructure Overview

| Component | Model/Version | IP | Purpose |
|-----------|---------------|-----|---------|
| **Controller** | Omada SDN v6.0.0.24 | 192.168.1.47 | Central management |
| **Core Switch** | SG3218XP-M2 | DHCP Reserved | L2+ managed switch with PoE |
| **Main AP** | EAP773 (WiFi 7) | DHCP Reserved | Primary access point |
| **Attic AP** | EAP225 | DHCP Reserved | Secondary access point |

### Controller Access

| Method | URL/Command |
|--------|-------------|
| Web UI (internal) | https://omada.internal.lakehouse.wtf |
| Web UI (direct) | https://192.168.1.47:8043 |
| SSH/Management | ssh root@omada-controller.mgmt.lakehouse.wtf |
| LXC ID | 111 (proxmox3) |

## Quick Reference

### Device Adoption

1. **Discovery**: Ensure DHCP Option 138 points to 192.168.1.47 (configured in Kea)
2. **Identification**: Devices → Pending → Batch Adopt
3. **Credentials**: If "Managed by Others", use password from Settings → Site → Device Account
4. **Monitoring**: Watch status cycle: Adopting → Provisioning → Connected

### Common GUI Paths (v6+)

| Task | Navigation |
|------|------------|
| VLAN/LAN Management | Network Config → Network Settings → LAN |
| Port Management | Devices → [Switch] → Manage Device → Ports |
| Site Services (NTP/LED) | Settings → Site → Services |
| Open API Setup | Global View → Settings → Platform Integration → Open API |
| Backup/Restore | Settings → Maintenance → Backup & Restore |

### Switch CLI Quick Commands

```bash
# Enter privileged mode
enable

# Show port status
show interface status

# Check STP status
show spanning-tree summary

# Check PoE usage (240W budget)
show power inline

# Full diagnostic dump
show tech-support
```

### Console Connection

| Parameter | Value |
|-----------|-------|
| Baud Rate | 38400 |
| Data bits | 8 |
| Stop bits | 1 |
| Parity | None |

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Device won't adopt | Check DHCP Option 138 points to 192.168.1.47 |
| STP blocking ports | Set affected ports as Admin Edge in port settings |
| Firewalla misidentified | Clients → Config → Client Type → Router/Gateway |
| SSH auth fails (PuTTY) | Enable "Keyboard-interactive" or use `-o HostKeyAlgorithms=+ssh-rsa` |
| EAP225 slow green flash | Lost controller contact, check network/DHCP |
| EAP225 default IP | 192.168.0.254 (if DHCP fails) |

## References

Detailed documentation for specific tasks:

- [references/controller-operations.md](references/controller-operations.md) - Adoption, backup, GUI navigation
- [references/switch-cli.md](references/switch-cli.md) - SG3218XP-M2 CLI commands
- [references/vlan-stp-config.md](references/vlan-stp-config.md) - VLAN and spanning tree configuration
- [references/api-reference.md](references/api-reference.md) - Omada API operations
- [references/troubleshooting.md](references/troubleshooting.md) - Common issues and resolutions
- [references/hardware-specs.md](references/hardware-specs.md) - Device specifications
- [references/lakehouse-instance.md](references/lakehouse-instance.md) - Site-specific configuration

## Integration with Lakehouse Infrastructure

### DHCP (Kea HA)

- **Primary**: 192.168.1.133 | **Secondary**: 192.168.1.134
- **Option 138**: 192.168.1.47 (Omada controller CAPWAP discovery)
- After reservation changes: Run `kea-config-sync` on kea-dhcp-1

### DNS (AdGuard HA)

- **Authoritative**: adguard-2 (192.168.1.224) - make changes here
- Changes sync every 5 minutes to adguard (192.168.1.253)

### Reverse Proxy (Traefik)

- **IP**: 192.168.1.110
- **Domain**: *.internal.lakehouse.wtf

### Management Zone

- Use `*.mgmt.lakehouse.wtf` for direct access
- Example: `ssh root@omada-controller.mgmt.lakehouse.wtf`
