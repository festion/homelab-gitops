# Project Index: homelab-gitops

## 1. Core Purpose

The `homelab-gitops` project serves as a GitOps Auditor for homelab environments. Its primary function is to audit git repositories for uncommitted changes, stale tags, missing files, and local-vs-GitHub sync drift. The results are presented via an Express API (with a retired React dashboard). It integrates over 10 pre-configured MCP (Model Context Protocol) servers (filesystem, network, GitHub, Home Assistant, Proxmox, TrueNAS, WikiJS, Serena Enhanced, Code Linter, Directory Polling), provides smart, template-driven documentation generation, and includes GitHub project management features. It is optimized for self-hosted infrastructure and GitOps workflows.

## 2. Architecture

The architecture revolves around an Express API (`gitops-audit-api` on port 3070) that scans repositories located at `/repos`. Audit reports are saved to `/output/GitRepoReport.json`, with historical snapshots in `/audit-history/`. A nightly audit runs at 03:00, with manual audits triggered by `/opt/gitops/scripts/sync_github_repos.sh`.

Key components include:
-   **API (Node.js/Express):** Handles auditing logic, data collection, and serving results.
-   **MCP Servers:** A collection of specialized modules for interacting with various services (filesystem, GitHub, Home Assistant, etc.).
-   **Documentation Generation:** Automated generation of `CLAUDE.md` and `README.md` using templates.
-   **GitHub Integration:** Workflows, issue templates, and project boards.
-   **Scripts:** Utility scripts for setup, deployment, and configuration.

The project works in conjunction with the `operations` repository for documentation and SOPs.

## 3. Key Files

-   **`api/server.js`, `api/server-mcp.js`, `api/server-v2.js`**: Main API entry points and server definitions.
-   **`api/config-loader.js`**: Utility for loading configuration.
-   **`api/routes/`**: Contains API route definitions.
-   **`api/models/`**: Defines database models for compliance, metrics, pipeline, and user data.
-   **`api/middleware/`**: Houses authentication, authorization, validation, and security middleware.
-   **`api/services/`**: Core business logic and service implementations.
-   **`api/enhanced-discovery-manager.js`, `api/github-mcp-manager.js`, `api/mcp-connector.js`, `api/serena-orchestrator.js`, `api/wiki-agent-manager.js`**: Core MCP and integration managers.
-   **`api/jobs/complianceChecker.js`, `api/jobs/metricsCollector.js`**: Background job definitions.
-   **`config/deployment-config.json`, `config/deployment-config.schema.json`**: Deployment configurations and schemas.
-   **`config/discovery-cron.json`, `config/discovery-sources.json`**: Configuration for discovery services.
-   **`config/database.js`**: Database configuration.
-   **`.mcp/`**: Directory for MCP server-related scripts and logic.
-   **`CLAUDE.md`, `README.md`**: Primary project documentation, often generated.
-   **`scripts/`**: Directory containing setup, deployment, and utility scripts (e.g., `sync_github_repos.sh`, `deploy.sh`).
-   **`.github/workflows/`**: GitHub Actions workflows for CI/CD and automation.

## 4. Dependencies

-   **`operations` repository**: This repository works alongside `https://github.com/festion/operations` for documentation and Standard Operating Procedures (SOPs).
-   **Node.js/npm**: The API and many scripts are JavaScript-based, requiring Node.js and npm for dependency management (indicated by `package.json` and `package-lock.json` in `api/` and the root).
-   **Systemd**: Used for managing the `gitops-audit-api` service.
-   **Git**: Fundamental for the GitOps auditing functionality.

## 5. Common Tasks

-   **Clone and setup a new project**:
    ```bash
    git clone https://github.com/festion/homelab-project-template.git my-new-project
    cd my-new-project
    ./scripts/apply-template.sh
    ```
-   **Interactive setup**:
    ```bash
    ./scripts/apply-template.sh --interactive
    ./scripts/setup-mcp-config.sh
    ./scripts/apply-github-project-template.py (optional)
    ```
-   **Manual audit**: Run `/opt/gitops/scripts/sync_github_repos.sh`.
-   **Deploy API**: Execute `scripts/deploy.sh` (API only).
-   **Memory Search**: To recall project knowledge before making changes, use `memory-search "<what you're about to change>" --project homelab-gitops`.
