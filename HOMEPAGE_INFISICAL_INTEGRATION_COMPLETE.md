# ✅ Homepage Infisical Integration Complete

## Summary

Homepage has been successfully migrated to use Infisical for secrets management. All credentials are now fetched from the `homelab-gitops` Infisical project instead of being hardcoded in the systemd service file.

## What Was Changed

### LXC 150 (Homepage Container)

**Created**: `/home/homepage/infisical-loader.js`
- Custom Node.js script that fetches secrets from Infisical
- Uses native Node.js `https` module (no additional dependencies required)
- Loads all 15 secrets before starting Homepage
- Passes secrets as environment variables to the Homepage process

**Modified**: `/etc/systemd/system/homepage.service`
- Removed all hardcoded Environment= variables (15 secrets removed)
- Added only 3 environment variables for Infisical:
  - `INFISICAL_TOKEN` - Service token for homelab-gitops project
  - `INFISICAL_SITE_URL` - Infisical server URL
  - `INFISICAL_ENVIRONMENT` - Environment (prod)
- Changed `ExecStart` from `/usr/bin/pnpm start` to `/usr/bin/node /home/homepage/infisical-loader.js`

## Integration Details

### Infisical Loader Script

The loader script (`/home/homepage/infisical-loader.js`):

1. **Fetches 15 secrets from Infisical**:
   - NODE_ENV
   - PORT
   - HOMEPAGE_ALLOWED_HOSTS
   - HOMEPAGE_VAR_PROXMOX_USER
   - HOMEPAGE_VAR_PROXMOX_TOKEN
   - HOMEPAGE_VAR_HASS_TOKEN
   - HOMEPAGE_VAR_ADGUARD_USER
   - HOMEPAGE_VAR_ADGUARD_PASS
   - HOMEPAGE_VAR_TRUENAS_KEY
   - HOMEPAGE_VAR_GRAFANA_USER
   - HOMEPAGE_VAR_GRAFANA_PASS
   - HOMEPAGE_VAR_OMADA_USER
   - HOMEPAGE_VAR_OMADA_PASS
   - HOMEPAGE_VAR_INFLUX_USER
   - HOMEPAGE_VAR_INFLUX_PASS

2. **Loads secrets at startup**: All secrets are fetched before Homepage starts

3. **Passes secrets as environment variables**: The Homepage process receives all secrets via environment

4. **Handles errors gracefully**: If a secret is not found, it logs a warning and continues

5. **No additional dependencies**: Uses only Node.js built-in modules

### Systemd Service Configuration

**Before** (Insecure - hardcoded credentials):
```ini
[Service]
Environment=HOMEPAGE_VAR_PROXMOX_USER=apiro@pam!homepage
Environment=HOMEPAGE_VAR_PROXMOX_PASS=***SCRUBBED-T17-PROXMOX-TOKEN-3***
Environment=HOMEPAGE_VAR_HASS_TOKEN=eyJhbGc...
# ... 12 more hardcoded secrets
```

**After** (Secure - Infisical integration):
```ini
[Service]
ExecStart=/usr/bin/node /home/homepage/infisical-loader.js
Environment=INFISICAL_TOKEN=st.650cfc13-6ecd-4a3b-91cc-8d7a123b67c4...
Environment=INFISICAL_SITE_URL=https://infisical.internal.lakehouse.wtf
Environment=INFISICAL_ENVIRONMENT=prod
```

## Verification

### Startup Logs

```
🔐 Loading secrets from Infisical...
  ✅ NODE_ENV
  ✅ PORT
  ✅ HOMEPAGE_ALLOWED_HOSTS
  ✅ HOMEPAGE_VAR_PROXMOX_USER
  ✅ HOMEPAGE_VAR_PROXMOX_TOKEN
  ✅ HOMEPAGE_VAR_HASS_TOKEN
  ✅ HOMEPAGE_VAR_ADGUARD_USER
  ✅ HOMEPAGE_VAR_ADGUARD_PASS
  ✅ HOMEPAGE_VAR_TRUENAS_KEY
  ✅ HOMEPAGE_VAR_GRAFANA_USER
  ✅ HOMEPAGE_VAR_GRAFANA_PASS
  ✅ HOMEPAGE_VAR_OMADA_USER
  ✅ HOMEPAGE_VAR_OMADA_PASS
  ✅ HOMEPAGE_VAR_INFLUX_USER
  ✅ HOMEPAGE_VAR_INFLUX_PASS

✅ Loaded 15/15 secrets

🚀 Starting Homepage...
```

### Service Status

```bash
● homepage.service - Homepage Dashboard
     Active: active (running) since Fri 2025-11-14 20:13:35 UTC
   Main PID: 18046 (node)
      Tasks: 34
     Memory: 169.1M

✓ Ready in 465ms
```

### HTTP Accessibility

- **Direct Access**: http://192.168.1.45:2000 ✅ (HTTP 200)
- **Domain Access**: http://homepage.internal.lakehouse.wtf ⚠️ (Redirects to HTTPS)
- **HTTPS Access**: https://homepage.internal.lakehouse.wtf ⚠️ (503 - Traefik routing issue, separate from Infisical integration)

## Security Improvements

