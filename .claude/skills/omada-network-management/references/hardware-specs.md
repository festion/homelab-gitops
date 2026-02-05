# Lakehouse Hardware Reference

## SG3218XP-M2 Switch

### Overview

| Property | Value |
|----------|-------|
| Model | TP-Link SG3218XP-M2 |
| Type | L2+ Managed Switch |
| Ports | 16x 2.5GbE + 2x 10GbE SFP+ |
| PoE | 802.3at/af on ports 1-8 |
| Management | Omada SDN, CLI, SNMP |

### Port Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [1] [2] [3] [4] [5] [6] [7] [8] │ [9] [10][11][12][13][14][15][16] │ [SFP+17] [SFP+18] │
│   PoE ports (802.3at/af)        │     Non-PoE 2.5GbE ports         │    10GbE SFP+     │
└─────────────────────────────────────────────────────────────┘
```

### Specifications

| Spec | Value |
|------|-------|
| Switching Capacity | 120 Gbps |
| Forwarding Rate | 89.28 Mpps |
| MAC Address Table | 16K |
| Jumbo Frames | 9216 bytes |
| VLAN Support | 4K VLANs |

### PoE Specifications

| Spec | Value |
|------|-------|
| Total PoE Budget | 240W |
| PoE Ports | 1-8 |
| PoE Standards | 802.3at (30W), 802.3af (15.4W) |
| Max per Port | 30W (802.3at) |

### CLI Access

| Method | Details |
|--------|---------|
| Console | 38400 baud, 8N1 |
| SSH | Port 22, keyboard-interactive auth |
| Telnet | Port 23 (if enabled) |

### Interface Naming

| Ports | CLI Name |
|-------|----------|
| 1-16 (2.5GbE) | `two-gigabitEthernet 1/0/X` |
| 17-18 (10GbE) | `ten-gigabitEthernet 1/0/17-18` |

---

## EAP773 Access Point (WiFi 7)

### Overview

| Property | Value |
|----------|-------|
| Model | TP-Link EAP773 |
| WiFi Standard | WiFi 7 (802.11be) |
| Classification | BE11000 |
| Bands | Tri-band (2.4GHz + 5GHz + 6GHz) |

### Specifications

| Band | Max Speed | Channels |
|------|-----------|----------|
| 2.4 GHz | 1376 Mbps | 1-11 |
| 5 GHz | 5765 Mbps | 36-165 |
| 6 GHz | 5765 Mbps | 1-233 |

### Physical

| Spec | Value |
|------|-------|
| PoE Standard | 802.3at (PoE+) |
| Max Power Draw | ~25W |
| Mounting | Ceiling/Wall |
| Ethernet | 2.5GbE uplink |

### Controller Requirements

| Port | Protocol | Purpose |
|------|----------|---------|
| 29810 | UDP | Discovery |
| 29811 | TCP | Management |
| 29812 | TCP | Adoption |
| 29813 | TCP | Upgrade |
| 29814 | TCP | Config sync |
| **29817** | TCP | WiFi 7 specific management |

**Note:** Port 29817 is specifically required for EAP773 and other WiFi 7 devices.

---

## EAP225 Access Point (AtticAP)

### Overview

| Property | Value |
|----------|-------|
| Model | TP-Link EAP225 |
| WiFi Standard | WiFi 5 (802.11ac) |
| Classification | AC1350 |
| Bands | Dual-band (2.4GHz + 5GHz) |
| Location | Attic |

### Specifications

| Band | Max Speed |
|------|-----------|
| 2.4 GHz | 450 Mbps |
| 5 GHz | 867 Mbps |

### Power Options

| Method | Details |
|--------|---------|
| 802.3af PoE | 48V via PoE switch (preferred) |
| 24V Passive PoE | Via included adapter |
| Power Adapter | 12V/1.5A DC (included) |

### Physical

| Spec | Value |
|------|-------|
| Max Power Consumption | 12.6W |
| Mounting | Ceiling/Wall |
| Ethernet | Gigabit uplink |

### LED Indicators

| Pattern | Meaning |
|---------|---------|
| Solid Green | Connected to controller |
| Slow Green Flash (4s) | Adopted, lost controller contact |
| Fast Green Flash | Firmware upgrading |
| Solid Red | Error state |

### Network Defaults

| Property | Value |
|----------|-------|
| Default IP (no DHCP) | 192.168.0.254 |
| Default Subnet | 255.255.255.0 |
| Default Username | admin |
| Default Password | admin |

---

## Omada SDN Controller

### Deployment (Lakehouse)

| Property | Value |
|----------|-------|
| LXC ID | 111 |
| Node | proxmox3 |
| IP | 192.168.1.47 |
| Version | 6.0.0.24 |

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 2 GB | 4+ GB |
| Disk | 10 GB | 20+ GB |

### Ports Used

| Port | Protocol | Purpose |
|------|----------|---------|
| 8043 | HTTPS | Web management |
| 8088 | HTTP | Web management (if enabled) |
| 29810 | UDP | Device discovery |
| 29811 | TCP | Device management |
| 29812 | TCP | Device adoption |
| 29813 | TCP | Firmware upgrade |
| 29814 | TCP | Config sync |
| 29817 | TCP | WiFi 7 management |
| 27001 | TCP | MongoDB (internal) |

### File Locations

| Purpose | Path |
|---------|------|
| Installation | `/opt/tplink/EAPController/` |
| Logs | `/opt/tplink/EAPController/logs/` |
| Data | `/opt/tplink/EAPController/data/` |
| MongoDB | `/opt/tplink/EAPController/data/db/` |

### Service Management

```bash
# Status
systemctl status omada

# Start/Stop/Restart
systemctl start omada
systemctl stop omada
systemctl restart omada

# Logs
journalctl -u omada -f
tail -f /opt/tplink/EAPController/logs/server.log
```

---

## Network Diagram

```
                    ┌─────────────────┐
                    │   Firewalla     │
                    │  192.168.1.1    │
                    │    (Gateway)    │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │  SG3218XP-M2    │
                    │  (Core Switch)  │
                    │   L2+ Managed   │
                    │   240W PoE      │
                    └──┬─────────┬────┘
                       │         │
            ┌──────────┴───┐ ┌───┴──────────┐
            │   EAP773     │ │   EAP225     │
            │  (Main AP)   │ │  (AtticAP)   │
            │   WiFi 7     │ │   WiFi 5     │
            └──────────────┘ └──────────────┘
```
