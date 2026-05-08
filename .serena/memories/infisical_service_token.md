# Infisical Service Token

## Token Details
- **Token**: `<INFISICAL_SVC_TOKEN_ClaudeCode_REVOKED_2026-05-09_see_Vikunja_1102>`
- **Expiration**: Never expires
- **Scope**: Production environment (full access)
- **Created**: 2025-12-02

## Infisical Instance
- **URL**: https://infisical.internal.lakehouse.wtf
- **Project**: homelab secrets

## Usage
```bash
# Set environment variable
export INFISICAL_TOKEN="<INFISICAL_SVC_TOKEN_ClaudeCode_REVOKED_2026-05-09_see_Vikunja_1102>"

# Retrieve a secret
infisical secrets get UPTIME_KUMA_PASSWORD --env=prod --token="$INFISICAL_TOKEN"

# Or via CLI with token flag
infisical secrets --env=prod --token="<INFISICAL_SVC_TOKEN_ClaudeCode_REVOKED_2026-05-09_see_Vikunja_1102>"
```

## Available Secrets (prod environment)
- `UPTIME_KUMA_ADMIN_PASSWORD` - root password for Uptime Kuma (rotated 2026-05-08; value in Infisical only)

## Notes
- First token provided (st.359aa358...) only had dev scope access
- This token has production scope for accessing homelab secrets
