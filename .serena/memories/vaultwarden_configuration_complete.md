# Vaultwarden Configuration - December 2025

## Configuration Applied

Based on [Vaultwarden Wiki Configuration Overview](https://github.com/dani-garcia/vaultwarden/wiki/Configuration-overview)

## Access URLs

- **Web Vault**: https://vault.internal.lakehouse.wtf
- **Admin Panel**: https://vault.internal.lakehouse.wtf/admin

## Admin Token (NEW)

**Plain token for login**: `kbrDUhc23+3DOEFCc3Oy1bF0w1FqsFvBUEoM2ZLx1v5/sL1VsALIO4S8dcS9gCQj`

The token is stored as an Argon2 hash in the configuration for security.

## Key Settings Applied

### Security
- `ADMIN_TOKEN` - Argon2 hashed (OWASP preset: m=65536, t=3, p=4)
- `LOGIN_RATELIMIT_SECONDS=60` - Brute force protection
- `PASSWORD_HINTS_ALLOWED=false` - No password hints
- `SIGNUPS_ALLOWED=false` - Invitation-only
- `SIGNUPS_VERIFY=true` - Email verification required

### Database (PostgreSQL HA)
- `DATABASE_URL=postgresql://vaultwarden:...@192.168.1.123:5432/vaultwarden`
- `DATABASE_MAX_CONNS=10`
- `DATABASE_MIN_CONNS=2`

### Organization & Auditing
- `ORG_EVENTS_ENABLED=true` - Audit logging enabled
- `EVENTS_DAYS_RETAIN=365` - 1 year retention

### Features
- `WEBSOCKET_ENABLED=true` - Real-time sync
- `EXTENDED_LOGGING=true` - Detailed logs with timestamps
- `TRASH_AUTO_DELETE_DAYS=30` - Auto-cleanup

## Pending Configuration

### SMTP (Required for email features)
Uncomment and configure in `/opt/vaultwarden/.env`:
```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURITY=starttls
SMTP_FROM=vaultwarden@lakehouse.wtf
SMTP_FROM_NAME=Lakehouse Vaultwarden
SMTP_USERNAME=smtp-user
SMTP_PASSWORD=smtp-password
```

### Push Notifications (Optional)
1. Register at https://bitwarden.com/host/
2. Get Installation ID and Key
3. Uncomment and configure:
```bash
PUSH_ENABLED=true
PUSH_INSTALLATION_ID=your-id
PUSH_INSTALLATION_KEY=your-key
```

## Configuration File Location

- Primary (LXC 140): `/opt/vaultwarden/.env`
- Standby (LXC 141): `/opt/vaultwarden/.env`

## Restart Commands

```bash
# Primary
ssh root@192.168.1.125 "pct exec 140 -- systemctl restart vaultwarden"

# Standby (when testing)
ssh root@192.168.1.126 "pct exec 141 -- systemctl restart vaultwarden"
```

## Log Location

`/opt/vaultwarden/data/vaultwarden.log`
