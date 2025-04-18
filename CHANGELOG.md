# Changelog

## [v1.0.0] - 2025-04-17
### Added
<<<<<<< HEAD
- AdGuard DNS sync system (fetch → dry-run → commit)
- Logging and snapshotting of NPM `database.sqlite`
- Enforced dry-run policy before commit
- Cron job for nightly sync at 3 AM

### Changed
- Only domains ending in `.internal.lakehouse.wtf` are touched
- Logging normalized and persisted to `/opt/gitops/logs/`
=======
- AdGuard DNS sync tool:
  - `fetch_npm_config.sh`: Extracts NPM's `database.sqlite`
  - `generate_adguard_rewrites_from_sqlite.py`: Generates and syncs AdGuard DNS rewrites for `*.internal.lakehouse.wtf`
  - `gitops_dns_sync.sh`: Master runner for scheduled syncing
- Enforced dry-run before commit
- Log output for every step with timestamps
- Cron job setup: `/etc/cron.d/gitops-schedule` runs nightly at 3AM
- Snapshot auto-naming and log rotation ready

