# Vaultwarden HA Deployment

## Architecture Overview

Vaultwarden is deployed in an Active-Standby HA configuration using PostgreSQL as the shared database backend.

### Components

| Component | Location | IP Address | Notes |
|-----------|----------|------------|-------|
| Primary Vaultwarden | LXC 140 on proxmox2 | 192.168.1.140 | Active, auto-start enabled |
| Standby Vaultwarden | LXC 141 on proxmox3 | 192.168.1.141 | Warm standby, service disabled |
| PostgreSQL Database | LXC 113 on proxmox2 | 192.168.1.123 | Shared database |
| Traefik Primary | LXC 110 on proxmox | 192.168.1.110 | Reverse proxy |
| Traefik Secondary | LXC 121 on proxmox2 | 192.168.1.103 | Backup reverse proxy |

### Access URLs

- **Web Vault**: https://vault.internal.lakehouse.wtf
- **Admin Panel**: https://vault.internal.lakehouse.wtf/admin

## Credentials

### PostgreSQL Database
- **Database**: vaultwarden
- **User**: vaultwarden
- **Password**: p7PEF7NgRj3VS3XkGCEeILzTkZzu7i63
- **Host**: 192.168.1.123:5432

### Vaultwarden Admin
- **Admin Token**: 6NVzLgAosSs/xDvTfjez8HLGrgiw7KYz6yRghVdBNNc=
- **Note**: Should be hashed with Argon2 for production security

## Configuration Files

### Primary/Standby Environment (/opt/vaultwarden/.env)
```bash
DOMAIN=https://vault.internal.lakehouse.wtf
DATABASE_URL=postgresql://vaultwarden:p7PEF7NgRj3VS3XkGCEeILzTkZzu7i63@192.168.1.123:5432/vaultwarden
WEB_VAULT_FOLDER=/opt/vaultwarden/web-vault
WEB_VAULT_ENABLED=true
DATA_FOLDER=/opt/vaultwarden/data
SIGNUPS_ALLOWED=false
SIGNUPS_VERIFY=false
INVITATIONS_ALLOWED=true
ADMIN_TOKEN=6NVzLgAosSs/xDvTfjez8HLGrgiw7KYz6yRghVdBNNc=
WEBSOCKET_ENABLED=true
LOG_LEVEL=info
LOG_FILE=/opt/vaultwarden/data/vaultwarden.log
ROCKET_ADDRESS=0.0.0.0
ROCKET_PORT=8000
```

### Systemd Service (/etc/systemd/system/vaultwarden.service)
```ini
[Unit]
Description=Vaultwarden Server
After=network.target postgresql.service

[Service]
User=root
Group=root
EnvironmentFile=/opt/vaultwarden/.env
ExecStart=/opt/vaultwarden/vaultwarden
LimitNOFILE=65535
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Failover Procedures

### Manual Failover (Primary → Standby)

1. **Stop the primary** (if still running):
   ```bash
   ssh root@192.168.1.125 "pct exec 140 -- systemctl stop vaultwarden"
   ```

2. **Update DNS to point to standby IP** (192.168.1.141):
   - AdGuard Primary (192.168.1.253): Update vault.internal.lakehouse.wtf rewrite
   - AdGuard Secondary (192.168.1.224): Update vault.internal.lakehouse.wtf rewrite
   
   Or update Traefik services.yml to point to standby:
   ```bash
   ssh root@192.168.1.137 "pct exec 110 -- sed -i 's/192.168.1.140:8000/192.168.1.141:8000/' /etc/traefik/dynamic/services.yml"
   ```

3. **Start the standby**:
   ```bash
   ssh root@192.168.1.126 "pct exec 141 -- systemctl start vaultwarden"
   ```

4. **Verify failover**:
   ```bash
   curl -sk https://vault.internal.lakehouse.wtf/alive
   ```

### Failback (Standby → Primary)

1. **Stop the standby**:
   ```bash
   ssh root@192.168.1.126 "pct exec 141 -- systemctl stop vaultwarden"
   ```

2. **Restore DNS/Traefik to primary IP** (192.168.1.140)

3. **Start the primary**:
   ```bash
   ssh root@192.168.1.125 "pct exec 140 -- systemctl start vaultwarden"
   ```

## Monitoring

- **Uptime Kuma**: Monitor "Vaultwarden" checks https://vault.internal.lakehouse.wtf/alive
- **Health Endpoint**: /alive returns timestamp when healthy
- **Traefik Health Check**: Configured with 30s interval on /alive endpoint

## DHCP Reservations

| Instance | MAC Address | IP Address |
|----------|-------------|------------|
| Primary (140) | bc:24:11:71:d4:f6 | 192.168.1.140 |
| Standby (141) | bc:24:11:78:f2:3e | 192.168.1.141 |

## Important Notes

1. **Both instances share the same PostgreSQL database** - data is automatically synchronized
2. **Only ONE instance should be running at a time** - running both simultaneously is not recommended
3. **RSA keys are generated per-instance** - stored in /opt/vaultwarden/data/rsa_key.pem
4. **Admin token should be hashed** - use `vaultwarden hash` to generate Argon2 hash for production
5. **Signups are disabled** - users must be invited via admin panel

## Maintenance Commands

### Check service status
```bash
# Primary
ssh root@192.168.1.125 "pct exec 140 -- systemctl status vaultwarden"

# Standby
ssh root@192.168.1.126 "pct exec 141 -- systemctl status vaultwarden"
```

### View logs
```bash
ssh root@192.168.1.125 "pct exec 140 -- tail -f /opt/vaultwarden/data/vaultwarden.log"
```

### Test database connectivity
```bash
ssh root@192.168.1.125 "pct exec 113 -- psql -U vaultwarden -d vaultwarden -c 'SELECT 1'"
```

## Future Enhancements

- [ ] Hash admin token with Argon2
- [ ] Configure Cloudflare tunnel for external access
- [ ] Set up automated failover with health check scripts
- [ ] Configure SMTP for email notifications
- [ ] Store credentials in Infisical
