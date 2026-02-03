# Kea DHCP Reservations Comparison Report

**Date:** 2025-11-12 19:25 UTC  
**Servers Compared:** 192.168.1.133 vs 192.168.1.134  
**Status:** ⚠️ CRITICAL IP CONFLICT FOUND

---

## Executive Summary

Both Kea DHCP servers have **50 static reservations** each, but there is **one critical discrepancy** that creates an **IP address conflict** for `192.168.1.74`.

### Quick Status
- ✅ **Total Reservations:** 50 on each server (correct)
- ✅ **Matching Reservations:** 49 reservations are identical
- ❌ **Conflicting Reservations:** 1 reservation differs (IP 192.168.1.74)
- ⚠️ **Impact:** Potential IP conflict and HA inconsistency

---

## Critical Finding: IP Address Conflict

### The Problem

**IP Address:** 192.168.1.74  
**Conflict:** Assigned to TWO different devices on different servers

### Server 1 (192.168.1.133) - Primary

```json
{
  "hw-address": "bc:24:11:16:c6:92",
  "ip-address": "192.168.1.74",
  "hostname": "influxdb"
}
```

**Device:** InfluxDB database server  
**MAC Address:** bc:24:11:16:c6:92  
**Purpose:** Time-series database (likely used for Home Assistant metrics)

### Server 2 (192.168.1.134) - Secondary

```json
{
  "hw-address": "a8:29:48:c0:01:60",
  "ip-address": "192.168.1.74",
  "hostname": "eap773-a8-29-48-c0-01-60"
}
```

**Device:** TP-Link EAP773 WiFi Access Point  
**MAC Address:** a8:29:48:c0:01:60  
**Purpose:** Wireless access point for network connectivity

---

## Impact Analysis

### Current State

Due to HA load-balancing mode, both servers are actively responding to DHCP requests. This means:

1. **Unpredictable Assignment:**
   - InfluxDB (bc:24:11:16:c6:92) might get 192.168.1.74 from Server 1
   - EAP773 AP (a8:29:48:c0:01:60) might get 192.168.1.74 from Server 2
   - Which device gets the IP depends on load balancing hash

2. **Potential IP Collision:**
   - Both devices could end up requesting 192.168.1.74
   - Could cause network connectivity issues
   - May result in IP conflict warnings

3. **HA Synchronization Issues:**
   - When one server allocates the lease, it notifies the partner
   - Partner may reject the lease update due to conflicting reservation
   - Could cause HA state inconsistencies

### Observed Behavior

Looking at the lease database from earlier:
- Neither device currently has an active lease for .74
- This suggests neither device is currently online or recently renewed

**This is fortunate** - it means the conflict hasn't manifested yet, but it WILL when either device comes online.

---

## Resolution Required

You need to decide which device should have 192.168.1.74 and assign a new IP to the other device.

### Option 1: Keep InfluxDB on .74 (Recommended)

**Reasoning:**
- InfluxDB is a critical infrastructure service
- Database servers typically benefit from stable, memorable IPs
- InfluxDB is likely referenced in Home Assistant and other configs

**Actions:**
1. Keep InfluxDB reservation on Server 1 (already correct)
2. Add InfluxDB reservation to Server 2
3. Assign new IP to EAP773 AP (suggestion: use next available IP)
4. Remove EAP773 .74 reservation from Server 2

**New EAP773 IP Suggestions:**
- 192.168.1.73 (appears available)
- 192.168.1.76 (appears available)
- 192.168.1.79 (appears available)

### Option 2: Keep EAP773 on .74

**Reasoning:**
- EAP773 is network infrastructure
- May already be configured with .74 in Omada controller
- Network devices sometimes benefit from specific IP ranges

**Actions:**
1. Keep EAP773 reservation on Server 2 (already correct)
2. Add EAP773 reservation to Server 1
3. Assign new IP to InfluxDB
4. Remove InfluxDB .74 reservation from Server 1
5. **Update all references to InfluxDB IP** (Home Assistant, Grafana, etc.)

### Recommendation

