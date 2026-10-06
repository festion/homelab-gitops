# Project Index: homelab-gitops

## 1. Core Purpose
The `homelab-gitops` project serves as a comprehensive GitOps auditor for homelab environments. Its primary function is to audit git repositories for uncommitted changes, stale tags, missing files, and synchronization drift between local and GitHub repositories. It provides an Express API for serving audit results and integrates with multiple Model Context Protocol (MCP) servers to enable infrastructure automation, automated documentation generation, and GitHub project management. Although historically featuring a React dashboard, the UI component has been retired (ops #4355), focusing the current deployment on the API.

## 2. Architecture
The project employs a multi-faceted architecture:
-   **API Backend**: An Express.js application (centered around `api/server.js`, `api/server-mcp.js`, `api/server-v2.js`) exposes endpoints for audit results, MCP interactions, and various automation tasks. It includes middleware for authentication, authorization, validation, and security (`api/middleware/`).
-   **Data Models**: Mongoose models (`api/models/`) define schemas for compliance, metrics, pipelines, and users, interacting with a database.
-   **Configuration**: Centralized configuration management through files in `config/` and `api/config/`, loaded by `api/config-loader.js`.
-   **Job Processing**: Background tasks like `complianceChecker.js` and `metricsCollector.js` are managed within `api/jobs/`.
-   **MCP Integration**: Integrates with over 10 MCP servers (Filesystem, Network-FS, GitHub, Home Assistant, etc.) via a connector (`api/mcp-connector.js`) and managers (`api/github-mcp-manager.js`). MCP-related logic is found in the `.mcp/` and `mcp-integrations/` directories.
-   **Auditing Engine**: Scripts and logic perform repository scans (e.g., `scripts/sync_github_repos.sh`) on `/repos`, generating reports (e.g., `/output/GitRepoReport.json`) and maintaining historical snapshots (`/audit-history/`).
-   **GitHub Workflows**: Automated processes and templates reside in `.github/` directories for CI/CD and project management.

## 3. Key Files

-   `api/add-homepage-secrets.js`: Script or module for adding homepage-related secrets.
-   `api/AUTHENTICATION.md`: Documentation detailing the API's authentication mechanisms.
-   `api/config/infisical-admin.js`: Configuration for Infisical Admin integration.
-   `api/config/infisical.js`: General Infisical configuration.
-   `api/config-loader.js`: Utility for loading application configurations.
-   `api/config/logging.js`: Configuration specific to logging within the API.
-   `api/config/orchestrationProfiles.js`: Defines orchestration profiles for various operations.
-   `api/config/security-config-example.json`: Example security configuration for the API.
-   `api/createApp.js`: Core file responsible for initializing the Express application.
-   `api/csv-export.js`: Module for exporting data in CSV format.
-   `api/docs/LOGGING.md`: Documentation on the logging setup and practices.
-   `api/email-notifications.js`: Module for handling email notifications.
-   `api/enhanced-discovery-manager.js`: Manages enhanced discovery processes.
-   `api/github-mcp-manager.js`: Manages GitHub interactions through the MCP.
-   `api/.github/workflows/test.yml`: GitHub Actions workflow for running tests.
-   `api/jest.config.js`: Jest configuration for API unit tests.
-   `api/jest.simple.config.js`: Simplified Jest configuration.
-   `api/jobs/complianceChecker.js`: Background job for checking compliance.
-   `api/jobs/metricsCollector.js`: Background job for collecting metrics.
-   `api/lib/html-sanitize.js`: Utility for sanitizing HTML content.
-   `api/lib/regex-safe.js`: Provides utilities for safe regular expression handling.
-   `api/lib/safe-exec.js`: Utility for safely executing external commands.
-   `api/lib/sql-identifiers.js`: Manages SQL identifiers.
-   `api/mcp-connector.js`: Connects the API to Model Context Protocol (MCP) servers.
-   `api/MCP_INTEGRATION.md`: Documentation on MCP integration within the API.
-   `api/MCP_INTEGRATION_WIKI.md`: Wiki-specific documentation for MCP integration.
-   `api/middleware/auth.js`: Authentication middleware.
-   `api/middleware/authorization.js`: Authorization middleware.
-   `api/middleware/enhanced-auth.js`: Enhanced authentication middleware.
-   `api/middleware/enhanced-input-validation.js`: Enhanced input validation middleware.
-   `api/middleware/enhanced-security-headers.js`: Enhanced security headers middleware.
-   `api/middleware/enhanced-security.js`: General enhanced security middleware.
-   `api/middleware/enhanced-validation.js`: Enhanced validation middleware.
-   `api/middleware/rateLimit.js`: Rate limiting middleware.
-   `api/middleware/security-integration-example.js`: Example security integration middleware.
-   `api/middleware/security.js`: General security middleware.
-   `api/middleware/validation.js`: Input validation middleware.
-   `api/middleware/webhook-middleware.js`: Middleware for handling webhooks.
-   `api/models/compliance.js`: Mongoose model for compliance data.
-   `api/models/database.js`: Database connection and setup.
-   `api/models/metrics.js`: Mongoose model for metrics data.
-   `api/models/pipeline.js`: Mongoose model for pipeline data.
-   `api/models/user.js`: Mongoose model for user data.
-   `api/package.json`: Node.js package definition for the API.
-   `api/phase2-endpoints.js`: Defines API endpoints for Phase 2.
-   `api/routes/`: Directory containing API route definitions.
-   `api/SECURITY_IMPLEMENTATION.md`: Documentation on API security implementation.
-   `api/serena-orchestrator.js`: Orchestrates Serena-related tasks.
-   `api/server.js`: Main API server entry point.
-   `api/server-mcp.js`: API server entry point with MCP specific routes/logic.
-   `api/server-v2.js`: Version 2 of the API server.
-   `api/services/`: Directory for API business logic services.
-   `api/test/`: Directory for API tests.
-   `CLAUDE.md`: Instructions and production wiring for the Claude AI assistant.
-   `README.md`: Project overview, features, and quick start guide.
-   `scripts/apply-template.sh`: Script for applying project templates.
-   `scripts/deploy.sh`: Script for deploying the API.
-   `scripts/sync_github_repos.sh`: Script for synchronizing GitHub repositories and triggering audits.

## 4. Dependencies
The primary dependencies for the API backend are defined in `api/package.json` and include:
-   **Express.js**: Web framework for the API.
-   **Mongoose**: MongoDB object modeling for Node.js.
-   **Various Middleware**: For security, authentication, validation, and rate limiting.
-   **Utilities**: For tasks such as HTML sanitization, safe execution, and regular expression handling.
-   **Testing**: Jest for unit and integration tests.

Project-level dependencies are in the root `package.json` and include:
-   **ESLint/Prettier**: For code quality and formatting.

## 5. Common Tasks
-   **Project Setup**: Clone the repository and run `./scripts/apply-template.sh` (or `--interactive`) to set up a new project instance.
-   **Configure MCP Servers**: Execute `./scripts/setup-mcp-config.sh` to configure MCP servers.
-   **Initialize GitHub Project**: Run `./scripts/apply-github-project-template.py` for optional GitHub project initialization.
-   **Deploy API**: Use `scripts/deploy.sh` to deploy the API service.
-   **Manual Audit**: Trigger a manual audit of GitHub repositories by running `/opt/gitops/scripts/sync_github_repos.sh`.
-   **Access API**: The API service `gitops-audit-api` runs on port `3070`.
-   **Review Audit Reports**: Check `/output/GitRepoReport.json` for the current audit report and `/audit-history/` for historical snapshots.
-   **Development**: Work within the `api/` directory for backend development and utilize Jest for testing.
-   **Code Quality**: Adhere to ESLint and Prettier configurations for code quality and style.
