# Project Index: homelab-gitops
## 1. Core Purpose
The `homelab-gitops` project serves as both a comprehensive project template for homelab environments and a GitOps Auditor. As an auditor, it scans homelab Git repositories for uncommitted changes, stale tags, missing files, and synchronization discrepancies between local and GitHub repositories. The results are presented via a React dashboard, powered by an Express API. As a template, it integrates multiple pre-configured Model Context Protocol (MCP) servers, automates documentation generation, and streamlines GitHub project management, supporting GitOps workflows.

## 2. Architecture
The project follows a client-server architecture:
-   **Frontend**: A React-based dashboard (implied by `frontend/` directory) for visualizing audit reports.
-   **Backend API**: An Express.js API (located in `api/`) handles business logic, interacts with various services, and provides data to the frontend.
    -   **MCP Integration**: The `api/mcp-connector.js` and `.mcp/` directory indicate integration with Model Context Protocol servers for various operations (filesystem, network, GitHub, Home Assistant, etc.).
    -   **Authentication & Security**: Managed by middleware (e.g., `api/middleware/auth.js`, `api/middleware/security.js`).
    -   **Data Models**: Defined in `api/models/` for entities like compliance, metrics, pipelines, and users.
    -   **Routes**: API endpoints are defined in `api/routes/`.
-   **Automation & Scripting**: `scripts/` contains various utility, setup, and deployment scripts. `.github/workflows/` defines GitHub Actions for CI/CD and automated processes.
-   **Configuration**: `config/` holds environment-specific and general settings.
-   **Documentation**: `docs/` and various `*.md` files at the root provide project documentation, with automation for generation and upload to WikiJS.

## 3. Key Files
-   `./api/add-homepage-secrets.js`: Script for adding secrets to the homepage.
-   `./api/AUTHENTICATION.md`: Documentation detailing API authentication methods.
-   `./api/config/infisical-admin.js`: Configuration for Infisical admin integration.
-   `./api/config/infisical.js`: General Infisical configuration.
-   `./api/config-loader.js`: Utility for loading configurations dynamically.
-   `./api/config/logging.js`: Configuration for API logging.
-   `./api/config/orchestrationProfiles.js`: Defines profiles for orchestration.
-   `./api/config/security-config-example.json`: Example security configuration.
-   `./api/createApp.js`: Initializes and configures the Express application.
-   `./api/csv-export.js`: Handles CSV data export functionality.
-   `./api/docs/LOGGING.md`: Documentation specific to API logging.
-   `./api/email-notifications.js`: Module for sending email notifications.
-   `./api/enhanced-discovery-manager.js`: Manages enhanced discovery processes.
-   `./api/github-mcp-manager.js`: Manages GitHub interactions via MCP.
-   `./api/.github/workflows/test.yml`: GitHub Actions workflow for API testing.
-   `./api/jest.config.js`: Jest testing framework configuration for the API.
-   `./api/jest.simple.config.js`: Simplified Jest configuration.
-   `./api/jobs/complianceChecker.js`: Background job for checking compliance.
-   `./api/jobs/metricsCollector.js`: Background job for collecting metrics.
-   `./api/lib/html-sanitize.js`: Utility for sanitizing HTML content.
-   `./api/lib/regex-safe.js`: Provides safe regular expression utilities.
-   `./api/lib/safe-exec.js`: Utility for safely executing commands.
-   `./api/lib/sql-identifiers.js`: Manages SQL identifiers.
-   `./api/mcp-connector.js`: Connects to and manages MCP servers.
-   `./api/MCP_INTEGRATION.md`: Documentation on MCP integration.
-   `./api/MCP_INTEGRATION_WIKI.md`: Wiki-specific documentation for MCP integration.
-   `./api/middleware/auth.js`: Middleware for user authentication.
-   `./api/middleware/authorization.js`: Middleware for user authorization.
-   `./api/middleware/enhanced-auth.js`: Enhanced authentication middleware.
-   `./api/middleware/enhanced-input-validation.js`: Enhanced input validation middleware.
-   `./api/middleware/enhanced-security-headers.js`: Middleware for enhanced security headers.
-   `./api/middleware/enhanced-security.js`: Enhanced security middleware.
-   `./api/middleware/enhanced-validation.js`: Enhanced validation middleware.
-   `./api/middleware/rateLimit.js`: Middleware for API rate limiting.
-   `./api/middleware/security-integration-example.js`: Example security integration middleware.
-   `./api/middleware/security.js`: General security middleware.
-   `./api/middleware/validation.js`: General input validation middleware.
-   `./api/middleware/webhook-middleware.js`: Middleware for handling webhooks.
-   `./api/models/compliance.js`: Database model for compliance data.
-   `./api/models/database.js`: Database connection and utilities.
-   `./api/models/metrics.js`: Database model for metrics data.
-   `./api/models/pipeline.js`: Database model for pipeline data.
-   `./api/models/user.js`: Database model for user data.
-   `./api/package.json`: Node.js package manifest for the API.
-   `./api/package-lock.json`: Node.js dependency lock file for the API.
-   `./api/perf/baseline.json`: Performance baseline data.
-   `./api/perf/bench-concurrent.js`: Concurrent performance benchmarking script.
-   `./api/perf/bench-response-time.js`: Response time performance benchmarking script.
-   `./api/perf/harness.js`: Performance testing harness.
-   `./api/perf/README.md`: Documentation for performance testing.

## 4. Dependencies
-   **Node.js**: The API is built with Express.js, requiring a Node.js runtime environment.
-   **npm**: Used for managing Node.js packages and dependencies.
-   **React**: The frontend dashboard is built with React.
-   **Git**: Essential for GitOps workflows, repository auditing, and managing the codebase.
-   **Systemd**: Used for managing the `gitops-audit-api` service in production.
-   **MCP Servers**: Integration with various Model Context Protocol servers is a core dependency.
-   **GitHub**: Relied upon for repository management, project boards, issue templates, and CI/CD workflows.
-   **Infisical**: Implied by `api/config/infisical.js` for secret management.
-   **WikiJS**: Used for documentation management and upload.

## 5. Common Tasks
-   **Project Setup**:
    -   `git clone https://github.com/festion/homelab-project-template.git my-new-project && cd my-new-project && ./scripts/apply-template.sh` (one-line creation).
    -   `./scripts/apply-template.sh --interactive` (interactive setup).
    -   `./scripts/setup-mcp-config.sh` (configure MCP servers).
    -   `./scripts/apply-github-project-template.py` (initialize GitHub project).
-   **Auditing**:
    -   Nightly audit (scheduled for 03:00).
    -   Manual audit: `/opt/gitops/scripts/sync_github_repos.sh`.
-   **Deployment**:
    -   `scripts/deploy.sh` (API only).
-   **Documentation**:
    -   `upload-docs-to-wiki.js` (for general documentation upload).
    -   `upload-mcp-docs-to-wikijs.py` (for MCP-specific documentation upload).
-   **Cleanup**:
    -   `cleanup-mcp-structure.sh` (for cleaning up MCP structure).
-   **Testing**:
    -   Running Jest tests within the `api/` directory (e.g., `jest`, `npm test`).
    -   Performance testing via scripts in `api/perf/`.