**Go with Option 1 (InfluxDB keeps .74)** because:
- Database services are harder to reconfigure
- Likely more references to InfluxDB IP throughout your infrastructure
- Access points can handle IP changes more easily
- Can update Omada controller with new AP IP easily

---

## All Static Reservations

### Complete List (49 Matching + 1 Conflicting)

Below is the complete list of reservations that match on both servers:

| IP Address | MAC Address | Hostname | Type |
|------------|-------------|----------|------|
| 192.168.1.10 | c0:f8:53:08:d6:ba | wlan0 | WiFi Device |
| 192.168.1.12 | c0:f8:53:08:d5:43 | rgbcw-lightbulb7 | Smart Light |
| 192.168.1.14 | 10:52:1c:4d:a2:6a | rgbcw-lightbulb6 | Smart Light |
| 192.168.1.19 | c0:f8:53:08:cd:60 | rgbcw-lightbulb5 | Smart Light |
| 192.168.1.25 | 4c:ba:d7:df:7f:38 | lgwebostv | LG TV |
| 192.168.1.26 | c0:f8:53:08:ba:99 | rgbcw-lightbulb2 | Smart Light |
| 192.168.1.34 | 28:6b:b4:37:81:f4 | samsung-dryer | Samsung Dryer |
| 192.168.1.43 | 8c:bf:ea:cf:8b:d0 | xiao-ble-proxy3 | BLE Proxy |
| 192.168.1.44 | 8c:bf:ea:cf:72:74 | xiao-ble-proxy1 | BLE Proxy |
| 192.168.1.49 | 6c:c8:40:87:a6:d8 | lindaroom-ble-proxy | BLE Proxy |
| 192.168.1.51 | fc:0f:e7:91:70:41 | hydrawise-7041 | Irrigation Controller |
| 192.168.1.54 | e4:b0:63:89:4a:80 | curatron-esp | ESP Device |
| 192.168.1.57 | c0:f8:53:08:c8:21 | rgbcw-lightbulb4 | Smart Light |
| 192.168.1.60 | c0:f8:53:08:d7:04 | rgbcw-lightbulb10 | Smart Light |
| 192.168.1.66 | 6c:c8:40:86:78:7c | upstairs-ble-proxy | BLE Proxy |
| 192.168.1.70 | c0:f8:53:08:ce:55 | rgbcw-lightbulb3 | Smart Light |
| 192.168.1.72 | 8c:bf:ea:cf:85:30 | xiao-ble-proxy2 | BLE Proxy |
| **192.168.1.74** | **bc:24:11:16:c6:92** | **influxdb** (Server 1) | **CONFLICT** |
| **192.168.1.74** | **a8:29:48:c0:01:60** | **eap773-a8-29-48-c0-01-60** (Server 2) | **CONFLICT** |
| 192.168.1.75 | f8:17:2d:91:b6:a8 | 192-168-1-75 | Unknown Device |
| 192.168.1.77 | c0:f8:53:08:d2:95 | rgbcw-lightbulb1 | Smart Light |
| 192.168.1.78 | 94:54:c5:ea:35:23 | slzb-06 | Zigbee Coordinator |
| 192.168.1.80 | b8:27:eb:4a:94:d5 | birdnet-go | BirdNET Device |
| 192.168.1.82 | 6c:2a:df:e0:17:f1 | tempest-hb-00147807 | Weather Station |
| 192.168.1.86 | 38:2c:e5:fb:a5:4a | globe-g1-litter-box | Smart Litter Box |
| 192.168.1.88 | c0:f8:53:08:cc:85 | rgbcw-lightbulb8 | Smart Light |
| 192.168.1.89 | 6c:c8:40:88:44:6c | hobbyroom-ble-proxy | BLE Proxy |
| 192.168.1.91 | 6c:c8:40:4f:b0:d0 | gavinroom-ble-proxy | BLE Proxy |
| 192.168.1.92 | 8c:4f:00:30:5f:b8 | wroommicrousb | ESP Device |
| 192.168.1.93 | f0:24:f9:7a:49:54 | masterroom-ble-proxy2 | BLE Proxy |
| 192.168.1.96 | e4:b0:63:b3:dd:dc | bleproxy-with-lux | BLE Proxy |
| 192.168.1.105 | 94:54:c5:a8:14:98 | masterroom-ble-proxy1 | BLE Proxy |
| 192.168.1.111 | f8:17:2d:dc:fc:5a | lwip0 | Network Device |
| 192.168.1.120 | 48:e1:e9:89:a1:11 | meross-smart-garage | Smart Garage Opener |
| 192.168.1.126 | 80:3f:5d:d3:2c:5a | proxmox3 | Proxmox Server |
| 192.168.1.132 | bc:24:11:98:17:74 | uptime-kuma | Monitoring System |
| 192.168.1.135 | bc:24:11:93:14:76 | wikijs | Wiki Platform |
| 192.168.1.136 | bc:24:11:b1:db:86 | gitopsdashboard | GitOps Dashboard |
| 192.168.1.138 | bc:24:11:f6:ea:8a | netbox | Network Documentation |
| 192.168.1.139 | bc:24:11:86:8a:c3 | infisical | Secrets Manager |
| 192.168.1.145 | bc:24:11:d8:04:43 | debian | Linux Server |
| 192.168.1.146 | b8:27:eb:07:c2:e3 | quorum-pi | Raspberry Pi |
| 192.168.1.148 | bc:24:11:9b:42:07 | mqtt-prod | MQTT Broker |
| 192.168.1.165 | 6c:c8:40:87:34:8c | guestroom-ble-proxy | BLE Proxy |
| 192.168.1.187 | c0:f8:53:08:ce:7f | rgbcw-lightbulb11 | Smart Light |
| 192.168.1.191 | bc:24:11:b0:ba:ef | esphome | ESPHome Server |
| 192.168.1.200 | 02:f9:c4:bc:28:31 | docker | Docker Container |
| 192.168.1.224 | bc:24:11:45:fc:44 | adguard-2 | DNS Server |
| 192.168.1.225 | bc:24:11:e5:dd:9f | adguard-sync | DNS Sync |
| 192.168.1.234 | bc:24:11:e5:ef:c8 | stork-server | Kea Monitoring |
| 192.168.1.235 | cc:8c:bf:65:87:ca | 192-168-1-235 | Unknown Device |

