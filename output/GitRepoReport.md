# GitOps Repository Audit Report

## Summary - 2025-04-21

### Repository Health Overview
- **Total repositories**: 12
- **Clean repositories**: 8
- **Repositories with uncommitted changes**: 3
- **Repositories with stale tags**: 2
- **Extra repositories**: 1
- **Missing repositories**: 0

### Status: 🟡 Yellow
Some repositories have issues that should be addressed.

## Repositories with Issues

### Uncommitted Changes
The following repositories have local changes that need to be committed:
- `home-assistant-config` (Modified 6 days ago)
- `ble-discovery-addon` (Modified 11 days ago)
- `hass-ab-ble-gateway-suite` (Modified 16 days ago)

### Stale Tags
The following repositories have stale tags that should be cleaned up:
- `smart_notification` (Last active 40 days ago)
- `unknown-project` (Last active 65 days ago)

### Extra Repositories
The following repositories exist locally but are not in the GitHub organization:
- `unknown-project` (Missing README.md and LICENSE)

## Recommendations

1. **Commit changes** in repos with uncommitted changes
2. **Prune stale tags** in repos that haven't been active for 30+ days
3. **Document or remove** extra repositories not tracked in GitHub
4. **Create missing files** for repositories lacking documentation

## Next Steps

Run the following command to update this report:
```bash
/opt/gitops/scripts/sync_github_repos.sh
```

View the dashboard for detailed visualization at:
```
http://gitopsdashboard.local/
```