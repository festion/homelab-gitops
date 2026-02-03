# Kea DHCP Implementation Validation Report

**Date:** 2025-11-12  
**Servers:** 192.168.1.133 (kea-dhcp-1), 192.168.1.134 (kea-dhcp-2)  
**Kea Version:** 3.0.2  
**Validation Status:** CRITICAL ISSUES FOUND ⚠️

## Executive Summary

Your Kea DHCP implementation has **one server operational and one server FAILED**. This represents a single point of failure in your network infrastructure. The secondary server (192.168.1.134) has been down for 2 days due to a configuration error.

### Quick Status
- ✅ **Server 1** (192.168.1.133): Operational and serving DHCP requests
- ❌ **Server 2** (192.168.1.134): **FAILED** - Cannot bind to port 8000
- ⚠️ **HA Status**: Degraded - Primary detecting communication failure every 10 seconds
- ✅ **DHCP Service**: Functional but without redundancy

---

## Critical Issues

### 🔴 CRITICAL: Secondary Server Failure (192.168.1.134)

**Issue:** The secondary Kea DHCP server has been failed since November 10, 2025 at 14:40:12 UTC (2 days ago).

**Root Cause:**
```
Error initializing hooks: CmdHttpListener::run failed: 
unable to setup TCP acceptor for listening to the incoming HTTP requests: 
bind: Cannot assign requested address
```

