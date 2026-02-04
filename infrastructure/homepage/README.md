# Homepage Dashboard Configuration

Configuration files for the Homepage dashboard service.

## Service Details

| Property | Value |
|----------|-------|
| LXC ID | 150 |
| IP | 192.168.1.45 |
| Port | 3000 |
| URL | https://homepage.internal.lakehouse.wtf |
| Config Path | `/home/homepage/homepage/config/` |

## Configuration Files

- `services.yaml` - Service links and widgets
- `settings.yaml` - Dashboard layout and theme
- `widgets.yaml` - Global widgets (search, datetime, resources)

## Deployment

To deploy configuration changes to the homepage LXC:

```bash
# Copy all config files
scp infrastructure/homepage/*.yaml root@192.168.1.45:/home/homepage/homepage/config/

# Restart the service
ssh root@192.168.1.45 "systemctl restart homepage.service"
```

## Adding New Services

When adding a new service to the homelab:

1. Add Traefik route in `infrastructure/traefik/config/dynamic/routers.yml`
2. Add Traefik service in `infrastructure/traefik/config/dynamic/services.yml`
3. Add Homepage entry in `infrastructure/homepage/services.yaml`
4. Deploy and restart homepage

## Widget Configuration

Some services support widgets with live data. These require API credentials stored as environment variables on the homepage LXC. See the [Homepage documentation](https://gethomepage.dev/latest/widgets/) for widget configuration options.
