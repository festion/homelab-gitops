# Changelog

## [v1.1.0] - 2025-06-16

### 🎉 Major Feature Release - All v1.1.0 Features Complete!

#### Added

- **📊 CSV Export Functionality**
  - New `/audit/export/csv` API endpoint for generating CSV reports
  - One-click CSV download from dashboard with automatic filename generation
  - Comprehensive export including repository status, URLs, paths, and health metrics
  - Proper CSV escaping for special characters and commas

- **📧 Email Summary System** 
  - New `/audit/email-summary` API endpoint for sending audit reports via email
  - Rich HTML email templates with health status indicators and repository details
  - Interactive email controls in dashboard with custom recipient addresses
  - Automated nightly email summary script (`scripts/nightly-email-summary.sh`)
  - Fallback text summaries when API is unavailable
  - Environment variable configuration for SMTP settings

- **🔍 Enhanced Git Diff Viewer**
  - New `DiffViewer` component with advanced diff visualization
  - Side-by-side and unified diff view modes
  - Syntax highlighting and line number display
  - Proper diff parsing with hunk and file separation
  - Modal overlay with enhanced UX controls
  - Toggle options for line numbers and view modes

#### Enhanced

- **🎯 Improved Dashboard UX**
  - Enhanced header with export and email controls
  - New "Enhanced Diff" button for repositories with changes
  - Better button sizing and organization for repository actions
  - Real-time feedback for email sending operations
  - Input validation for email addresses

- **⚡ API Improvements**
  - Modular API structure with separate modules for CSV export and email
  - Enhanced error handling and logging for all new features
  - Proper HTTP headers for file downloads
  - CORS support for development environments

#### Technical

- **🏗️ Codebase Organization**
  - New modular structure: `api/csv-export.js`, `api/email-notifications.js`
  - Enhanced TypeScript interfaces for new component props
  - Improved state management for new features
  - Better separation of concerns in component architecture

#### Documentation

- **📚 Updated Documentation**
  - Updated roadmap to reflect v1.1.0 completion
  - Enhanced feature descriptions and usage instructions
  - New environment variable documentation for email configuration
  - Cron job examples for automated email summaries

### 🛠️ Deployment Instructions

#### Backend Deployment
```bash
# Copy new API modules to production
scp api/csv-export.js api/email-notifications.js root@192.168.1.58:/opt/gitops/api/

# Copy nightly email script
scp scripts/nightly-email-summary.sh root@192.168.1.58:/opt/gitops/scripts/
chmod +x /opt/gitops/scripts/nightly-email-summary.sh

# Restart API service
systemctl restart gitops-audit-api
```

#### Frontend Deployment
```bash
# Update dashboard with new features
cd dashboard
npm run build
scp -r dist/* root@192.168.1.58:/var/www/gitops-dashboard/
```

#### Email Configuration (Optional)
```bash
# Configure email notifications
export GITOPS_TO_EMAIL="admin@lakehouse.wtf"
export GITOPS_SMTP_HOST="localhost"
export GITOPS_SMTP_PORT="25"

# Add to cron for nightly summaries
echo "0 3 * * * /opt/gitops/scripts/nightly-email-summary.sh" | crontab -
```

### 🎯 v1.1.0 Success Metrics

- ✅ **CSV Export**: Complete audit data exportable to spreadsheets
- ✅ **Email Summaries**: Automated HTML email reports with full repository status
- ✅ **Enhanced Diff Viewer**: Professional git diff visualization with multiple view modes
- ✅ **Production Ready**: All features tested and deployed successfully
- ✅ **User Experience**: Intuitive dashboard controls for all new features
- ✅ **Automation**: Cron-compatible scripts for unattended operations

---

# Changelog

## [v1.0.4] - 2025-05-09

### Fixed

- Fixed repository-specific view routing with proper React Router configuration
- Fixed dashboard links to use relative URLs instead of hardcoded domain
- Improved SPA routing with HTML5 History API support
- Fixed API connection issues in production environment
- Added auto-scrolling to repository when accessing via direct URL

### Added

- Support for `/audit/:repo?action=view` routes
- Visual highlight for currently selected repository
- Deployment script to update production environment

## [v1.0.3] - 2025-05-09

### Fixed

- Fixed dashboard build process to correctly generate dist directory
- Fixed API data handling in React components to match API response format
- Added API proxy configuration in vite.config.ts to resolve CORS issues
- Improved error handling for data fetching in the dashboard

### Added

- Enhanced error states with better user feedback
- Status indicator with color-coded dashboard health states

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
