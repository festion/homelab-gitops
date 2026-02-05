# VLAN and Spanning Tree Configuration Patterns

## RSTP Migration

### Mode Selection

1. Navigate to **Network Config → Network Settings → LAN → Switch Settings**
2. Under Spanning Tree Protocol, select **RSTP** (Rapid Spanning Tree Protocol)
3. Click **Apply**

### Why RSTP over STP

| Feature | STP | RSTP |
|---------|-----|------|
| Convergence Time | 30-50 seconds | 1-2 seconds |
| Port States | 5 (Blocking, Listening, Learning, Forwarding, Disabled) | 3 (Discarding, Learning, Forwarding) |
| Topology Change | Slow | Fast |

---

## Bridge Priority Configuration

### Setting Root Bridge

The switch with the **lowest priority** becomes the Root Bridge.

**Recommended Configuration:**
- SG3218XP-M2 (Core Switch): Priority **4096** (ensures root bridge)
- Other switches: Default (32768) or higher

### Configuration via GUI

1. **Devices → [Switch] → Manage Device → STP Settings**
2. Set **Priority** to 4096
3. Click **Apply**

### Configuration via CLI

```bash
enable
configure
spanning-tree priority 4096
end
write
```

### Verify Root Bridge Status

```bash
show spanning-tree summary
show spanning-tree root
```

Expected output for root bridge:
```
This bridge is the root
```

---

## Per-Port STP Settings

### Edge Ports

Edge ports connect to end devices (computers, printers) that will never cause STP loops. Setting a port as Edge enables immediate forwarding without STP convergence delay.

**Ports to configure as Edge (Lakehouse):**
- Port 3
- Port 8

### GUI Configuration

1. **Devices → [Switch] → Manage Device → Ports**
2. Select the port
3. Under STP settings, enable **Admin Edge**
4. Click **Apply**

### CLI Configuration

```bash
enable
configure
interface two-gigabitEthernet 1/0/3
spanning-tree portfast
exit
interface two-gigabitEthernet 1/0/8
spanning-tree portfast
exit
end
write
```

### Why Ports 3 and 8?

These ports connect to devices that send LLDP-MED (Link Layer Discovery Protocol - Media Endpoint Discovery) which can trigger unnecessary topology changes. Setting them as Edge ports mitigates this issue.

---

## VLAN Configuration

### Creating VLANs in Omada

1. **Network Config → Network Settings → LAN**
2. Click **Create New LAN**
3. Configure:
   - Name: Descriptive name
   - VLAN ID: 2-4094
   - Purpose: LAN (for regular use)
   - Gateway/Subnet: If routing needed
4. Click **Save**

### Port VLAN Assignment

#### Access Port (Single VLAN)

1. **Devices → [Switch] → Manage Device → Ports**
2. Select port
3. Profile: Create or select profile with:
   - Type: Access
   - Native VLAN: [Your VLAN ID]

#### Trunk Port (Multiple VLANs)

1. Same path as above
2. Profile settings:
   - Type: Trunk
   - Native VLAN: Usually VLAN 1
   - Allowed VLANs: Specify VLAN list

---

## Omada-Specific Quirks

### Duplicate Template Bug

When viewing switch configurations, you may see redundant lines like:
```
no protocol-vlan template 1
no protocol-vlan template 1
```

**Resolution**: Ignore these - they're cosmetic issues in the configuration display and don't affect operation.

### PVID/Tagging Behavior

When using port profiles with "All" VLAN setting:

- Setting a port's **PVID** (Native VLAN) automatically:
  - **Untags** that VLAN on the port
  - **Tags** all other allowed VLANs

**Example:**
- Port assigned VLAN profile "All" with PVID = 10
- VLAN 10: Untagged (access traffic)
- VLANs 1, 20, 30, etc.: Tagged (trunk traffic)

---

## IGMP Snooping

### Purpose

IGMP Snooping optimizes multicast traffic by only sending multicast streams to ports that have requested them.

### Configuration

1. **Network Config → Network Settings → LAN → [VLAN Name]**
2. Enable **IGMP Snooping**
3. Configure **IGMP Querier**: 192.168.1.1 (Firewalla gateway)
4. Click **Save**

### Per-VLAN Settings

Enable IGMP Snooping individually for each VLAN that carries multicast traffic (streaming, discovery protocols).

### CLI Verification

```bash
show igmp-snooping
show igmp-snooping vlan 1
```

---

## Troubleshooting STP

### Port in Blocking/Discarding State

**Symptoms:**
- No traffic passing through port
- `show spanning-tree interface` shows "Discarding" or "Blocking"

**Diagnosis:**

```bash
show spanning-tree interface two-gigabitEthernet 1/0/3
```

Look for:
- **Role**: Should be "Designated" or "Root", not "Alternate" or "Backup"
- **State**: Should be "Forwarding", not "Discarding"

**Common Causes:**
1. Loop detected (legitimate STP operation)
2. LLDP-MED causing topology changes
3. Incorrect priority causing wrong root bridge

**Solutions:**

1. **For end devices**: Set port as Admin Edge
   ```bash
   interface two-gigabitEthernet 1/0/3
   spanning-tree portfast
   ```

2. **Disable LLDP on problematic ports:**
   - GUI: Devices → Switch → Manage Device → LLDP-MED → Disable per-port
   - CLI:
     ```bash
     interface two-gigabitEthernet 1/0/3
     no lldp transmit
     no lldp receive
     ```

3. **Verify no actual loop exists** before making changes

### Frequent Topology Changes

**Diagnosis:**

```bash
show spanning-tree detail
```

Look for "Topology Change Count" - high numbers indicate instability.

**Solutions:**
- Identify and set edge ports
- Check for flapping links
- Verify consistent STP mode across all switches
