# Project Structure Overview

## Root Directory Structure
```
homelab-gitops-auditor/
├── api/                     # Express.js backend server
├── audit-history/           # Historical audit reports (JSON)
├── cron/                    # Cron job configurations
├── dashboard/               # React frontend application
├── docs/                    # Additional documentation
├── frontend/                # Legacy frontend files
├── logs/                    # Application logs
├── modules/                 # Shared modules/utilities
├── nginx/                   # Nginx configuration files
├── npm_proxy_snapshot/      # NPM database snapshots
├── output/                  # Generated audit reports
├── repos/                   # Local Git repositories (production)
├── scripts/                 # Utility and deployment scripts
├── CHANGELOG.md             # Version history
├── CLAUDE.md               # Claude-specific documentation
├── DEVELOPMENT.md          # Development setup guide
├── README.md               # Main project documentation
├── dev-run.sh              # Development environment launcher
├── package.json            # Root package configuration
└── various deployment scripts
```

## Dashboard Structure (Frontend)
```
dashboard/
├── src/
│   ├── components/         # Reusable React components
│   │   └── SidebarLayout.tsx
│   ├── pages/              # Page components
│   │   ├── audit.tsx      # Main audit dashboard
│   │   ├── home.tsx       # Home page
│   │   └── roadmap.tsx    # Roadmap page
│   ├── App.tsx            # Main application component
│   ├── router.tsx         # Client-side routing
│   └── statusMeta.ts      # Status constants and colors
├── public/                # Static assets
├── package.json           # Frontend dependencies
├── vite.config.ts         # Vite build configuration
├── tailwind.config.js     # TailwindCSS configuration
└── tsconfig.json          # TypeScript configuration
```

## API Structure (Backend)
```
api/
├── server.js              # Main Express server
├── package.json           # Backend dependencies
└── package-lock.json      # Dependency lock file
```

## Scripts Directory
```
scripts/
├── sync_github_repos.sh          # Main GitHub sync audit script
├── gitops_dns_sync.sh            # DNS synchronization
├── fetch_npm_config.sh           # NPM configuration fetching
├── generate_adguard_rewrites_from_sqlite.py  # AdGuard DNS management
├── deploy.sh                     # Production deployment
├── install-dashboard.sh          # Dashboard installation
├── manual-deploy.sh              # Manual deployment options
├── provision-lxc.sh              # LXC container provisioning
└── various utility scripts
```

## Key Configuration Files
- **package.json**: Root dependencies (React, TypeScript)
- **dashboard/package.json**: Frontend-specific dependencies
- **api/package.json**: Backend-specific dependencies
- **vite.config.ts**: Frontend build configuration
- **tailwind.config.js**: CSS framework configuration
- **tsconfig.json**: TypeScript compilation settings
- **eslint.config.js**: Code linting rules

## Data Flow Architecture
1. **Audit Scripts** → Generate JSON reports in `audit-history/`
2. **API Server** → Serves audit data and handles repository operations
3. **Dashboard** → Consumes API data and displays visualizations
4. **Static Files** → Fallback data in `dashboard/public/` for development

## Environment Separation
- **Development**: Uses relative paths, CORS enabled, manual starts
- **Production**: Uses `/opt/gitops/` paths, systemd services, Nginx proxy