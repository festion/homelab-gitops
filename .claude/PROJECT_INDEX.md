# Project Index: homelab-gitops
## 1. Core Purpose
The `homelab-gitops` project serves as a comprehensive GitOps auditor and management system for homelab environments. Its primary function is to audit git repositories for uncommitted changes, stale tags, missing files, and synchronization drift with GitHub. The project integrates various Model Context Protocol (MCP) servers for managing different aspects of the homelab, automates documentation generation, and facilitates GitHub project management. While historically including a React dashboard, its current focus is on providing the auditing and management capabilities via an Express API.

## 2. Architecture
The codebase is structured around a Node.js Express API that acts as the core backend. This API is responsible for:
- **GitOps Auditing:** Scanning configured `/repos` for discrepancies and generating reports.
- **MCP Server Integration:** Connecting to and managing over 10 different MCP servers (e.g., Filesystem, Network-FS, GitHub, Home Assistant, WikiJS, Serena Enhanced, Code Linter).
- **Configuration Management:** Loading configuration via `config-loader.js` and managing secrets, potentially through Infisical.
- **Job Orchestration:** Running compliance checks and metrics collection jobs.

Key architectural components:
- **API Server:** Implemented using Express.js (`api/server.js`, `api/server-v2.js`, `api/server-mcp.js`), listening on port 3070.
- **Middleware:** A robust set of middleware handles authentication, authorization, input validation, rate limiting, and security (`api/middleware/`).
- **Models:** Database models (`api/models/`) define the schema for compliance, metrics, pipelines, and user data.
- **Services:** Logic for various operations like email notifications, enhanced discovery, and GitHub/MCP management (`api/services/`).
- **Deployment:** Installed at `/opt/gitops`, with the API managed by a systemd service (`gitops-audit-api`). Reports are generated to `/output/GitRepoReport.json` and historical snapshots are stored in `/audit-history/`.

## 3. Key Files

- **`api/server.js`**: Main entry point for the Express API server.
- **`api/mcp-connector.js`**: Handles connections and interactions with various MCP servers.
- **`api/github-mcp-manager.js`**: Manages GitHub-related MCP interactions.
- **`api/serena-orchestrator.js`**: Orchestrates advanced development workflows using Serena Enhanced MCP.
- **`api/config-loader.js`**: Utility for loading application configurations.
- **`api/config/infisical.js` / `api/config/infisical-admin.js`**: Configuration related to Infisical secret management integration.
- **`api/middleware/auth.js` / `api/middleware/enhanced-auth.js`**: Authentication middleware for securing API endpoints.
- **`api/models/*.js`**: Defines the data structures and interactions with the database for various entities (e.g., `compliance.js`, `metrics.js`, `user.js`).
- **`scripts/deploy.sh`**: Script for deploying the API component.
- **`scripts/sync_github_repos.sh`**: Script for manually triggering a GitHub repository sync and audit.
- **`CLAUDE.md`**: Provides specific instructions and traps for AI assistants interacting with the project in a production context.
- **`README.md`**: General project overview, key features, and quick start guides.

## 4. Dependencies
- **Node.js / npm:** Core runtime and package manager for the API.
- **Express.js:** Web framework used for the API.
- **Git:** Essential for auditing repository states and managing GitOps workflows.
- **Infisical:** Used for managing and integrating secrets (configuration files under `api/config/`).
- **Systemd:** For managing the `gitops-audit-api` service in production Linux environments.
- **Jest:** Testing framework (`api/jest.config.js`).
- **ESLint / Prettier:** Code quality and formatting (`.eslintrc.js`, `.prettierrc`).

## 5. Common Tasks
- **Project Setup:**
    - Clone the repository: `git clone https://github.com/festion/homelab-project-template.git my-new-project`
    - Apply template and setup: `cd my-new-project && ./scripts/apply-template.sh`
    - Interactive setup: `./scripts/apply-template.sh --interactive`
    - Configure MCP servers: `./scripts/setup-mcp-config.sh`
- **API Deployment:**
    - Deploy the API: `scripts/deploy.sh` (API only)
- **GitOps Auditing:**
    - Manual audit of repositories: `/opt/gitops/scripts/sync_github_repos.sh`
    - The nightly audit runs automatically at 03:00.
- **Debugging Audit Reports:**
    - If the API shows an empty repo list, check `/output/GitRepoReport.json` for parsing issues.
- **Code Maintenance:**
    - Running tests: Refer to `api/jest.config.js` for testing configurations.
    - Linting and formatting: `.eslintrc.js` and `.prettierrc` define rules.