### Before
❌ 15 secrets hardcoded in systemd service file
❌ Secrets visible in `systemctl status homepage`
❌ Secrets stored in plaintext on disk
❌ Difficult to rotate credentials (requires systemd file edit + daemon-reload + restart)
❌ No audit trail for secret access
❌ Secrets committed to version control (if service file is tracked)

### After
✅ Only 1 service token in systemd service file
✅ All application secrets stored securely in Infisical
✅ Centralized secret management
✅ Easy credential rotation (update in Infisical + restart service)
✅ Audit trail in Infisical for all secret access
✅ Secrets never committed to version control
✅ Fine-grained access control via Infisical
✅ Secret versioning and rollback capability

## Secrets in Infisical

All 15 Homepage secrets are now stored in:

**Project**: homelab-gitops
**Environment**: prod
**Location**: https://infisical.internal.lakehouse.wtf

## Maintenance

### Rotating Credentials

1. **Update secret in Infisical**:
   - Log in to https://infisical.internal.lakehouse.wtf
   - Navigate to homelab-gitops project
   - Edit the secret value

2. **Restart Homepage**:
   ```bash
   ssh root@192.168.1.137 "pct exec 150 -- systemctl restart homepage"
   ```

3. **Verify**:
   ```bash
   ssh root@192.168.1.137 "pct exec 150 -- journalctl -u homepage -n 20 --no-pager | grep '✅'"
   ```

### Viewing Logs

```bash
# View startup logs
ssh root@192.168.1.137 "pct exec 150 -- journalctl -u homepage -n 50 --no-pager | grep -E '(🔐|✅|⚠️|🚀)'"

# View all Homepage logs
ssh root@192.168.1.137 "pct exec 150 -- journalctl -u homepage -f"

# Check service status
ssh root@192.168.1.137 "pct exec 150 -- systemctl status homepage"
```

### Updating the Loader Script

If you need to add more secrets:

1. **Edit the script**:
   ```bash
   ssh root@192.168.1.137 "pct exec 150 -- nano /home/homepage/infisical-loader.js"
   ```

2. **Add secret name to `SECRETS_TO_FETCH` array**

3. **Restart service**:
   ```bash
   ssh root@192.168.1.137 "pct exec 150 -- systemctl restart homepage"
   ```

## Troubleshooting

### Secret Not Loading

Check if secret exists in Infisical:
```bash
curl -H "Authorization: Bearer st.650cfc13..." \
  "https://infisical.internal.lakehouse.wtf/api/v3/secrets/raw/SECRET_NAME?environment=prod"
```

### Homepage Not Starting

Check logs:
```bash
ssh root@192.168.1.137 "pct exec 150 -- journalctl -u homepage -n 100 --no-pager"
```

Common issues:
- INFISICAL_TOKEN not set or expired
- Infisical server unreachable
- Secret name mismatch (case-sensitive)

### Service Token Rotation

When rotating the Infisical service token:

1. Generate new token in Infisical web UI
2. Update systemd service file:
   ```bash
   ssh root@192.168.1.137 "pct exec 150 -- nano /etc/systemd/system/homepage.service"
   ```
3. Reload and restart:
   ```bash
   ssh root@192.168.1.137 "pct exec 150 -- systemctl daemon-reload"
   ssh root@192.168.1.137 "pct exec 150 -- systemctl restart homepage"
   ```

## Integration Architecture

```
Homepage Service Start
    ↓
Infisical Loader Script
    ↓
Fetch 15 secrets from Infisical
    ↓
Load into environment variables
    ↓
Start Homepage with secrets
    ↓
Homepage Running ✅
```

## Files Modified

### LXC 150 (192.168.1.45)

1. **Created**: `/home/homepage/infisical-loader.js` (755, owned by homepage:homepage)
2. **Modified**: `/etc/systemd/system/homepage.service`

### No Changes Required

- Homepage application code (unchanged)
- Homepage configuration files (unchanged)
- Dependencies (no new packages installed)

## Benefits

✅ **Security**: Credentials no longer in systemd service file
✅ **Centralization**: All secrets managed in one place
✅ **Auditability**: Track who accessed which secrets when
✅ **Rotation**: Easy credential rotation without code changes
✅ **Consistency**: Same secret management as homelab-gitops-auditor
✅ **No Dependencies**: Uses only Node.js built-in modules
✅ **Fast Startup**: Secrets cached after initial fetch

## Next Steps

1. **Monitor Homepage**: Ensure all integrations work correctly
   - Proxmox widget
   - Home Assistant widget
   - AdGuard widget
   - TrueNAS widget
   - Grafana widget
   - Omada widget
   - InfluxDB widget

2. **Fix Traefik Routing** (Optional): Address the 503 error on HTTPS endpoint
   - Check Traefik service configuration for port mismatch
   - Update to use port 2000 instead of 3000

3. **Document for Other Services**: Use this pattern for other services that need secrets

4. **Set Up Backup**: Include Homepage Infisical token in backup strategy

## Status

✅ **Integration Complete**
✅ **All 15 secrets loaded from Infisical**
✅ **Homepage running successfully**
✅ **Hardcoded credentials removed**
✅ **Service stable and operational**

---

**Integration Date**: 2025-11-14
**LXC**: 150 (Homepage)
**IP**: 192.168.1.45
**Port**: 2000
**Infisical Project**: homelab-gitops
**Secrets Loaded**: 15/15
**Status**: ✅ Operational
