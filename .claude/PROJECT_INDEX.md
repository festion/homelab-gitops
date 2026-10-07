# Project Index: homelab-gitops

## 1. Core Purpose

The `homelab-gitops` project serves as a GitOps Auditor for a homelab environment. It audits git repositories for uncommitted changes, stale tags, missing files, and synchronization drift between local and GitHub repositories. The results are presented via an Express API (the dashboard UI was retired). It also functions as a comprehensive project template with integrated MCP (Model Context Protocol) servers, automated documentation generation, and GitHub project management features, optimized for self-hosted infrastructure and GitOps workflows.

## 2. Architecture

The core architecture revolves around an Express API that performs repository audits. The API runs as a `systemd` service (`gitops-audit-api`) on port `3070`. It scans repositories located in `/repos`, storing the current report in `/output/GitRepoReport.json` and historical snapshots in `/audit-history/`.

Key components and integrations:

-   **Express API**: Backend for auditing and serving data.
-   **MCP Servers**: Over 10 integrated servers for various functions (Filesystem, Network-FS, GitHub, Home Assistant, Proxmox, TrueNAS, WikiJS, Serena Enhanced, Code Linter, Directory Polling).
-   **GitOps Workflows**: Utilizes `git` for managing infrastructure and configurations.
-   **Documentation Generation**: Template-driven `CLAUDE.md` and `README.md` generation.
-   **GitHub Integration**: Manages project boards, issue templates, and automated workflows.
-   **Configuration**: Uses `template-config.json` for project structure configuration.

## 3. Key Files

-   **`api/server.js`**: Main entry point for the Express API server.
-   **`api/config-loader.js`**: Handles loading various configurations for the API.
-   **`api/routes/`**: Contains definitions for API endpoints.
-   **`api/middleware/`**: Houses middleware for authentication, authorization, validation, and security.
-   **`api/models/`**: Defines data models for compliance, metrics, pipelines, and users.
-   **`api/mcp-connector.js`**: Connects the API to MCP servers.
-   **`api/enhanced-discovery-manager.js`**: Manages enhanced discovery functionalities.
-   **`api/github-mcp-manager.js`**: Manages GitHub-related MCP integrations.
-   **`CLAUDE.md`**: AI assistant instructions and production wiring details.
-   **`README.md`**: Project overview, features, and quick start guide.
-   **`scripts/deploy.sh`**: Script for deploying the API.
-   **`scripts/sync_github_repos.sh`**: Script for manual repository audits.
-   **`output/GitRepoReport.json`**: Stores the current audit report.
-   **`.mcp/`**: Directory containing MCP-related scripts and configuration.
-   **`.github/workflows/`**: GitHub Actions workflows.
-   **`config/`**: Contains various configuration files like `database.js`, `deployment-config.json`, `discovery-sources.json`.
-   **`package.json`**: Defines project metadata and dependencies for the API.

## 4. Dependencies

The project primarily uses Node.js for its API backend, evidenced by `package.json` and JavaScript files. It leverages `Express.js` for the API framework. For GitOps functionalities, it relies on `git` and associated shell scripts. Systemd is used for managing the API service in production. Specific dependencies like `jest` for testing are also indicated.

## 5. Common Tasks

-   **Setup a new project**: Use `./scripts/apply-template.sh` (interactive or not).
-   **Configure MCP servers**: Run `./scripts/setup-mcp-config.sh`.
-   **Initialize GitHub project**: Use `./scripts/apply-github-project-template.py`.
-   **Deploy the API**: Execute `scripts/deploy.sh`.
-   **Trigger a manual audit**: Run `/opt/gitops/scripts/sync_github_repos.sh`.
-   **Troubleshoot missing/invalid reports**: Check `/output/GitRepoReport.json` for parsing errors.
-   **Develop API endpoints**: Modify files within the `api/routes/` directory.
-   **Manage project configuration**: Edit files in the `config/` directory.
-   **Run tests**: Use `jest` (e.g., `api/jest.config.js`).
