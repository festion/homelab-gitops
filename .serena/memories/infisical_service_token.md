# Infisical Service Token

## Token Details
- **Token**: `st.58fae899-b38e-48cf-a14d-d3ce082bc66e.76ced52b539c577e924816576d306899.5f41afc577e1809c2808467714cdb74f`
- **Expiration**: Never expires
- **Scope**: Production environment (full access)
- **Created**: 2025-12-02

## Infisical Instance
- **URL**: https://infisical.internal.lakehouse.wtf
- **Project**: homelab secrets

## Usage
```bash
# Set environment variable
export INFISICAL_TOKEN="st.58fae899-b38e-48cf-a14d-d3ce082bc66e.76ced52b539c577e924816576d306899.5f41afc577e1809c2808467714cdb74f"

# Retrieve a secret
infisical secrets get UPTIME_KUMA_PASSWORD --env=prod --token="$INFISICAL_TOKEN"

# Or via CLI with token flag
infisical secrets --env=prod --token="st.58fae899-b38e-48cf-a14d-d3ce082bc66e.76ced52b539c577e924816576d306899.5f41afc577e1809c2808467714cdb74f"
```

## Available Secrets (prod environment)
- `UPTIME_KUMA_PASSWORD` - root password for Uptime Kuma (redflower805)

## Notes
- First token provided (st.359aa358...) only had dev scope access
- This token has production scope for accessing homelab secrets