### Device Categories Summary

| Category | Count |
|----------|-------|
| Smart Lights (RGBCW) | 11 |
| BLE Proxies | 8 |
| Infrastructure Services | 13 |
| Smart Home Devices | 5 |
| Network Equipment | 4 |
| Servers/VMs | 6 |
| Other | 3 |

---

## Step-by-Step Fix Instructions

### Recommended Fix: Keep InfluxDB on .74

#### Step 1: Check Which Device Currently Has .74

```bash
# Check current lease holder
ssh root@192.168.1.133 "cat /var/lib/kea/kea-leases4.csv | grep '192.168.1.74'"

# Ping to see if device is online
ping -c 3 192.168.1.74

# Check ARP to see MAC address
ip neigh | grep 192.168.1.74
```

#### Step 2: Choose New IP for EAP773

Based on your current allocations, available IPs near .74:
- 192.168.1.73 ✅ (available)
- 192.168.1.76 ✅ (available)  
- 192.168.1.79 ✅ (available)
- 192.168.1.81 ✅ (available)

**Recommendation:** Use 192.168.1.73 (keeps AP near database in IP space)

#### Step 3: Update Server 2 Configuration

```bash
# SSH to secondary server
ssh root@192.168.1.134

# Backup current config
cp /etc/kea/kea-dhcp4.conf /etc/kea/kea-dhcp4.conf.backup-$(date +%Y%m%d-%H%M%S)

# Edit the configuration
nano /etc/kea/kea-dhcp4.conf
```

**Find this entry:**
```json
{
  "hw-address": "a8:29:48:c0:01:60",
  "ip-address": "192.168.1.74",
  "hostname": "eap773-a8-29-48-c0-01-60"
}
```

**Change to:**
```json
{
  "hw-address": "a8:29:48:c0:01:60",
  "ip-address": "192.168.1.73",
  "hostname": "eap773-a8-29-48-c0-01-60"
}
```

