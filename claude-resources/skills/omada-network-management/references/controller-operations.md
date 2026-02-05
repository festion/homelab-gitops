# Omada SDN Controller Operations

## Device Adoption Workflow

### Step 1: Discovery

For devices on different subnets, DHCP Option 138 must point to the controller IP.

**Kea DHCP Configuration:**
- Option 138 value: `192.168.1.47`
- Configured on both Kea servers (192.168.1.133 and 192.168.1.134)

Devices on the same subnet will discover the controller via broadcast.

### Step 2: Identification

1. Navigate to **Devices** in the left menu
2. Select the **Pending** tab
3. Use **Batch Adopt** action for multiple devices

### Step 3: Credentials

If device status shows **"Managed by Others"**:

1. Go to **Settings → Site → Device Account**
2. Copy the "Device Account" password
3. Enter this password when prompted during adoption

### Step 4: Provisioning

Monitor the status progression:
```
Pending → Adopting → Provisioning → Connected
```

This typically takes 1-3 minutes per device.

---

## GUI Navigation Paths (v6+)

### Network Configuration

| Task | Path |
|------|------|
| VLAN Management | Network Config → Network Settings → LAN |
| Switch Settings | Network Config → Network Settings → LAN → Switch Settings |
| DHCP Settings | Network Config → Network Settings → LAN → DHCP |
| Port Profiles | Network Config → Network Settings → Wired Networks → Port Profiles |

### Device Management

| Task | Path |
|------|------|
| Port Configuration | Devices → [Switch Name] → Manage Device (Drawer) → Ports |
| Device Info | Devices → [Device Name] → Properties |
| Firmware Update | Devices → [Device Name] → Config → Firmware |
| LED Control | Devices → [Device Name] → Config → LED |

### Site Settings

| Task | Path |
|------|------|
| Site Services | Settings → Site → Services |
| NTP Settings | Settings → Site → Services → NTP |
| LED Control (Global) | Settings → Site → Services → LED |
| Device Account | Settings → Site → Device Account |

### Platform Integration

| Task | Path |
|------|------|
| Open API Setup | Global View → Settings → Platform Integration → Open API |
| API Clients | Global View → Settings → Platform Integration → Open API → Clients |

---

## Backup & Restore Procedures

### Creating a Backup

1. Navigate to **Settings → Maintenance → Backup & Restore**
2. Click **Backup**
3. Select backup type:
   - **Settings Only**: Configuration backup (recommended for most cases)
   - **All Data**: Includes logs and statistics
4. Download the `.cfg` file

**Backup Location (Lakehouse):**
```
/home/dev/workspace/backups/omada/
```

### Restoring from Backup

1. Navigate to **Settings → Maintenance → Backup & Restore**
2. Click **Browse** and select the `.cfg` file
3. Click **Restore**

**Important Notes:**
- Controller will reboot upon completion
- All current settings will be replaced
- Devices may need to re-provision after restore

### Automated Backup Script

```bash
# Example backup command (requires API setup)
curl -k -X GET "https://192.168.1.47:8043/api/v2/backup" \
  -H "Authorization: AccessToken=YOUR_TOKEN" \
  -o "omada_backup_$(date +%Y%m%d).cfg"
```

---

## Controller Maintenance

### Restart Controller Service

```bash
# SSH to controller
ssh root@omada-controller.mgmt.lakehouse.wtf

# Restart Omada service
systemctl restart omada

# Check status
systemctl status omada
```

### View Controller Logs

```bash
# Main application logs
tail -f /opt/tplink/EAPController/logs/server.log

# MongoDB logs (database)
tail -f /opt/tplink/EAPController/data/db/mongod.log
```

### Controller Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 8043 | HTTPS | Web management (default) |
| 8088 | HTTP | Web management (if enabled) |
| 29810 | UDP | EAP discovery |
| 29811 | TCP | EAP management |
| 29812 | TCP | EAP adoption |
| 29813 | TCP | EAP upgrade |
| 29814 | TCP | EAP config sync |
| 29817 | TCP | EAP773/WiFi 7 management |
| 27001 | TCP | MongoDB |

---

## Firmware Management

### Check for Updates

1. Go to **Devices → [Device Name] → Config → Firmware**
2. Click **Check for Update**

### Batch Firmware Update

1. Go to **Devices**
2. Select multiple devices
3. Click **Batch Actions → Update Firmware**

### Manual Firmware Upload

For offline or beta firmware:
1. Download firmware from TP-Link support site
2. Go to **Devices → [Device] → Config → Firmware**
3. Click **Local Upgrade**
4. Select the firmware file

**Lakehouse Firmware Storage:**
```
/home/dev/workspace/Omada_firmware/
```
