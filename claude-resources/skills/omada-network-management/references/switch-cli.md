# SG3218XP-M2 and Omada L2+ CLI Reference

## Interface Identifiers

### SG3218XP-M2 Port Mapping

| Ports | Speed | CLI Interface Name |
|-------|-------|-------------------|
| 1-16 | 2.5GbE | `interface two-gigabitEthernet 1/0/X` |
| 17-18 | 10GbE SFP+ | `interface ten-gigabitEthernet 1/0/17-18` |

### Examples

```bash
# Access 2.5GbE port 5
interface two-gigabitEthernet 1/0/5

# Access 10GbE SFP+ port 17
interface ten-gigabitEthernet 1/0/17

# Access port range
interface range two-gigabitEthernet 1/0/1-8
```

---

## Console Connection

### Serial Parameters

| Parameter | Value |
|-----------|-------|
| Baud Rate | 38400 |
| Data bits | 8 |
| Stop bits | 1 |
| Parity | None |
| Flow Control | None |

### Connection Methods

**Via USB Console:**
```bash
# Linux
screen /dev/ttyUSB0 38400

# macOS
screen /dev/tty.usbserial-* 38400
```

**Via PuTTY (Windows):**
1. Connection type: Serial
2. Serial line: COM# (check Device Manager)
3. Speed: 38400
4. Open

---

## Command Mode Hierarchy

```
User EXEC Mode (>)
    │
    ├── enable
    │
Privileged EXEC Mode (#)
    │
    ├── configure
    │
Global Configuration Mode (config)#
    │
    ├── interface [name]
    │
Interface Configuration Mode (config-if)#
```

### Mode Navigation

```bash
# Enter privileged mode
SG3218XP-M2> enable
Password: [enter password]

# Enter global config
SG3218XP-M2# configure

# Enter interface config
SG3218XP-M2(config)# interface two-gigabitEthernet 1/0/1

# Exit one level
SG3218XP-M2(config-if)# exit

# Return to privileged mode from anywhere
SG3218XP-M2(config-if)# end
```

---

## Diagnostic Commands

### Interface Status

```bash
# Show all port status (link, speed, duplex)
show interface status

# Show specific interface details
show interface two-gigabitEthernet 1/0/1

# Show interface counters
show interface counters

# Show interface errors
show interface counters errors
```

### Spanning Tree

```bash
# Summary of STP status
show spanning-tree summary

# Detailed STP info
show spanning-tree

# Per-interface STP state
show spanning-tree interface two-gigabitEthernet 1/0/3

# Check root bridge
show spanning-tree root
```

### PoE Status

```bash
# Show PoE budget and per-port draw
show power inline

# Show specific port PoE
show power inline two-gigabitEthernet 1/0/1

# Show PoE configuration
show power inline configuration
```

### System Information

```bash
# Comprehensive diagnostic dump
show tech-support

# System information
show system-info

# Running configuration
show running-config

# Startup configuration
show startup-config

# CPU and memory usage
show cpu-utilization
show memory
```

### VLAN Information

```bash
# Show all VLANs
show vlan

# Show specific VLAN
show vlan 10

# Show VLAN membership per port
show vlan brief
```

### MAC Address Table

```bash
# Show all learned MACs
show mac address-table

# Show MACs on specific interface
show mac address-table interface two-gigabitEthernet 1/0/1

# Show MACs in specific VLAN
show mac address-table vlan 10
```

---

## Configuration Commands

### Saving Configuration

```bash
# Full command
copy running-config startup-config

# Abbreviated
write

# Or
write memory
```

### Interface Configuration

```bash
# Enter interface
interface two-gigabitEthernet 1/0/1

# Set description
description "Server-Port-1"

# Enable/disable port
shutdown
no shutdown

# Set speed/duplex (if supported)
speed 1000
duplex full

# Exit interface
exit
```

### VLAN Configuration

```bash
# Create VLAN
vlan 10
name "Servers"
exit

# Assign port to VLAN (access mode)
interface two-gigabitEthernet 1/0/1
switchport mode access
switchport access vlan 10

# Trunk port configuration
interface two-gigabitEthernet 1/0/17
switchport mode trunk
switchport trunk allowed vlan 1,10,20,30
```

### PoE Configuration

```bash
# Enable PoE on port
interface two-gigabitEthernet 1/0/1
power inline auto

# Disable PoE on port
power inline never

# Set PoE priority
power inline priority high
```

---

## Troubleshooting Commands

### Link Issues

```bash
# Check cable diagnostics
cable-diagnostics test two-gigabitEthernet 1/0/1
show cable-diagnostics

# Check for errors
show interface counters errors
```

### STP Issues

```bash
# Check if port is blocking
show spanning-tree interface two-gigabitEthernet 1/0/3

# Expected states:
# - Forwarding: Normal operation
# - Learning: Transitioning
# - Blocking/Discarding: Loop prevention active

# Check topology changes
show spanning-tree detail
```

### Traffic Analysis

```bash
# Enable port mirroring
monitor session 1 source interface two-gigabitEthernet 1/0/1 both
monitor session 1 destination interface two-gigabitEthernet 1/0/16

# Show mirror config
show monitor

# Disable mirroring
no monitor session 1
```

---

## SSH Access Notes

### PuTTY Authentication Issues

If SSH authentication fails with PuTTY:

1. **Method 1**: Enable "Keyboard-interactive" authentication
   - Connection → SSH → Auth → Attempt "keyboard-interactive" auth

2. **Method 2**: Use OpenSSH with legacy algorithms
   ```bash
   ssh -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa admin@switch-ip
   ```

### Default Credentials

| Username | Password |
|----------|----------|
| admin | admin (change on first login) |

After Omada adoption, switch uses the Device Account credentials from the controller.