**Analysis:**
The secondary server's configuration has an error where it's trying to identify itself as `kea-dhcp-1` (which is actually the primary server's name):

Server 134 config shows:
```json
"this-server-name": "kea-dhcp-1"  // ❌ WRONG - should be "kea-dhcp-2"
```

Additionally, the HA hook library is attempting to bind to port 8000, but there's a conflict because:
1. The Control Agent on server 134 is configured to listen on port 8001
2. The HA hook is trying to listen on port 8000
3. The configuration specifies the wrong server identity

**Impact:**
- No DHCP redundancy
- Single point of failure
- HA monitoring shows continuous communication failures
- If primary server fails, DHCP service will be completely down

---

## Configuration Analysis

### Server Configuration Comparison

#### Server 1 (192.168.1.133) - Primary ✅

**Status:** Active and running (8h uptime)  
**Control Agent:** Port 8001 (running)  
**HA Endpoint:** Port 8000 (configured but unreachable on peer)

**Configuration:**
```json
{
  "this-server-name": "kea-dhcp-1",
  "mode": "load-balancing",
  "peers": [
    {
      "name": "kea-dhcp-1",
      "url": "http://192.168.1.133:8000/",
      "role": "primary",
      "auto-failover": true
    },
    {
      "name": "kea-dhcp-2",
      "url": "http://192.168.1.134:8000/",
      "role": "secondary",
      "auto-failover": true
    }
  ]
}
```

**Services:**
- ✅ isc-kea-dhcp4-server.service: active (running)
- ✅ isc-kea-ctrl-agent.service: active (running)

**Observed Behavior:**
- Successfully serving DHCP requests
- Offering leases (e.g., 192.168.1.19 to c0:f8:53:08:cd:60)
- Renewing existing leases
- Heartbeat attempts to peer failing every 10 seconds

#### Server 2 (192.168.1.134) - Secondary ❌

**Status:** FAILED (since Nov 10 14:40:12 UTC)  
**Control Agent:** Port 8001 (running)  
**DHCP Service:** FAILED TO START

**Configuration ERROR:**
```json
{
  "this-server-name": "kea-dhcp-1",  // ❌ WRONG - identifies as wrong server
  "mode": "load-balancing",
  "peers": [
    // Same peer configuration as primary
  ]
}
```

**Services:**
- ❌ isc-kea-dhcp4-server.service: failed (exit code 1)
- ✅ isc-kea-ctrl-agent.service: active (running)

**Configuration Differences:**
The server 2 configuration file shows one additional reservation compared to server 1:
- Server 134 has: EAP773 AP (a8:29:48:c0:01:60 → 192.168.1.74)
- Server 133 has: InfluxDB (bc:24:11:16:c6:92 → 192.168.1.74) - **IP CONFLICT!**

This reveals an **IP address conflict** where both configurations assign 192.168.1.74 to different devices.

---

## Network Configuration Details

### Subnet Configuration
```json
{
  "subnet": "192.168.1.0/24",
  "pools": [
    {
      "pool": "192.168.1.10 - 192.168.1.250"
    }
  ]
}
```

**DHCP Options:**
- DNS Servers: 192.168.1.253, 192.168.1.224
- Gateway: 192.168.1.1
- Domain: lakehouse.wtf
- CAPWAP AC: 192.168.1.47 (option 138)

### Static Reservations

**Total Reservations:**
- Server 133: 54 static reservations
- Server 134: 55 static reservations

**Reservation Categories:**
- Network infrastructure (13)
- BLE proxies (8)
- RGB/CW light bulbs (11)
- Smart home devices (23)

### Lease Database

**Active Leases (Sample):**
```
192.168.1.10  → c0:f8:53:08:d6:ba (wlan0)
192.168.1.242 → 20:36:26:dd:7e:e0 (EAP773 AP)
192.168.1.24  → d8:e2:df:63:e6:12 (Xbox)
192.168.1.47  → 30:83:98:76:95:e8 (Aruba AP)
192.168.1.11  → 60:3e:5f:11:38:bc (kristys-air)
```

**Lease Timers:**
- Renew Timer: 43200s (12 hours)
- Rebind Timer: 75600s (21 hours)
- Valid Lifetime: 86400s (24 hours)

---

## High Availability Configuration

### HA Mode: Load-Balancing

**Configuration:**
- Mode: load-balancing
- Heartbeat Delay: 10000ms (10 seconds)
- Max Response Delay: 60000ms (60 seconds)
- Max ACK Delay: 5000ms (5 seconds)
- Max Unacked Clients: 5

### Current HA Status

**Primary Server (133):**
- State: partner-down (de facto, serving all requests)
- Heartbeat: Failing every 10 seconds
- Communication: Interrupted with kea-dhcp-2

**Error Pattern:**
```
HA_HEARTBEAT_COMMUNICATIONS_FAILED kea-dhcp-1: 
failed to send heartbeat to kea-dhcp-2 (http://192.168.1.134:8000/): 
Connection refused

HA_COMMUNICATION_INTERRUPTED kea-dhcp-1: 
communication with kea-dhcp-2 is interrupted
```

**Secondary Server (134):**
- State: Failed to start
- Reason: Port binding failure
- Impact: Not participating in HA cluster

---

## Recommendations

### 🔴 IMMEDIATE ACTION REQUIRED

#### 1. Fix Secondary Server Configuration (CRITICAL)

**Step 1: Correct the server identity**

Edit `/etc/kea/kea-dhcp4.conf` on 192.168.1.134 and change:

```json
"this-server-name": "kea-dhcp-2",  // Changed from "kea-dhcp-1"
```

**Step 2: Resolve IP conflict for 192.168.1.74**

Choose which device should have 192.168.1.74:
- Option A: InfluxDB (bc:24:11:16:c6:92) - keep on server 133
- Option B: EAP773 AP (a8:29:48:c0:01:60) - currently on server 134

Remove the conflicting entry and ensure both servers have identical reservation lists.

**Step 3: Verify HA listener configuration**

The HA hook library needs to bind to port 8000 on both servers. Verify:
- Control Agent is on port 8001 (already configured correctly)
- HA listener can bind to port 8000
- No other service is using port 8000

**Step 4: Restart the secondary server**

```bash
ssh root@192.168.1.134
systemctl restart isc-kea-dhcp4-server
systemctl status isc-kea-dhcp4-server
```

**Step 5: Verify HA synchronization**

```bash
# On primary server (133)
curl -X POST -H "Content-Type: application/json" \
  -d '{"command":"ha-heartbeat"}' \
  http://127.0.0.1:8001/

# Check logs
journalctl -u isc-kea-dhcp4-server -f
```

---

### 📋 CONFIGURATION SYNCHRONIZATION

#### 2. Ensure Configuration Consistency

**Action Items:**
- [ ] Synchronize static reservations between both servers
- [ ] Resolve the 192.168.1.74 IP conflict
- [ ] Verify all DHCP options match
- [ ] Implement configuration management (Git, Ansible, etc.)

**Recommended Approach:**
Create a configuration management system to ensure both servers always have identical configs (except for `this-server-name`).

---

### 🔧 OPERATIONAL IMPROVEMENTS

#### 3. Implement Monitoring

**Add monitoring for:**
- Kea service status on both servers
- HA communication status
- Lease pool utilization
- Failed DHCP requests
- Configuration drift detection

**Integration Options:**
- Uptime Kuma (already deployed at 192.168.1.132)
- Prometheus + Grafana
- Stork (ISC's Kea dashboard) at 192.168.1.234

#### 4. Backup and Recovery

**Implement:**
- Automated configuration backups
- Lease database backups
- Disaster recovery procedures
- Configuration validation before restart

#### 5. Load Balancing Verification

Once both servers are operational:
- Monitor which server is handling requests
- Verify load distribution is working
- Test failover scenarios
- Document expected behavior

---

## Configuration Best Practices

### Recommended Changes

1. **Lease Database:** Consider PostgreSQL for better HA synchronization
   ```json
   "lease-database": {
     "type": "postgresql",
     "host": "your-postgres-host",
     "name": "kea",
     "user": "kea",
     "password": "secure-password"
   }
   ```

2. **DHCP-DDNS Integration:** Enable dynamic DNS updates
   
3. **Reservations Management:** Use host database instead of inline reservations

4. **Logging:** Centralize logs (syslog to your logging infrastructure)

5. **Stats Tracking:** Enable statistics for capacity planning

---

## Testing Checklist

After implementing fixes:

### Phase 1: Secondary Server Recovery
- [ ] Configuration file corrected on 192.168.1.134
- [ ] IP conflict resolved
- [ ] Service starts without errors
- [ ] Control socket accessible
- [ ] HA port 8000 listening

### Phase 2: HA Verification
- [ ] Primary server sees secondary
- [ ] Heartbeat successful
- [ ] Lease synchronization working
- [ ] No error messages in logs

### Phase 3: Failover Testing
- [ ] Stop primary server
- [ ] Secondary takes over requests
- [ ] Clients receive leases
- [ ] Restart primary
- [ ] Verify load balancing resumes

### Phase 4: Operational Validation
- [ ] Both servers serving requests
- [ ] Load distributed appropriately
- [ ] Static reservations working
- [ ] Dynamic leases being issued
- [ ] Monitoring in place

---

## Technical Details

### Kea Hooks Libraries Loaded
1. `/usr/lib/x86_64-linux-gnu/kea/hooks/libdhcp_lease_cmds.so`
2. `/usr/lib/x86_64-linux-gnu/kea/hooks/libdhcp_ha.so`

### Interface Configuration
- Primary: eth0
- Secondary: eth0

### Control Socket
- Path: `/var/run/kea/kea4-ctrl-socket`
- Type: unix
- Status: Functional on primary, failed on secondary

### Kea Version Information
- Version: 3.0.2
- Installation: Debian/Ubuntu packages
- Service Manager: systemd

---

## Additional Notes

### Network Context
- Your infrastructure shows a well-organized home lab
- Extensive use of ESPHome devices and BLE proxies
- Integration with Home Assistant ecosystem
- Unifi network equipment (EAP773 access points)
- Smart home devices from various manufacturers

### DHCP Pool Utilization
- Pool: 241 addresses (192.168.1.10-250)
- Reserved: ~55 static assignments
- Available: ~186 addresses for dynamic allocation
- Current Usage: Low (6 leases observed in sample)

### Potential Future Enhancements
1. IPv6 DHCP (DHCPv6) configuration
2. RADIUS integration for MAC filtering
3. Option 82 for relay agent information
4. Client classification for different device types
5. Subnet-specific options for VLANs

---

## Conclusion

Your Kea DHCP implementation is **functionally operational** but in a **degraded state** due to the failed secondary server. The primary server is handling all DHCP requests successfully, but you have **zero redundancy**.

**Priority Actions:**
1. **CRITICAL:** Fix server 192.168.1.134 configuration (wrong server identity)
2. **HIGH:** Resolve IP address conflict for 192.168.1.74
3. **HIGH:** Synchronize configurations between servers
4. **MEDIUM:** Implement monitoring and alerting
5. **LOW:** Consider operational improvements

The configuration is well-structured with appropriate lease timers, comprehensive static reservations, and proper DHCP options. Once the secondary server is restored, you'll have a robust, highly-available DHCP infrastructure.

---

**Report Generated:** 2025-11-12 19:10 UTC  
**Next Review:** After secondary server repair  
**Contact:** Review logs at `/var/log/kea/` or `journalctl -u isc-kea-*`
