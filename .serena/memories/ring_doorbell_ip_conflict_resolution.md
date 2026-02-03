# Ring Doorbell IP Conflict Resolution

## Date: 2025-12-11

## Issue
Zigbee2mqtt (LXC 122 on proxmox2) was showing as down in Uptime Kuma despite the service running correctly.

## Root Cause
**ARP conflict** between:
- Zigbee2mqtt container (LXC 122): IP 192.168.1.228, MAC `bc:24:11:19:c1:c4`
- Ring Doorbell (Front Door): IP 192.168.1.228 (static), MAC `34:3e:a4:dd:9d:f1`

The Ring doorbell had a static IP configured that conflicted with the zigbee2mqtt container. Both Traefik containers (110 on proxmox, 121 on proxmox2) had cached the Ring's MAC address, causing intermittent connectivity failures to zigbee2mqtt.

## Diagnosis Steps
1. Verified zigbee2mqtt service was running (`systemctl status zigbee2mqtt`)
2. Confirmed web UI accessible on port 8099 directly
3. Found Traefik returning 503 "no available server"
4. Discovered ARP cache in Traefik containers pointed to wrong MAC (`34:3e:a4:dd:9d:f1` instead of `bc:24:11:19:c1:c4`)
5. Identified MAC `34:3e:a4` as Ring LLC device
6. WatchYourLAN confirmed: "Ring Doorbell Camera - 34:3e:a4:dd:9d:f1 - 192.168.1.228"

## Resolution

### Immediate Fix
Added permanent static ARP entries in both Traefik containers:
```bash
# Traefik (container 110 on proxmox)
ssh root@192.168.1.137 "pct exec 110 -- ip neigh add 192.168.1.228 lladdr bc:24:11:19:c1:c4 dev eth0 nud permanent"

# Traefik-2 (container 121 on proxmox2)
ssh root@192.168.1.125 "pct exec 121 -- ip neigh add 192.168.1.228 lladdr bc:24:11:19:c1:c4 dev eth0 nud permanent"
```

### Permanent Fix
Added DHCP reservation for Ring Doorbell with new IP:
- **Device**: Ring Doorbell (Front Door)
- **MAC**: 34:3e:a4:dd:9d:f1
- **New IP**: 192.168.1.11
- **Hostname**: ring-doorbell-front

Reservation added to both Kea DHCP servers:
- kea-dhcp-1 (LXC 133 on proxmox3): `/etc/kea/kea-dhcp4.conf`
- kea-dhcp-2 (LXC 134 on proxmox): `/etc/kea/kea-dhcp4.conf`

## Related Configuration

### Zigbee2mqtt
- Container: LXC 122 on proxmox2 (192.168.1.125)
- IP: 192.168.1.228
- Frontend port: 8099
- MAC: bc:24:11:19:c1:c4

### Traefik Routing
- Router: `zigbee2mqtt-router`
- Service: `z2m-service`
- URL: https://zigbee2mqtt.internal.lakehouse.wtf
- Backend: http://192.168.1.228:8099

## Notes
- Ring doorbell will get new IP on next DHCP renewal or power cycle
- Static ARP entries in Traefik containers will not survive container restart
- Consider adding static ARP to container startup scripts if issue recurs before Ring gets new IP
