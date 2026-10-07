# Project Index: homelab-gitops
## 1. Core Purpose
The `homelab-gitops` project serves as a comprehensive GitOps auditor for homelab environments. Its primary functions include auditing Git repositories for discrepancies (uncommitted changes, stale tags, sync drift) and serving these audit results via an Express API. It also functions as a project template, integrating with various MCP (Model Context Protocol) servers (e.g., Filesystem, Network-FS, GitHub, Home Assistant, WikiJS) for automated documentation, project management, and infrastructure automation.

## 2. Architecture
The codebase follows a client-server architecture, although the frontend React dashboard has been retired (ops #4355).

*   **API Backend**: An Express.js application (Node.js) located in the `api/` directory. It handles auditing logic, data processing, authentication, and serves data through various routes.
*   **MCP Servers**: A collection of Model Context Protocol servers (Python-based in `.mcp/`) that interact with different services and systems (e.g., GitHub, Home Assistant). These are integrated for enhanced automation and context management.
*   **Automation & Scripting**: Bash and Python scripts in the `scripts/` directory manage tasks like deployment, repository synchronization, and template application. GitHub Actions workflows (`.github/workflows/`) provide CI/CD capabilities.
*   **Configuration**: Centralized configuration management with files in `config/` handling database, deployment, and environment settings.
*   **Data Storage**: Audit reports are generated and stored in `/output/GitRepoReport.json`, with historical snapshots maintained in `/audit-history/`.

## 3. Key Files
*   `./api/server.js`: The main entry point for the Express.js API server.
*   `./api/config-loader.js`: Responsible for loading and managing application configurations.
*   `./api/middleware/auth.js`, `./api/middleware/security.js`: Core middleware for authentication and security enforcement in the API.
*   `./api/models/database.js`: Defines database schemas and handles interactions with the underlying data store.
*   `./.mcp/pipeline-engine/`: Contains the core logic for the MCP server pipeline execution.
*   `./.mcp/template-applicator.py`: Python script used by MCP for applying templates to various contexts.
*   `./scripts/deploy.sh`: Script to deploy the API service.
*   `./scripts/sync_github_repos.sh`: Manually triggers the GitHub repository synchronization and audit process.
*   `./CLAUDE.md`: AI assistant instructions and production wiring details for the `homelab-gitops` auditor.
*   `./README.md`: Provides a comprehensive overview of the project, its features, and quick start instructions.
*   `./config/deployment-config.json`: Defines parameters and settings for project deployments.
*   `./config/environment.production.example`: An example file for configuring production environment variables.
*   `./wikijs-ai-content-processor.js`: Handles the processing of content for Wiki.js, likely related to automated documentation.
*   `./package.json`: Lists project metadata, dependencies, and scripts for the Node.js components.

## 4. Dependencies
*   **Runtime Environments**: Node.js (for the Express API) and Python (for MCP servers and various utility scripts).
*   **Backend Framework**: Express.js.
*   **External Services**: GitHub (for repo management and audits), Home Assistant, Proxmox, TrueNAS, WikiJS (integrated via MCP servers).
*   **Package Managers**: npm (for Node.js dependencies) and potentially pip (for Python dependencies, though not explicitly listed).
*   **Version Control**: Git.

## 5. Common Tasks
*   **Run API Server**: Start the Express.js API.
*   **Perform Git Audit**: Execute the repository audit process, either manually or via scheduled cron jobs.
*   **Deploy Updates**: Deploy changes to the API or other components using the provided deployment scripts.
*   **Manage Configuration**: Update environment variables or specific configuration files for the API or MCP servers.
*   **Interact with MCP Servers**: Develop or modify functionality related to the various integrated MCP servers.
*   **Generate Documentation**: Utilize or extend the automated documentation generation capabilities, especially for WikiJS.
*   **Project Setup**: Initialize and configure new projects based on this template.
