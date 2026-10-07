# Project Index: homelab-gitops
## 1. Core Purpose
The `homelab-gitops` codebase functions as a GitOps Auditor for homelab environments. Its primary role is to audit Git repositories for uncommitted changes, stale tags, missing files, and local-vs-GitHub synchronization drift. The audit results are served via an Express API. Additionally, this repository serves as a comprehensive project template for homelab environments, integrating MCP (Model Context Protocol) servers, facilitating automated documentation generation, and streamlining GitHub project management.

## 2. Architecture
The project employs a client-server architecture. The backend is an Express API (Node.js) which operates as a `systemd` service named `gitops-audit-api` on port 3070. This API is responsible for executing Git audits, generating reports (e.g., `/output/GitRepoReport.json`), and providing data. While a React dashboard was initially part of the design, the UI component has been retired. The `api/` directory houses the core API logic, including routing, middleware, data models, and various services. The system also integrates with multiple MCP servers as described in the `README.md`.

## 3. Key Files
*   **API Entry Points & Core:**
    *   `./api/server.js`, `./api/server-v2.js`, `./api/createApp.js`: Primary server bootstrapping and application creation.
    *   `./api/config-loader.js`: Centralized configuration loading mechanism for the API.
*   **API Configuration:**
    *   `./api/config/infisical-admin.js`, `./api/config/infisical.js`: Configuration for Infisical secret management.
    *   `./api/config/logging.js`: Defines logging settings for the API.
    *   `./api/config/orchestrationProfiles.js`: Orchestration profiles settings.
    *   `./api/config/security-config-example.json`: Example security configuration.
*   **Authentication & Security:**
    *   `./api/AUTHENTICATION.md`, `./api/SECURITY_IMPLEMENTATION.md`: Documentation detailing authentication and security implementations.
    *   `./api/middleware/auth.js`, `./api/middleware/authorization.js`, `./api/middleware/enhanced-auth.js`: Middleware for user authentication and authorization.
    *   `./api/middleware/security.js`, `./api/middleware/enhanced-security.js`, `./api/middleware/enhanced-security-headers.js`: Middleware for general security practices and header enforcement.
*   **MCP Integration:**
    *   `./api/mcp-connector.js`: Handles connections and interactions with MCP servers.
    *   `./api/MCP_INTEGRATION.md`, `./api/MCP_INTEGRATION_WIKI.md`: Documentation related to the Model Context Protocol integration.
*   **Utilities & Services:**
    *   `./api/add-homepage-secrets.js`: Script for adding homepage secrets.
    *   `./api/csv-export.js`: Functionality for exporting data to CSV format.
    *   `./api/email-notifications.js`: Service for sending email notifications.
    *   `./api/enhanced-discovery-manager.js`: Manages enhanced discovery processes.
    *   `./api/github-mcp-manager.js`: Integrates GitHub operations with MCP.
    *   `./api/wiki-agent-manager.js`: Manages agents interacting with WikiJS.
    *   `./api/serena-orchestrator.js`: Orchestrates Serena-related workflows.
    *   `./api/lib/html-sanitize.js`, `./api/lib/regex-safe.js`, `./api/lib/safe-exec.js`, `./api/lib/sql-identifiers.js`: Reusable utility libraries for common tasks.
*   **Jobs & Monitoring:**
    *   `./api/jobs/complianceChecker.js`, `./api/jobs/metricsCollector.js`: Scheduled jobs for compliance checks and metrics collection.
    *   `./api/models/compliance.js`, `./api/models/metrics.js`, `./api/models/pipeline.js`, `./api/models/user.js`, `./api/models/database.js`: Database models for various entities.
*   **Testing & Performance:**
    *   `./api/jest.config.js`, `./api/jest.simple.config.js`: Configuration files for Jest testing framework.
    *   `./api/.github/workflows/test.yml`: GitHub Actions workflow definition for continuous integration testing.
    *   `./api/perf/baseline.json`, `./api/perf/bench-concurrent.js`, `./api/perf/bench-response-time.js`, `./api/perf/harness.js`, `./api/perf/README.md`: Files related to performance testing and benchmarking.
*   **Root Level Core:**
    *   `./CLAUDE.md`: Specific instructions and context for AI assistants.
    *   `./README.md`: General project documentation, quick start guide, and features overview.
    *   `./package.json`: Defines project metadata, scripts, and dependencies.
    *   `./scripts/apply-template.sh`, `./scripts/setup-mcp-config.sh`, `./scripts/apply-github-project-template.py`, `./scripts/sync_github_repos.sh`, `./scripts/deploy.sh`: Essential shell and Python scripts for project setup, MCP configuration, GitHub integration, and deployment.
    *   `./output/GitRepoReport.json`: The latest generated Git audit report.
    *   `./audit-history/`: Directory storing historical snapshots of audit reports.
    *   `./.prompts/`: Contains various prompt templates for different operations.
    *   `./.mcp/`: Contains scripts and templates specific to MCP functionalities.

## 4. Dependencies
*   **Programming Language:** Node.js (JavaScript/TypeScript for API).
*   **Package Management:** npm (managed by `package.json` files).
*   **Runtime Environment:** Express.js framework for the API.
*   **System Services:** `systemd` for managing the API service (`gitops-audit-api`).
*   **External Integrations:**
    *   GitHub for repository management, project boards, and workflows.
    *   Infisical for secure secret management.
    *   Various MCP servers, including Filesystem, Network-FS, GitHub, Home Assistant, Proxmox, TrueNAS, WikiJS, Serena Enhanced, Code Linter, and Directory Polling.

## 5. Common Tasks
*   **Project Setup & Initialization:**
    *   `./scripts/apply-template.sh`: To clone and set up a new project instance. This script supports an interactive mode.
    *   `./scripts/setup-mcp-config.sh`: Used for configuring the various MCP servers integrated into the project.
    *   `./scripts/apply-github-project-template.py`: To initialize optional GitHub project components such as issue templates and project boards.
*   **Git Auditing:**
    *   `/opt/gitops/scripts/sync_github_repos.sh`: Manually triggers a scan of Git repositories.
    *   A nightly audit is scheduled to run automatically at 03:00.
*   **Deployment:**
    *   `scripts/deploy.sh`: Deploys the API component of the system. Note that the dashboard UI has been retired.
*   **Development & Debugging:**
    *   `memory-search "<query>" --project homelab-gitops`: Use this command to search the project's knowledge base before making significant changes, particularly to routes, deploy paths, or CodeQL-flagged areas.
    *   Run tests using Jest, configured via `./api/jest.config.js` or `./api/jest.simple.config.js`.