**Add the InfluxDB reservation (should be after line ~21):**
```json
{
  "hw-address": "bc:24:11:16:c6:92",
  "ip-address": "192.168.1.74",
  "hostname": "influxdb"
},
```

#### Step 4: Validate Configuration

```bash
# Check JSON syntax
kea-dhcp4 -t /etc/kea/kea-dhcp4.conf

# Should output: Configuration seems sane
```

#### Step 5: Restart Kea Service

```bash
systemctl restart isc-kea-dhcp4-server

# Check status
systemctl status isc-kea-dhcp4-server

# Verify no errors in logs
journalctl -u isc-kea-dhcp4-server -n 50
```

#### Step 6: Verify HA Synchronization

```bash
# Check HA status
curl -X POST -H "Content-Type: application/json" \
  -d '{"command":"status-get","service":["dhcp4"]}' \
  http://127.0.0.1:8001/

# Should show state: "load-balancing"
```

#### Step 7: Update Primary Server (Add EAP773 with New IP)

```bash
# SSH to primary server
ssh root@192.168.1.133

# Backup config
cp /etc/kea/kea-dhcp4.conf /etc/kea/kea-dhcp4.conf.backup-$(date +%Y%m%d-%H%M%S)

# Edit configuration
nano /etc/kea/kea-dhcp4.conf
```

**Add this entry (after the influxdb reservation):**
```json
{
  "hw-address": "a8:29:48:c0:01:60",
  "ip-address": "192.168.1.73",
  "hostname": "eap773-a8-29-48-c0-01-60"
},
```

**Validate and restart:**
```bash
kea-dhcp4 -t /etc/kea/kea-dhcp4.conf
systemctl restart isc-kea-dhcp4-server
systemctl status isc-kea-dhcp4-server
```

#### Step 8: Update Omada Controller

If you manage the EAP773 through TP-Link Omada controller:

1. Log into Omada controller
2. Navigate to Devices → Access Points
3. Find EAP773 (MAC: a8:29:48:c0:01:60)
4. Update IP address to 192.168.1.73
5. Or set to DHCP and let it get the new reservation

#### Step 9: Force DHCP Renewal

If EAP773 is currently online with .74:

**Option A: From AP Console (if accessible)**
```bash
# SSH to the AP (if possible)
ssh admin@192.168.1.74
# Release and renew DHCP
dhclient -r && dhclient
```

**Option B: Reboot the AP**
- From Omada controller: Devices → EAP773 → Reboot
- Or physically power cycle the AP

**Option C: Remove old lease**
```bash
# On both Kea servers
ssh root@192.168.1.133 "sed -i '/a8:29:48:c0:01:60/d' /var/lib/kea/kea-leases4.csv"
ssh root@192.168.1.134 "sed -i '/a8:29:48:c0:01:60/d' /var/lib/kea/kea-leases4.csv"
```

#### Step 10: Verify Resolution

```bash
# Check that both servers now have identical reservations
ssh root@192.168.1.133 "grep -c 'hw-address' /etc/kea/kea-dhcp4.conf"
ssh root@192.168.1.134 "grep -c 'hw-address' /etc/kea/kea-dhcp4.conf"
# Both should show: 51 (50 original + 1 added)

# Verify no .74 conflicts
ssh root@192.168.1.133 "grep '192.168.1.74' /etc/kea/kea-dhcp4.conf"
# Should only show influxdb

ssh root@192.168.1.134 "grep '192.168.1.74' /etc/kea/kea-dhcp4.conf"
# Should only show influxdb

# Verify EAP773 on new IP
ssh root@192.168.1.133 "grep 'a8:29:48:c0:01:60' /etc/kea/kea-dhcp4.conf"
ssh root@192.168.1.134 "grep 'a8:29:48:c0:01:60' /etc/kea/kea-dhcp4.conf"
# Both should show: 192.168.1.73

# Test connectivity
ping -c 3 192.168.1.73  # EAP773 should respond here
ping -c 3 192.168.1.74  # InfluxDB should respond here (if online)
```

---

## Configuration Management Recommendations

