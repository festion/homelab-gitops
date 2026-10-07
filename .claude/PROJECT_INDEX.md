# Project Index: homelab-gitops

## 1. Core Purpose

The `homelab-gitops` project serves as a comprehensive template repository for homelab environments. Its primary purpose is to audit homelab Git repositories for uncommitted changes, stale tags, missing files, and local-vs-GitHub synchronization drift. It integrates with various Model Context Protocol (MCP) servers, automates documentation generation, and manages GitHub projects. The audit results were previously served via a React dashboard backed by an Express API (dashboard UI now retired).

## 2. Architecture

The project is structured around several key components:

-   **API Service**: An Express.js API (`api/server.js`, `api/server-mcp.js`, `api/server-v2.js`) running as a `systemd` service (`gitops-audit-api`) on port `3070`. It handles the core auditing logic and data serving.
-   **MCP Servers**: Integration with over 10 pre-configured MCP servers, including Filesystem, Network-FS, GitHub, Home Assistant, Proxmox, TrueNAS, WikiJS, Serena Enhanced, Code Linter, and Directory Polling. These are likely managed within the `.mcp/` directory.
-   **Audit Mechanism**: Scans repositories located at `/repos`, generating a current report at `/output/GitRepoReport.json` and storing historical snapshots in `/audit-history/`. A nightly audit runs at 03:00.
-   **Documentation Generation**: Features smart, template-driven `CLAUDE.md` and `README.md` generation.
-   **GitHub Integration**: Utilizes `.github/` for issue templates, project boards, automated workflows, labels, and milestones.
-   **Configuration**: Centralized configuration management, with files in the `config/` directory.
-   **Scripts**: A collection of utility and setup scripts in the `scripts/` directory, used for deployment, project setup, and auditing.
-   **Middleware & Models**: The `api/` directory contains middleware for authentication, authorization, validation, and security, as well as database models for compliance, metrics, pipeline, and user management.

## 3. Key Files

-   `./api/add-homepage-secrets.js`: Manages homepage secrets.
-   `./api/AUTHENTICATION.md`: Documentation for API authentication.
-   `./api/config/infisical-admin.js`, `./api/config/infisical.js`: Infisical configuration.
-   `./api/config-loader.js`: Loads application configuration.
-   `./api/config/logging.js`: Logging configuration.
-   `./api/config/orchestrationProfiles.js`: Defines orchestration profiles.
-   `./api/config/security-config-example.json`: Example security configuration.
-   `./api/createApp.js`: Entry point for creating the Express application.
-   `./api/csv-export.js`: Handles CSV data export.
-   `./api/docs/LOGGING.md`: Documentation for logging within the API.
-   `./api/email-notifications.js`: Manages email notifications.
-   `./api/enhanced-discovery-manager.js`: Manages enhanced discovery processes.
-   `./api/github-mcp-manager.js`: Manages GitHub MCP interactions.
-   `./api/.github/workflows/test.yml`: GitHub Actions workflow for API testing.
-   `./api/jest.config.js`, `./api/jest.simple.config.js`: Jest testing configurations.
-   `./api/jobs/complianceChecker.js`, `./api/jobs/metricsCollector.js`: Background jobs for compliance and metrics.
-   `./api/lib/html-sanitize.js`, `./api/lib/regex-safe.js`, `./api/lib/safe-exec.js`, `./api/lib/sql-identifiers.js`: Utility libraries.
-   `./api/mcp-connector.js`: Connects to MCP servers.
-   `./api/MCP_INTEGRATION.md`, `./api/MCP_INTEGRATION_WIKI.md`: Documentation for MCP integration.
-   `./api/middleware/*.js`: Various middleware for authentication, authorization, validation, and security.
-   `./api/models/*.js`: Database models for various entities (compliance, database, metrics, pipeline, user).
-   `./api/package.json`, `./api/package-lock.json`: Node.js project manifest and dependency lock file for the API.
-   `./api/perf/baseline.json`, `./api/perf/bench-concurrent.js`, `./api/perf/bench-response-time.js`, `./api/perf/harness.js`, `./api/perf/README.md`: Performance testing files.
-   `./api/phase2-endpoints.js`: Defines API endpoints for Phase 2.
-   `./api/routes/*.js`: API route definitions.
-   `./api/schemas/*.js`: Data schemas for validation.
-   `./api/scripts/*.js`: API-specific scripts.
-   `./api/SECURITY_IMPLEMENTATION.md`: Documentation for security implementation.
-   `./api/serena-orchestrator.js`: Orchestrates Serena Enhanced workflows.
-   `./api/server.js`, `./api/server-mcp.js`, `./api/server-v2.js`: Main API server files.
-   `./api/services/*.js`: API services.
-   `./api/test/*.js`, `./api/tests/*.js`: API test files.
-   `./api/test-infisical-admin.js`, `./api/test-infisical.js`: Infisical-specific tests.
-   `./api/utils/*.js`: API utility functions.
-   `./api/wiki-agent-manager.js`: Manages Wiki.js agent interactions.
-   `CLAUDE.md`: AI assistant instructions (generated).
-   `README.md`: Project documentation (generated).
-   `scripts/apply-template.sh`: Script for project creation and template application.
-   `scripts/deploy.sh`: Script for deploying the API.
-   `scripts/sync_github_repos.sh`: Script for manual GitHub repository synchronization.
-   `template-config.json`: Template configuration file.

## 4. Dependencies

-   **Runtime**: Node.js and Express.js for the API.
-   **System**: `systemd` for managing the API service (`gitops-audit-api`).
-   **Related Project**: `operations` (GitHub repository) for documentation and Standard Operating Procedures (SOPs).
-   **Configuration Management**: Infisical for secret management (implied by `infisical-admin.js` and `infisical.js` files).

## 5. Common Tasks

-   **Project Setup**:
    -   One-line creation: `git clone https://github.com/festion/homelab-project-template.git my-new-project && cd my-new-project && ./scripts/apply-template.sh`
    -   Interactive setup: `./scripts/apply-template.sh --interactive`
    -   Configure MCP servers: `./scripts/setup-mcp-config.sh`
    -   Initialize GitHub project: `./scripts/apply-github-project-template.py`
-   **Manual Audit**: Execute `/opt/gitops/scripts/sync_github_repos.sh`
-   **Deploy API**: Run `scripts/deploy.sh` (API only).
