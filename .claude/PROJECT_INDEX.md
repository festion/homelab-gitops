# Project Index: homelab-gitops

## 1. Core Purpose

The `homelab-gitops` project serves as a comprehensive GitOps Auditor and a project template for homelab environments. Its primary functions include auditing Git repositories for uncommitted changes, stale tags, missing files, and local-vs-GitHub synchronization drift, with results previously served via a React dashboard (now retired) backed by an Express API. Additionally, it provides a robust framework with integrated MCP (Model Context Protocol) servers, automated documentation generation, and streamlined GitHub project management.

## 2. Architecture

The codebase is structured around an **Express.js API** (within the `api/` directory) that handles integrations with various services (GitHub, MCP), processes audit data, and provides core backend functionalities. **MCP Servers** (managed within the `.mcp/` and related directories) extend capabilities across diverse homelab services such as Filesystem, Network-FS, GitHub, Home Assistant, Proxmox, TrueNAS, WikiJS, Serena Enhanced, Code Linter, and Directory Polling. Automation and GitOps workflows are facilitated by shell scripts (`scripts/`), GitHub Actions (`.github/workflows/`), and scheduled cron jobs (`cron/`). Audit reports and historical snapshots are stored in dedicated `output/` and `audit-history/` directories, respectively. Configuration for the entire system is centralized in the `config/` directory.

## 3. Key Files

*   `./api/add-homepage-secrets.js`: Script to integrate homepage secrets.
*   `./api/AUTHENTICATION.md`: API authentication documentation.
*   `./api/config/infisical-admin.js`: Infisical admin configuration.
*   `./api/config/infisical.js`: General Infisical integration configuration.
*   `./api/config-loader.js`: Utility for loading API configurations.
*   `./api/config/logging.js`: API logging configuration.
*   `./api/config/orchestrationProfiles.js`: Orchestration profile definitions.
*   `./api/config/security-config-example.json`: Example security configuration for the API.
*   `./api/createApp.js`: Main Express application creation module.
*   `./api/csv-export.js`: Handles CSV export functionality for the API.
*   `./api/docs/LOGGING.md`: Detailed logging documentation for the API.
*   `./api/email-notifications.js`: Module for sending email notifications from the API.
*   `./api/enhanced-discovery-manager.js`: Manages enhanced discovery processes within the API.
*   `./api/github-mcp-manager.js`: Manages GitHub-related MCP interactions for the API.
*   `./api/.github/workflows/test.yml`: GitHub Actions workflow for API testing.
*   `./api/jest.config.js`: Jest testing framework configuration for the API.
*   `./api/jobs/complianceChecker.js`: API job for compliance checking.
*   `./api/jobs/metricsCollector.js`: API job for collecting system metrics.
*   `./api/lib/safe-exec.js`: Utility for safe execution of shell commands in the API.
*   `./api/mcp-connector.js`: Module responsible for connecting to MCP servers.
*   `./api/MCP_INTEGRATION.md`: Documentation for MCP integration within the API.
*   `./api/middleware/auth.js`: API authentication middleware.
*   `./api/middleware/authorization.js`: API authorization middleware.
*   `./api/middleware/enhanced-security.js`: Enhanced security middleware for the API.
*   `./api/models/database.js`: Database connection and utility module for the API.
*   `./api/models/user.js`: User data model for the API.
*   `./api/package.json`: Node.js package manifest for the API.
*   `./api/phase2-endpoints.js`: Specific API endpoints for Phase 2 development.
*   `./api/SECURITY_IMPLEMENTATION.md`: API security implementation documentation.
*   `./api/serena-orchestrator.js`: Orchestration module for Serena functionalities.
*   `./api/server.js`: Primary entry point for the API server.
*   `./api/server-mcp.js`: Dedicated API server for MCP interactions.
*   `./api/server-v2.js`: Version 2 of the API server.
*   `./api/test-infisical-admin.js`: Tests for Infisical admin functionality.
*   `./api/test-infisical.js`: Tests for general Infisical integration.
*   `./CLAUDE.md`: Instructions and production wiring for AI assistants.
*   `./README.md`: Project overview, key features, and quick start guide.
*   `./scripts/apply-template.sh`: Script for applying project templates.
*   `./scripts/setup-mcp-config.sh`: Script for configuring MCP servers.
*   `./scripts/sync_github_repos.sh`: Script for manually synchronizing GitHub repositories.
*   `./scripts/deploy.sh`: Script for deploying the API service.

## 4. Dependencies

*   **Node.js/npm**: Runtime environment and package manager for the API services.
*   **Express.js**: Web application framework used by the API.
*   **Systemd**: Service manager used for `gitops-audit-api` in production.
*   **Git**: Fundamental for GitOps auditing and repository management.
*   **Infisical**: Employed for secrets management.
*   **Jest**: Testing framework used for API unit and integration tests.
*   **`operations` repository**: An external, related project providing documentation and standard operating procedures.

## 5. Common Tasks

*   **Project Initialization**: Set up a new project by cloning the repository and running `./scripts/apply-template.sh`. An interactive setup is available with `--interactive`.
*   **MCP Server Configuration**: Configure the integrated MCP servers using `./scripts/setup-mcp-config.sh`.
*   **GitHub Project Setup**: Initialize GitHub project features (e.g., issue templates, project boards) with `./scripts/apply-github-project-template.py`.
*   **Manual Git Audit**: Trigger a manual audit of configured Git repositories by executing `/opt/gitops/scripts/sync_github_repos.sh`.
*   **API Deployment**: Deploy the API service to production using `scripts/deploy.sh`.
*   **Secrets Management**: Add and manage homepage secrets, often involving `api/add-homepage-secrets.js` and Infisical.
*   **Testing**: Run API tests using Jest (e.g., `npm test` within the `api/` directory).
*   **Linting**: Ensure code quality by adhering to `.eslintrc.js` and running linting scripts like `setup-linting.sh`.
