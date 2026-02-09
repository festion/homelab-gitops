# Development Environment (LXC 128)

## Container Details
- **LXC ID:** 128
- **Hostname:** developmentenvironment
- **Location:** proxmox2
- **IP Address:** 192.168.1.239 (DHCP)
- **MAC Address:** BC:24:11:A1:59:02

## Network Configuration
- **Mode:** DHCP (migrated from static)
- **Bridge:** vmbr0
- **DHCP Reservation:** Configured on both Kea servers (192.168.1.133 and 192.168.1.134)
- **DNS:** No internal DNS rewrite (accessed via IP)

## Access
```bash
# SSH directly
ssh root@192.168.1.239

# Via Proxmox
ssh root@proxmox2 "pct exec 128 -- bash"
```

## Notes
- Container uses DHCP with a static reservation (not static IP config)
- If container loses IP after restart, run `dhclient eth0` inside container to renew lease
- No Traefik/DNS integration - development use only
