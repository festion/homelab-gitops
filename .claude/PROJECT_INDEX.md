# Project Index: homelab-gitops
## 1. Core Purpose
The `homelab-gitops` project serves as a comprehensive GitOps auditor for homelab environments. Its primary purpose is to audit git repositories for uncommitted changes, stale tags, missing files, and local-vs-GitHub synchronization drift. The project provides an Express.js API backend to serve audit results, integrates with multiple MCP (Model Context Protocol) servers, automates documentation generation, and supports GitHub project management. The dashboard UI has been retired (ops #4355), with focus remaining on the API and backend processes.

## 2. Architecture
The project is built around an Express.js API (`api/server.js`) that handles audit logic, data processing, and serves results. It scans repositories located at `/repos` and outputs the current audit report to `/output/GitRepoReport.json`, with historical snapshots stored in `/audit-history/`. A nightly audit is scheduled at 03:00, and manual audits can be triggered via `scripts/sync_github_repos.sh`. The system includes integration with various MCP servers for different functionalities (e.g., Filesystem, Network-FS, GitHub, Home Assistant, WikiJS), automated workflows, and a template system for consistent project structure. Deployment of the API is managed by `scripts/deploy.sh`.

## 3. Key Files
-   `CLAUDE.md`: Instructions and operational details specifically for AI assistants.
-   `README.md`: Main project documentation, quick start, features, and structure overview.
-   `api/server.js`: Entry point for the Express.js API server.
-   `api/createApp.js`: Handles API application setup and configuration.
-   `api/routes/`: Contains definitions for API endpoints.
-   `api/models/`: Defines data models used by the API.
-   `api/middleware/`: Houses middleware for authentication, authorization, validation, and security.
-   `api/services/`: Contains business logic and utility functions for the API.
-   `api/config/`: Configuration files for the API, including Infisical integration and logging.
-   `api/tests/`: Unit and integration tests for the API.
-   `api/AUTHENTICATION.md`: Documentation detailing API authentication mechanisms.
-   `api/SECURITY_IMPLEMENTATION.md`: Documentation on security implementation details.
-   `.mcp/`: Directory containing Model Context Protocol server scripts and related components.
-   `scripts/`: Collection of utility, setup, and deployment scripts (e.g., `sync_github_repos.sh`, `deploy.sh`).
-   `config/`: Project-wide configuration files (e.g., `deployment-config.json`, `discovery-sources.json`).
-   `output/GitRepoReport.json`: The most recent generated audit report.
-   `audit-history/`: Stores historical snapshots of audit reports.
-   `package.json`: Defines project metadata, scripts, and Node.js dependencies.

## 4. Dependencies
The project is primarily a Node.js application, utilizing npm for package management. Key dependencies include:
-   **Node.js & npm**: Runtime environment and package manager.
-   **Express.js**: Web application framework for the API backend.
-   **Git**: For repository auditing and operations.
-   **MCP Servers**: Integration with various Model Context Protocol servers (e.g., Filesystem, GitHub, WikiJS).
-   **Infisical**: For secret management (indicated by `api/config/infisical.js` and `api/config/infisical-admin.js`).
-   **Jest**: For running API tests.

## 5. Common Tasks
An AI assistant working in this codebase might perform tasks such as:
-   **Modifying API Endpoints**: Adding, updating, or debugging routes and their associated logic in `api/routes/` and `api/services/`.
-   **Updating Audit Logic**: Adjusting the scripts or API services responsible for scanning git repositories and generating reports.
-   **Enhancing Security**: Implementing or modifying authentication, authorization, or other security features within `api/middleware/` and `api/SECURITY_IMPLEMENTATION.md`.
-   **Managing Configuration**: Adjusting project or API settings in `config/` and `api/config/`.
-   **Troubleshooting Deployment**: Investigating issues related to the API service deployment using `scripts/deploy.sh` or systemd configurations.
-   **Expanding MCP Integrations**: Developing or modifying components related to MCP server interactions within the `.mcp/` directory.
-   **Writing/Updating Documentation**: Maintaining and generating project documentation, especially `CLAUDE.md` and `README.md`.
-   **Writing/Fixing Tests**: Developing or debugging unit and integration tests for the API using Jest in `api/tests/`.
-   **Analyzing Audit Reports**: Interpreting and summarizing the contents of `/output/GitRepoReport.json`.
