# Changelog

## [v1.0.0] - 2025-04-17
### Added
- AdGuard DNS sync system (fetch → dry-run → commit)
- Logging and snapshotting of NPM `database.sqlite`
- Enforced dry-run policy before commit
- Cron job for nightly sync at 3 AM

### Changed
- Only domains ending in `.internal.lakehouse.wtf` are touched
- Logging normalized and persisted to `/opt/gitops/logs/`
