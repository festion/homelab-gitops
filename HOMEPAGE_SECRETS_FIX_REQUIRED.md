# Homepage Secrets - Corrections Required

## Issue

Homepage is showing "no server available" errors because the Proxmox credentials in Infisical don't match what the old systemd service was using.

## Credentials Mismatch

### What Was in Old Service File

```bash
HOMEPAGE_VAR_PROXMOX_USER=apiro@pam!homepage
HOMEPAGE_VAR_PROXMOX_PASS=***SCRUBBED-T17-PROXMOX-TOKEN-3***
```

### What Was Added to Infisical

```bash
HOMEPAGE_VAR_PROXMOX_USER=api@pve!homepage  ❌ WRONG USERNAME
HOMEPAGE_VAR_PROXMOX_TOKEN=***SCRUBBED-T17-PROXMOX-TOKEN-1***  ❌ WRONG VARIABLE NAME
```

## Required Fixes in Infisical

Log in to https://infisical.internal.lakehouse.wtf → homelab-gitops project → Production environment

### 1. Fix Proxmox Username

**Secret**: `HOMEPAGE_VAR_PROXMOX_USER`
**Current Value**: `api@pve!homepage`
**Correct Value**: `apiro@pam!homepage`

**Action**: Edit the secret and change the value to `apiro@pam!homepage`

### 2. Add Proxmox Password

**Secret Name**: `HOMEPAGE_VAR_PROXMOX_PASS` (new secret)
**Value**: `***SCRUBBED-T17-PROXMOX-TOKEN-3***`

**Action**: Create a new secret with this name and value

### 3. Optional: Remove Wrong Secret

**Secret**: `HOMEPAGE_VAR_PROXMOX_TOKEN`
**Action**: This secret is not needed (wrong name), you can delete it or leave it

## After Making Changes

Restart Homepage to reload the corrected secrets:

```bash
ssh root@192.168.1.137 "pct exec 150 -- systemctl restart homepage"
```

Then verify the secrets loaded correctly:

```bash
ssh root@192.168.1.137 "pct exec 150 -- journalctl -u homepage -n 30 --no-pager | grep -E '(✅|⚠️)'"
```

You should see:
```
  ✅ HOMEPAGE_VAR_PROXMOX_USER
  ✅ HOMEPAGE_VAR_PROXMOX_PASS
```

## Verify Homepage Works

After the restart, check that the Proxmox widget shows data:

1. Open http://192.168.1.45:2000
2. Check the "Proxmox (Main)" widget under Infrastructure
3. It should now show node status instead of "no server available"

## Summary of All Secrets

For reference, here are ALL the secrets Homepage needs:

```
NODE_ENV=production
PORT=3000
HOMEPAGE_ALLOWED_HOSTS=homepage.internal.lakehouse.wtf,192.168.1.45,localhost

# Proxmox (CORRECTED)
HOMEPAGE_VAR_PROXMOX_USER=apiro@pam!homepage
HOMEPAGE_VAR_PROXMOX_PASS=***SCRUBBED-T17-PROXMOX-TOKEN-3***

# Other integrations (these should be correct)
HOMEPAGE_VAR_HASS_TOKEN=<see Infisical: homelab-gitops/prod/HOMEPAGE_VAR_HASS_TOKEN>
HOMEPAGE_VAR_ADGUARD_USER=admin
HOMEPAGE_VAR_ADGUARD_PASS=your-password
HOMEPAGE_VAR_TRUENAS_KEY=<see Infisical: homelab-gitops/prod/HOMEPAGE_VAR_TRUENAS_KEY>
HOMEPAGE_VAR_GRAFANA_USER=admin
HOMEPAGE_VAR_GRAFANA_PASS=<see Infisical: homelab-gitops/prod/HOMEPAGE_VAR_GRAFANA_PASS>
HOMEPAGE_VAR_OMADA_USER=admin
HOMEPAGE_VAR_OMADA_PASS=admin
HOMEPAGE_VAR_INFLUX_USER=admin
HOMEPAGE_VAR_INFLUX_PASS=<see Infisical: homelab-gitops/prod/HOMEPAGE_VAR_INFLUX_PASS>
```

---

**Issue**: Proxmox credentials mismatch
**Fix Required**: Update 2 secrets in Infisical
**Impact**: Proxmox widget showing "no server available"
**Resolution**: Fix secrets + restart Homepage service
