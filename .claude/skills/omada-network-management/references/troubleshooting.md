# Omada Troubleshooting Guide

## Common Issues & Resolutions

---

## Device Adoption Issues

### Device Won't Appear in Pending

**Symptoms:**
- New device powered on but not showing in Devices → Pending

**Diagnosis:**
1. Check device has valid IP (same subnet or DHCP Option 138 configured)
2. Verify network connectivity to controller
3. Check controller ports are accessible

**Solutions:**

1. **Same Subnet**: Device should auto-discover
2. **Different Subnet**: Verify DHCP Option 138
   ```bash
   # On Kea DHCP server (192.168.1.133)
   grep -A5 "option-data" /etc/kea/kea-dhcp4.conf | grep -A2 "138"
   ```
3. **Manual Discovery**: Set controller URL on device via its local web UI

### "Managed by Others" Status

**Symptoms:**
- Device shows in Pending but says "Managed by Others"

**Solution:**
1. Go to **Settings → Site → Device Account**
2. Copy the password
3. Enter this password when adopting the device

### Stuck in "Provisioning"

**Symptoms:**
- Device cycles between Adopting and Provisioning for >5 minutes

**Solutions:**
1. Check controller logs for errors
2. Verify device firmware is compatible with controller version
3. Try factory reset on the device and re-adopt

---

## STP Blocking Issues

### Ports in Discarding State

**Symptoms:**
- Port shows link but no traffic passes
- Status shows "Blocking" or "Discarding"

**Diagnosis:**

```bash
# Via CLI
show spanning-tree interface two-gigabitEthernet 1/0/3
```

Look for:
- **State**: Discarding (problem) vs Forwarding (good)
- **Role**: Alternate/Backup (blocking) vs Root/Designated (forwarding)

**Solutions:**

#### For End Devices (Ports 3 & 8 in Lakehouse)

Set as Admin Edge port:

**GUI:**
1. Devices → [Switch] → Manage Device → Ports
2. Select port → STP Settings → Enable Admin Edge

**CLI:**
```bash
enable
configure
interface two-gigabitEthernet 1/0/3
spanning-tree portfast
exit
end
write
```

#### For LLDP-MED Causing Issues

Disable LLDP on the port:
1. Devices → [Switch] → Manage Device → LLDP-MED
2. Disable on affected ports

Or via CLI:
```bash
interface two-gigabitEthernet 1/0/3
no lldp transmit
no lldp receive
```

---

## Client Identification Issues

### Firewalla Misidentified as Client

**Symptoms:**
- Firewalla shows as regular client instead of router/gateway
- May affect traffic statistics or policies

**Solution:**
1. Go to **Clients** tab
2. Find Firewalla device
3. Click to open details
4. Go to **Config** tab
5. Under **Client Type**, select **Router/Gateway**
6. Save

---

## SSH/Console Access Issues

### PuTTY SSH Authentication Failures

**Symptoms:**
- PuTTY connects but authentication fails
- "No supported authentication methods available"

**Solution 1: Enable Keyboard-Interactive**
1. In PuTTY, go to Connection → SSH → Auth
2. Check "Attempt authentication using Pageant"
3. Check "Attempt keyboard-interactive auth"

**Solution 2: Use OpenSSH with Legacy Algorithms**
```bash
ssh -o HostKeyAlgorithms=+ssh-rsa \
    -o PubkeyAcceptedKeyTypes=+ssh-rsa \
    admin@192.168.1.XX
```

**Solution 3: Update SSH Config**
Add to `~/.ssh/config`:
```
Host omada-switch
    HostName 192.168.1.XX
    User admin
    HostKeyAlgorithms +ssh-rsa
    PubkeyAcceptedKeyTypes +ssh-rsa
```

---

## Access Point Issues

### EAP225 (AtticAP) Recovery

#### LED Status Indicators

| LED Pattern | Meaning |
|-------------|---------|
| Solid Green | Normal operation, connected |
| Slow Green Flash (4s interval) | Adopted but lost controller contact |
| Fast Green Flash | Firmware upgrading |
| Solid Red | Hardware error |
| Off | No power or LED disabled |

#### Slow Green Flash (Lost Controller)

**Cause:** Device was adopted but can't reach controller

**Solutions:**
1. Check network connectivity
2. Verify DHCP is working (device gets IP)
3. Check DHCP Option 138 is set correctly
4. Check controller service is running
5. Factory reset if needed (hold reset 7+ seconds)

#### Default IP (No DHCP)

If DHCP fails, EAP225 defaults to:
- **IP**: 192.168.0.254
- **Subnet**: 255.255.255.0

To access:
1. Set your computer to 192.168.0.100/24
2. Connect directly to AP
3. Browse to http://192.168.0.254
4. Configure static IP or fix DHCP

### EAP773 (WiFi 7) Specific

**Port Requirements:**
- TCP 29817 must be accessible for management
- Verify firewall allows this port to controller

---

## Controller Issues

### Web UI Inaccessible

**Diagnosis:**
```bash
# Check service status
ssh root@omada-controller.mgmt.lakehouse.wtf
systemctl status omada

# Check listening ports
ss -tlnp | grep -E "8043|8088"

# Check logs
tail -50 /opt/tplink/EAPController/logs/server.log
```

**Solutions:**
1. Restart service: `systemctl restart omada`
2. Check MongoDB: `systemctl status mongod`
3. Verify sufficient disk space: `df -h`

### High Memory Usage

**Diagnosis:**
```bash
free -h
top
```

**Solutions:**
1. Reduce log retention in Settings → Maintenance → Log
2. Restart controller to clear memory
3. Increase container RAM allocation

---

## Network Performance Issues

### Slow WiFi Speeds

**Diagnosis:**
1. Check client signal strength in Clients tab
2. Review channel utilization in Dashboard
3. Check for interference

**Solutions:**
1. Adjust channel settings (auto or manual)
2. Adjust transmit power
3. Check for rogue APs
4. Enable band steering if not already

### PoE Budget Exceeded

**Symptoms:**
- Devices randomly losing power
- PoE warning in alerts

**Diagnosis:**
```bash
show power inline
```

**SG3218XP-M2 PoE Specs:**
- Total budget: 240W
- Ports 1-8: 802.3at (30W) and 802.3af (15.4W)

**Solutions:**
1. Prioritize critical devices (Settings → PoE → Priority)
2. Move high-draw devices to dedicated PoE switch
3. Reduce number of PoE devices

---

## Quick Diagnostic Commands

### CLI Quick Health Check

```bash
enable
show system-info
show interface status
show spanning-tree summary
show power inline
show cpu-utilization
show memory
```

### Controller Quick Check

```bash
# Service status
systemctl status omada

# Port listening
ss -tlnp | grep -E "8043|29810|29811|29812"

# Recent logs
tail -20 /opt/tplink/EAPController/logs/server.log

# Disk space
df -h /opt/tplink
```
