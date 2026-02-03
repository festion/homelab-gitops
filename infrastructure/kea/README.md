# Kea DHCP HA Configuration

## Overview

This directory contains the Kea DHCP4 server configurations for the HA (High Availability) cluster.

## Servers

| Server | IP | Role | Config File |
|--------|-----|------|-------------|
| kea-dhcp-1 | 192.168.1.133 | Primary | `kea-dhcp4-primary.conf` |
| kea-dhcp-2 | 192.168.1.134 | Secondary | `kea-dhcp4-secondary.conf` |

## Configuration Files

- **kea-dhcp4-primary.conf** - Configuration for kea-dhcp-1 (primary server)
- **kea-dhcp4-secondary.conf** - Configuration for kea-dhcp-2 (secondary server)
- **kea-dhcp4.conf** - Legacy combined config (deprecated, do not use)

## Critical: this-server-name

Each Kea server in an HA pair **MUST** have a unique `this-server-name` that matches its peer name in the HA configuration:

- Primary server: `"this-server-name": "kea-dhcp-1"`
- Secondary server: `"this-server-name": "kea-dhcp-2"`

**WARNING**: If `this-server-name` is wrong, the server will try to bind to the wrong IP address and fail to start.

## DHCP Reservations

Reservations are managed by the `kea-config-sync` script running on kea-dhcp-1. The sync script:
- Runs every minute via cron
- Only syncs the `reservations` array within `subnet4`
- Preserves all other configuration including HA parameters
- Primary server's reservations take precedence in conflicts

## Deployment

When deploying config changes:

1. **Primary server (kea-dhcp-1)**:
   ```bash
   scp kea-dhcp4-primary.conf root@192.168.1.133:/etc/kea/kea-dhcp4.conf
   ssh root@192.168.1.133 "kea-dhcp4 -t /etc/kea/kea-dhcp4.conf && systemctl reload isc-kea-dhcp4-server"
   ```

2. **Secondary server (kea-dhcp-2)**:
   ```bash
   scp kea-dhcp4-secondary.conf root@192.168.1.134:/etc/kea/kea-dhcp4.conf
   ssh root@192.168.1.134 "kea-dhcp4 -t /etc/kea/kea-dhcp4.conf && systemctl reload isc-kea-dhcp4-server"
   ```

## Monitoring

- **Stork Dashboard**: https://stork.internal.lakehouse.wtf
- **HA Status**: Shows in Stork under Services -> DHCP

## Troubleshooting

### Server shows offline in Stork

Check if `isc-kea-dhcp4-server` is running:
```bash
ssh root@192.168.1.133 "systemctl status isc-kea-dhcp4-server"
ssh root@192.168.1.134 "systemctl status isc-kea-dhcp4-server"
```

### "Cannot assign requested address" error

This means `this-server-name` is wrong. Check the config:
```bash
ssh root@<server> "jq '.Dhcp4.\"hooks-libraries\"[] | select(.library | contains(\"ha\")) | .parameters.\"high-availability\"[0].\"this-server-name\"' /etc/kea/kea-dhcp4.conf"
```

Fix by ensuring primary has `kea-dhcp-1` and secondary has `kea-dhcp-2`.
