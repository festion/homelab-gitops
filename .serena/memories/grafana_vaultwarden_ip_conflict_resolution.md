# IP Conflict Resolution: Grafana vs Vaultwarden

## Incident Date: December 2, 2025

## Summary
Vaultwarden was returning "no available server" through Traefik due to an IP conflict with Grafana.

## Root Cause
- **Grafana (LXC 101)** had a hardcoded static IP of `192.168.1.140` in its container config on proxmox
- **Vaultwarden (LXC 140)** was configured with DHCP reservation for `192.168.1.140`
- Both containers ended up with the same IP, causing ARP cache confusion
- Traefik containers had the wrong MAC address cached for 192.168.1.140

## Resolution Steps

### 1. Discovered the Conflict
```bash
# Checked ARP on Traefik container - showed wrong MAC for 192.168.1.140
pct exec 110 -- arp -a | grep 192.168.1.140

# Checked Grafana's config
pct config 101 | grep net0
# Output: net0: name=eth0,bridge=vmbr0,gw=192.168.1.1,hwaddr=BC:24:11:18:6B:29,ip=192.168.1.140/24
```

### 2. Changed Grafana IP
First attempt was 192.168.1.101, but that conflicted with Traefik's secondary IP.
Final fix: Changed Grafana to 192.168.1.151

```bash
# On proxmox (192.168.1.137):
pct set 101 --net0 name=eth0,bridge=vmbr0,gw=192.168.1.1,hwaddr=BC:24:11:18:6B:29,ip=192.168.1.151/24,type=veth
pct set 101 --tags '192.168.1.151;community-script;monitoring;visualization'
pct reboot 101
```

### 3. Updated Traefik Configuration
Updated services.yml on both Traefik instances:
```bash
# Traefik 110:
ssh root@192.168.1.137 "pct exec 110 -- sed -i 's|http://192.168.1.101:3000|http://192.168.1.151:3000|g' /etc/traefik/dynamic/services.yml"

# Traefik 121:
ssh root@192.168.1.125 "pct exec 121 -- sed -i 's|http://192.168.1.101:3000|http://192.168.1.151:3000|g' /etc/traefik/dynamic/services.yml"
```

### 4. Cleared ARP Caches
```bash
ssh root@192.168.1.137 "pct exec 110 -- ip neigh flush all"
ssh root@192.168.1.125 "pct exec 121 -- ip neigh flush all"
```

## Final IP Assignments
| Service | LXC | IP | Notes |
|---------|-----|-----|-------|
| Grafana | 101 | 192.168.1.151 | Static in container config |
| Vaultwarden | 140 | 192.168.1.140 | DHCP reservation |
| Traefik Primary | 110 | 192.168.1.110 + .101 (secondary) | |
| Traefik Secondary | 121 | 192.168.1.121 | |

## Prevention
- Avoid hardcoding IPs in container configs that overlap with DHCP ranges
- Use DHCP reservations consistently
- When adding new services, check for IP conflicts before deployment
- Consider standardizing: LXC ID = last octet of IP (e.g., LXC 101 = .101)
