# Cloudflare Zero Trust API Setup

## Status: ✅ CONFIGURED

**Date Completed:** 2026-02-03

## Overview

Cloudflare Zero Trust is configured to allow mobile device access to internal homelab services via the WARP app. API automation is set up through a helper script that integrates with Infisical for credential management.

## Architecture

```
Mobile (WARP App) → Cloudflare Zero Trust → Tunnel (LXC 102) → Traefik → Internal Services
                          ↑
                   Email OTP Auth
                   (outlook.com, gmail.com)
```

## Credentials (Infisical - homelab-gitops project)

| Secret | Description |
|--------|-------------|
| `CF_ZEROTRUST_API` | API token with Zero Trust permissions |
| `CF_ACCOUNT_ID` | Cloudflare account ID: `32a26bf8c9151367d438168652ec0fde` |
| `CF_CLAUDE_API` | DNS-only API token (no Zero Trust access) |
| `CF_DNS_API_TOKEN` | DNS API token for Traefik cert challenges |

## API Token Permissions (CF_ZEROTRUST_API)

- Account > Access: Organizations, Identity Providers & Groups → Edit
- Account > Access: Device Posture → Edit
- Account > Access: Apps and Policies → Edit
- Zone > Zone → Read

## Zero Trust Configuration

### Organization
- **Auth Domain:** lakehousehomelab.cloudflareaccess.com
- **WARP Auth Session:** 8h

### Identity Providers
1. **Google** (google) - ID: `2552ee09-865b-446d-8bdd-d69a74d506aa`
2. **One-Time PIN** (onetimepin) - ID: `92c5755b-52fe-4e0a-a7ff-4abe6c91fe28`

### Access Applications
1. **App Launcher** (app_launcher) - ID: `8cd026e2-70b9-4304-9133-af7d68f2fe4e`
2. **Development SSH** (ssh) - ID: `4adae6b3-8015-4606-9b8c-afa465abdd36`
3. **Warp Login App** (warp) - ID: `ed95677f-a88f-4707-bb05-81e5cdc01619`

### WARP Enrollment Policy
- **Policy ID:** `82218cde-2769-41ae-8af9-7d11caf43013`
- **Decision:** Allow
- **Allowed Emails:**
  - jeremy.ames@outlook.com
  - jeremy.ames@gmail.com

## Helper Script

**Location:** `scripts/cloudflare-zerotrust-helper.sh`

### Setup
```bash
export INFISICAL_TOKEN="your-infisical-jwt-token"
source scripts/cloudflare-zerotrust-helper.sh
```

### Available Functions

| Function | Description |
|----------|-------------|
| `zt_test_connection` | Test API connection and credentials |
| `zt_list_devices` | List all enrolled devices |
| `zt_revoke_device <id>` | Revoke/remove a device |
| `zt_list_allowed_emails` | List allowed emails/domains |
| `zt_add_allowed_email <email>` | Allow a specific email |
| `zt_add_allowed_domain <domain>` | Allow all emails from a domain |
| `zt_remove_allowed_email <email>` | Remove an email from allowed list |
| `zt_list_apps` | List Access applications |
| `zt_list_idps` | List identity providers |
| `zt_help` | Show help message |

### Examples
```bash
# Test connection
zt_test_connection

# Add a new allowed email
zt_add_allowed_email "friend@gmail.com"

# Allow entire domain
zt_add_allowed_domain "company.com"

# List and revoke a device
zt_list_devices
zt_revoke_device "abc123-device-id"
```

## Mobile Device Enrollment

### First-Time Setup
1. Install **Cloudflare WARP** app (iOS/Android)
2. Open app → Menu → Account → Login with Cloudflare Zero Trust
3. Organization: `lakehousehomelab`
4. Enter allowed email address
5. Check email for OTP code (One-Time PIN)
6. Enter code to complete enrollment

### Accessing Services
With WARP connected, access internal services as if on local network:
- https://homeassistant.internal.lakehouse.wtf
- https://proxmox.internal.lakehouse.wtf
- https://grafana.internal.lakehouse.wtf
- All other `*.internal.lakehouse.wtf` services

## Troubleshooting

### Email OTP Not Received
1. Check email is in allowed list: `zt_list_allowed_emails`
2. Check spam/junk folder
3. Verify OTP identity provider is configured (ID: `92c5755b-52fe-4e0a-a7ff-4abe6c91fe28`)

### Device Can't Connect
1. Verify WARP shows organization name, not just "Connected"
2. Check device is enrolled: `zt_list_devices`
3. Revoke and re-enroll if needed

### API Authentication Errors
1. Verify `CF_ZEROTRUST_API` token is active in Cloudflare dashboard
2. Check token has required permissions (see above)
3. Regenerate token if expired

## Related Documentation

- `cloudflare_warp_tunnel_setup_complete` - Tunnel and WARP infrastructure
- `infrastructure/cloudflare/README.md` - Tunnel configuration details
- `scripts/infisical-admin-helper.sh` - Infisical credential helper

## Maintenance

### Rotate API Token
1. Create new token in Cloudflare dashboard with same permissions
2. Update in Infisical: `CF_ZEROTRUST_API`
3. Test: `zt_test_connection`

### Add New User
```bash
source scripts/cloudflare-zerotrust-helper.sh
zt_add_allowed_email "newuser@example.com"
```

### Remove User Access
```bash
# Remove from policy
zt_remove_allowed_email "olduser@example.com"

# Also revoke their device
zt_list_devices  # Find device ID
zt_revoke_device "<device-id>"
```
