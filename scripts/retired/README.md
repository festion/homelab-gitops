# Retired Scripts

Scripts in this directory are no longer active. They are preserved for reference.

## gitops_dns_sync.sh + fetch_npm_config.sh

**Retired:** 2026-02-16
**Reason:** Migrated from Nginx Proxy Manager (NPM) to Traefik. These scripts extracted proxy host entries from the NPM SQLite database and synced them as AdGuard DNS rewrites. With Traefik, DNS rewrites are managed differently.
**Last working:** ~2025-06-20 (SSH key auth from CT 123 to Proxmox broke, and the Python script on CT 123 was wiped to 0 bytes)
**Cron:** Removed from CT 123 `/etc/cron.d/` and `cron/gitops-schedule`
