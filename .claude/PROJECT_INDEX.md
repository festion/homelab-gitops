# Project Index: homelab-gitops
## 1. Core Purpose
The `homelab-gitops` codebase functions as a GitOps Auditor, continuously monitoring homelab Git repositories for uncommitted changes, stale tags, missing files, and synchronization discrepancies with GitHub. It processes audit results via an Express API. Additionally, it serves as a comprehensive project template repository integrating various MCP (Model Context Protocol) servers, facilitating automated documentation generation, and managing GitHub projects within a self-hosted infrastructure.

## 2. Architecture
The project is primarily built around an Express.js API (`api/server.js`, `api/server-v2.js`, `api/server-mcp.js`) which serves as the core backend, previously supporting a React dashboard (now retired). The API service, `gitops-audit-api`, is managed by systemd and runs on port 3070. It interacts with various MCP (Model Context Protocol) servers located under `.mcp/` and `mcp-integrations/`. Configuration is handled through files in `config/` and `api/config/`. Audit reports are stored in `/output/GitRepoReport.json`, with historical snapshots maintained in `/audit-history/`. The system relies on GitOps workflows and GitHub integrations for project management and automation.

## 3. Key Files
-   `api/server.js`, `api/server-v2.js`, `api/server-mcp.js`: Main Express API entry points.
-   `api/routes/`: Defines API endpoints and their handlers.
-   `api/models/`: Database models for compliance, metrics, pipeline, and user management.
-   `api/middleware/`: Contains authentication, authorization, validation, and security middleware components.
-   `api/services/`: Business logic and service implementations.
-   `api/config-loader.js`: Utility for loading application configurations.
-   `api/config/`: API-specific configuration files (e.g., `infisical.js`, `logging.js`).
-   `.mcp/`: Core MCP (Model Context Protocol) server scripts and logic.
-   `scripts/`: Utility scripts for deployment, setup, and various operations.
-   `config/`: Global project configuration, including `deployment-config.json` and `discovery-sources.json`.
-   `CLAUDE.md`: Instructions and production wiring details for the AI assistant.
-   `README.md`: High-level project overview, features, and quick start guides.
-   `package.json`: Lists project dependencies and scripts.

## 4. Dependencies
The project primarily uses Node.js and npm for its API backend and various utility scripts. Key dependencies include Express.js for the API, and potentially other libraries as listed in `package.json` and `api/package.json`. It integrates with GitHub for repository management, issue tracking, and automated workflows (via `.github/workflows/`). MCP servers represent internal or external services this project connects to.

## 5. Common Tasks
-   **Run the API:** Start the Express API service, typically managed by systemd as `gitops-audit-api`.
-   **Manual Audit:** Execute `/opt/gitops/scripts/sync_github_repos.sh` to trigger an immediate audit of Git repositories.
-   **Deployment:** Use `scripts/deploy.sh` for deploying the API component (the dashboard UI is retired).
-   **Project Setup:** Initialize new projects using `./scripts/apply-template.sh` (one-line or interactive), configure MCP servers via `./scripts/setup-mcp-config.sh`, and optionally initialize GitHub projects using `./scripts/apply-github-project-template.py`.
-   **Code Quality:** Utilize linting and testing tools (configured via `.eslintrc.js`, `.prettierrc`, `jest.config.js`) for maintaining code quality.
