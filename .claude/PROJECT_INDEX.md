# Project Index: homelab-gitops

## 1. Core Purpose
The `homelab-gitops` project serves as a comprehensive GitOps auditor and homelab project template. It audits git repositories for uncommitted changes, stale tags, missing files, and sync drift between local and GitHub, then presents the results via an Express API. It also provides a robust template for homelab environments, integrating various MCP (Model Context Protocol) servers for automation, automated documentation generation, and streamlined GitHub project management.

## 2. Architecture
The architecture comprises:
- **API Service**: An Express-based API (`gitops-audit-api` on port 3070) that processes audit results and handles various integrations.
- **MCP Servers**: A collection of pre-configured Model Context Protocol servers for managing filesystems (local and network), GitHub repositories, Home Assistant, Proxmox, TrueNAS, WikiJS, Serena Enhanced, code linting, and directory polling.
- **GitOps Auditor**: A component that scans `/repos`, generates `GitRepoReport.json` in `/output`, and stores historical snapshots in `/audit-history/`.
- **Project Structure**: Organized with dedicated directories for API endpoints (`api/`), MCP-related scripts (`.mcp/`), configuration files (`config/`), documentation (`docs/`), and utility scripts (`scripts/`).
- **Deployment**: The API is deployed as a systemd service, `gitops-audit-api`. The dashboard UI was retired (ops #4355).

## 3. Key Files
- `./api/add-homepage-secrets.js`: Manages homepage secrets.
- `./api/AUTHENTICATION.md`: Documentation for API authentication.
- `./api/config/infisical-admin.js`: Infisical admin configuration for API.
- `./api/config/infisical.js`: Infisical configuration for API.
- `./api/config-loader.js`: Loads API configurations.
- `./api/createApp.js`: Initializes the Express application.
- `./api/csv-export.js`: Handles CSV data export from the API.
- `./api/email-notifications.js`: Manages email notifications.
- `./api/enhanced-discovery-manager.js`: Manages enhanced discovery processes.
- `./api/github-mcp-manager.js`: Manages GitHub-related MCP operations.
- `./api/jest.config.js`: Jest configuration for API tests.
- `./api/jobs/complianceChecker.js`: Compliance checking job.
- `./api/jobs/metricsCollector.js`: Metrics collection job.
- `./api/lib/safe-exec.js`: Utility for safe command execution.
- `./api/mcp-connector.js`: Connects to MCP servers.
- `./api/MCP_INTEGRATION.md`: Documentation on MCP integration.
- `./api/middleware/auth.js`: Authentication middleware.
- `./api/middleware/authorization.js`: Authorization middleware.
- `./api/models/database.js`: Database models.
- `./api/models/user.js`: User models.
- `./api/phase2-endpoints.js`: API endpoints for Phase 2.
- `./api/SECURITY_IMPLEMENTATION.md`: Documentation on security implementation.
- `./api/serena-orchestrator.js`: Orchestrates Serena Enhanced workflows.
- `./api/server.js`: Main API server entry point.
- `./CLAUDE.md`: AI assistant instructions.
- `./README.md`: Project overview and quick start guide.
- `./.mcp/backup-manager.py`: Script for managing MCP backups.
- `./scripts/apply-template.sh`: Applies project templates.
- `./scripts/sync_github_repos.sh`: Manually syncs GitHub repositories for audit.

## 4. Dependencies
- **Node.js/npm**: Used for the Express API and various utility scripts (indicated by `package.json`, `package-lock.json` in root and `api/`).
- **Python**: Used for MCP-related scripts (e.g., in `.mcp/`) and GitHub project template application (`./scripts/apply-github-project-template.py`).
- **Shell Scripts**: Extensive use of `bash` scripts for setup, deployment, and operational tasks (e.g., `install.sh`, `deploy.sh`, `setup-linting.sh`).
- **Systemd**: For managing the `gitops-audit-api` service in production.
- **Git**: Core dependency for GitOps workflows, repository auditing, and management.

## 5. Common Tasks
- **Project Setup**:
    - `git clone https://github.com/festion/homelab-project-template.git my-new-project` followed by `cd my-new-project && ./scripts/apply-template.sh` for one-line creation.
    - `./scripts/apply-template.sh --interactive` for interactive setup.
- **MCP Configuration**: `./scripts/setup-mcp-config.sh` to configure MCP servers.
- **GitHub Project Initialization**: `./scripts/apply-github-project-template.py` to set up GitHub project elements.
- **Manual Git Audit**: `/opt/gitops/scripts/sync_github_repos.sh` to trigger a manual audit of Git repositories.
- **API Deployment**: `scripts/deploy.sh` for deploying the API service.
- **Development Start**: `start-dev.ps1` (PowerShell) for starting development environment.
- **Updating Production**: `update-production.sh` for updating the production environment.
- **MCP Structure Cleanup**: `cleanup-mcp-structure.sh`.
- **Linting Setup**: `setup-linting.sh` (bash) or `setup-linting.ps1` (PowerShell).