To prevent configuration drift in the future:

### Option 1: Git-Based Configuration Management

```bash
# On your management workstation
mkdir -p ~/kea-dhcp-config
cd ~/kea-dhcp-config
git init

# Create a master config
nano kea-dhcp4-template.conf
# (Create config with all reservations)

# Generate server-specific configs
sed 's/this-server-name": "REPLACEME"/this-server-name": "kea-dhcp-1"/' \
  kea-dhcp4-template.conf > kea-dhcp4-server1.conf

sed 's/this-server-name": "REPLACEME"/this-server-name": "kea-dhcp-2"/' \
  kea-dhcp4-template.conf > kea-dhcp4-server2.conf

# Deploy
scp kea-dhcp4-server1.conf root@192.168.1.133:/etc/kea/kea-dhcp4.conf
scp kea-dhcp4-server2.conf root@192.168.1.134:/etc/kea/kea-dhcp4.conf

# Restart both
ssh root@192.168.1.133 "systemctl restart isc-kea-dhcp4-server"
ssh root@192.168.1.134 "systemctl restart isc-kea-dhcp4-server"

# Commit changes
git add .
git commit -m "Resolved IP conflict for .74"
git push
```

### Option 2: Ansible Playbook

```yaml
# kea-dhcp-deploy.yml
---
- name: Deploy Kea DHCP Configuration
  hosts: kea_servers
  become: yes
  tasks:
    - name: Backup current configuration
      copy:
        src: /etc/kea/kea-dhcp4.conf
        dest: "/etc/kea/kea-dhcp4.conf.backup.{{ ansible_date_time.epoch }}"
        remote_src: yes
        
    - name: Deploy Kea configuration
      template:
        src: kea-dhcp4.conf.j2
        dest: /etc/kea/kea-dhcp4.conf
        validate: 'kea-dhcp4 -t %s'
        
    - name: Restart Kea service
      systemd:
        name: isc-kea-dhcp4-server
        state: restarted
        
    - name: Verify service status
      systemd:
        name: isc-kea-dhcp4-server
        state: started
```

### Option 3: Configuration Sync Script

```bash
#!/bin/bash
# sync-kea-config.sh

PRIMARY="192.168.1.133"
SECONDARY="192.168.1.134"

# Read config from primary
ssh root@$PRIMARY "cat /etc/kea/kea-dhcp4.conf" > /tmp/kea-config-primary.json

# Modify server name for secondary
sed 's/"kea-dhcp-1"/"kea-dhcp-2"/' /tmp/kea-config-primary.json > /tmp/kea-config-secondary.json

# Deploy to secondary
scp /tmp/kea-config-secondary.json root@$SECONDARY:/tmp/kea-dhcp4.conf.new

# Validate on secondary
ssh root@$SECONDARY "kea-dhcp4 -t /tmp/kea-dhcp4.conf.new"

if [ $? -eq 0 ]; then
  ssh root@$SECONDARY "cp /etc/kea/kea-dhcp4.conf /etc/kea/kea-dhcp4.conf.backup && \
                        mv /tmp/kea-dhcp4.conf.new /etc/kea/kea-dhcp4.conf && \
                        systemctl restart isc-kea-dhcp4-server"
  echo "Configuration synced successfully"
else
  echo "Validation failed, not deploying"
  exit 1
fi
```

---

## Summary

### Current State
- ✅ Both servers have 50 reservations
- ❌ One IP conflict exists (192.168.1.74)
- ⚠️ Conflict between InfluxDB and EAP773 AP

### Required Actions
1. Decide which device keeps .74 (recommended: InfluxDB)
2. Assign new IP to other device (recommended: EAP773 → .73)
3. Update both server configurations
4. Verify HA synchronization
5. Update network infrastructure (Omada controller)
6. Implement configuration management to prevent future drift

### Priority
**HIGH** - This should be resolved soon to prevent potential IP conflicts when devices renew leases.

---

**Report Generated:** 2025-11-12 19:25 UTC  
**Next Steps:** Resolve IP conflict following the instructions above  
**Estimated Time:** 15-30 minutes
