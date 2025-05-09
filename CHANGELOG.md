# Changelog

## [v1.0.2] - 2025-05-09
### Changed
- Updated installation instructions to work without Nginx
- Added port configuration option for running on port 8080
- Improved manual deployment script to support custom configurations

## [v1.0.1] - 2025-05-09
### Fixed
- Dashboard compatibility with Node.js 18 (downgraded React from v19 to v18.2.0)
- Tailwind CSS configuration for better compatibility
- TypeScript configuration to prevent build errors
- Added manual deployment package generation via manual-deploy.sh

## [v1.0.0] - 2025-04-17
### Added
- AdGuard DNS sync tool:
  - `fetch_npm_config.sh`: Extracts NPM's `database.sqlite`
  - `generate_adguard_rewrites_from_sqlite.py`: Generates and syncs AdGuard DNS rewrites for `*.internal.lakehouse.wtf`
  - `gitops_dns_sync.sh`: Master runner for scheduled syncing
- Enforced dry-run before commit
- Log output for every step with timestamps
- Cron job setup: `/etc/cron.d/gitops-schedule` runs nightly at 3AM
- Snapshot auto-naming and log rotation ready

