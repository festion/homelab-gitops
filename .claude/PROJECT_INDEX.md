# Project Index: homelab-gitops

## 1. Core Purpose

The `homelab-gitops` repository serves as a GitOps Auditor for homelab environments. It audits git repositories for uncommitted changes, stale tags, missing files, and local-vs-GitHub sync drift. The project also acts as a comprehensive project template repository with integrated MCP (Model Context Protocol) servers, automated documentation generation, and GitHub project management. It is designed for self-hosted infrastructure and GitOps workflows.

## 2. Architecture

The project's core functionality includes an Express API (service `gitops-audit-api` on port 3070) that processes audit results. Although a React dashboard UI was previously part of the architecture, it has been retired. The system scans repositories located at `/repos`, stores the current report at `/output/GitRepoReport.json`, and maintains historical snapshots in `/audit-history/`. Nightly audits run at 03:00, with manual audits triggered via `/opt/gitops/scripts/sync_github_repos.sh`. Deployment for the API is managed by `scripts/deploy.sh`. The project also integrates multiple MCP servers (Filesystem, Network-FS, GitHub, Home Assistant, Proxmox, TrueNAS, WikiJS, Serena Enhanced, Code Linter, Directory Polling) to manage various aspects of the homelab environment.

The `api/` directory contains the Express.js application, including:
*   **Configuration:** `api/config/` for Infisical, logging, orchestration profiles, and security.
*   **Core API Logic:** `api/createApp.js`, `api/server.js`, `api/server-mcp.js`, `api/server-v2.js` for handling server setup and different API versions.
*   **Endpoints:** `api/routes/` and `api/phase2-endpoints.js`.
*   **Middleware:** `api/middleware/` for authentication, authorization, rate limiting, and various security and validation measures.
*   **Models:** `api/models/` for compliance, database, metrics, pipeline, and user data.
*   **Services:** `api/services/`, `api/email-notifications.js`, `api/enhanced-discovery-manager.js`, `api/github-mcp-manager.js`, `api/mcp-connector.js`, `api/serena-orchestrator.js`, `api/wiki-agent-manager.js`.
*   **Jobs:** `api/jobs/` for `complianceChecker.js` and `metricsCollector.js`.
*   **Utilities:** `api/lib/` for HTML sanitization, regex safety, safe execution, and SQL identifiers.

## 3. Key Files

*   **`CLAUDE.md`**: AI assistant instructions and production wiring details for the GitOps auditor.
*   **`README.md`**: Project overview, key features, quick start guide, and included components.
*   **`API_SPECIFICATION.md`**: Details for API reference.
*   **`AUTHENTICATION.md`**: Documentation related to API authentication.
*   **`SECURITY_IMPLEMENTATION.md`**: Outlines security measures within the API.
*   **`MCP_INTEGRATION.md` / `MCP_INTEGRATION_WIKI.md`**: Documentation for MCP server integration.
*   **`package.json`**: Defines project metadata and dependencies for the Node.js API.
*   **`config/deployment-config.json`**: Centralized deployment configuration.
*   **`create-consolidated-config.py`**: Script for consolidating configurations.
*   **`wikijs-ai-content-processor.js`**: Content processing for WikiJS integration.
*   **`api/createApp.js`**: Initializes and configures the Express application.
*   **`api/server.js`**: Main API server entry point.
*   **`api/middleware/*.js`**: Contains various Express middleware for authentication, authorization, validation, and security.
*   **`api/models/*.js`**: Defines database models.
*   **`scripts/deploy.sh`**: Script for deploying the API.
*   **`/output/GitRepoReport.json`**: Current audit report output.
*   **`/audit-history/`**: Stores historical audit snapshots.

## 4. Dependencies

The `homelab-gitops` project is a Node.js Express API. Key dependencies are managed via `package.json` and `package-lock.json`. It relies on system services like `systemd` for the `gitops-audit-api`. Integration with GitHub is a core dependency, leveraging project boards, issue templates, and automated workflows. It also integrates with various MCP servers for different homelab functionalities.

## 5. Common Tasks

An AI assistant working in this codebase might perform tasks such as:

*   **Auditing and Reporting:** Investigating issues related to the nightly audit, report generation, or the validity of `/output/GitRepoReport.json`.
*   **API Development and Maintenance:** Adding new endpoints, modifying existing API logic, enhancing security middleware, or updating data models.
*   **Configuration Management:** Adjusting environment variables, updating deployment configurations in `config/deployment-config.json`, or modifying MCP server configurations.
*   **Deployment and Troubleshooting:** Assisting with `scripts/deploy.sh`, `update-production.sh`, or resolving deployment-related issues.
*   **Documentation Generation:** Updating or generating `CLAUDE.md`, `README.md`, or other documentation files based on code changes or new features.
*   **Testing:** Developing or updating unit and integration tests for API components using `jest.config.js` or `jest.simple.config.js`.
*   **GitHub Integration:** Working with GitHub-related scripts like `github-mcp-manager.js` or `apply-github-project-template.py`.
*   **WikiJS Integration:** Modifying `wikijs-ai-content-processor.js` or related scripts for documentation upload and processing.
*   **Security Enhancements:** Implementing or verifying security measures outlined in `SECURITY_CONSIDERATIONS.md` or within the `api/middleware` directory.
