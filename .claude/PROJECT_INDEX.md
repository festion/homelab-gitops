# Project Index: homelab-gitops
## 1. Core Purpose
The `homelab-gitops` project serves as a comprehensive template repository for homelab environments, integrating Model Context Protocol (MCP) servers, automating documentation generation, and streamlining GitHub project management. A key application within this framework is the GitOps Auditor, an Express API-backed service that audits homelab Git repositories for uncommitted changes, stale tags, missing files, and synchronization drift between local and GitHub states, presenting the results via an API (the React dashboard UI has been retired).

## 2. Architecture
The project's core architecture revolves around a Node.js/Express API (running on port 3070, service name `gitops-audit-api`) that provides the backend for the GitOps Auditor. This API integrates with various MCP servers for different functionalities (e.g., Filesystem, Network-FS, GitHub, Home Assistant, WikiJS).

Key architectural components include:
*   **API Layer (`api/`):** Handles routes, middleware (authentication, authorization, rate limiting, security, validation), data models, and business logic. It includes an `enhanced-discovery-manager`, `github-mcp-manager`, `mcp-connector`, `serena-orchestrator`, and `wiki-agent-manager`.
*   **Configuration (`config/` within `api/` and root):** Manages environment-specific settings, logging, orchestration profiles, and security configurations (e.g., `infisical-admin.js`, `infisical.js`, `security-config-example.json`).
*   **Data Models (`api/models/`):** Defines schema and interaction logic for entities like compliance, database, metrics, pipeline, and users.
*   **Middleware (`api/middleware/`):** A robust set of middleware for security (`auth.js`, `authorization.js`, `enhanced-security.js`, `security.js`), input validation (`validation.js`, `enhanced-input-validation.js`, `enhanced-validation.js`), and rate limiting (`rateLimit.js`).
*   **Jobs (`api/jobs/`):** Contains scheduled tasks such as `complianceChecker.js` and `metricsCollector.js`.
*   **Performance (`api/perf/`):** Includes tools for benchmarking and performance testing (e.g., `bench-concurrent.js`, `bench-response-time.js`, `harness.js`).
*   **Scripts (`scripts/` and `api/scripts/`):** Utility scripts for deployment, setup, and other operational tasks.
*   **MCP Integration (`.mcp/`, `mcp-servers/`, `mcp-integrations/`):** Defines and manages the various Model Context Protocol servers for different integrations (e.g., backup management, batch processing, template application).
*   **Documentation (`docs/`, `API_SPECIFICATION.md`, `CLAUDE.md`, `README.md`):** Extensive documentation covering setup, configuration, deployment, and AI assistant instructions.
*   **Auditing and Reporting:** The system scans `/repos`, generates reports in `/output/GitRepoReport.json`, and stores historical snapshots in `/audit-history/`.

## 3. Key Files
*   `./API_SPECIFICATION.md`: Defines the API contract and endpoints.
*   `./CLAUDE.md`: AI assistant instructions and production wiring details.
*   `./README.md`: Project overview, features, quick start, and related projects.
*   `./scripts/deploy.sh`: Script for deploying the API service.
*   `./scripts/sync_github_repos.sh`: Manual script for initiating a GitHub repository audit/sync.
*   `./api/server.js`, `./api/server-mcp.js`, `./api/server-v2.js`: Entry points for different versions or configurations of the API server.
*   `./api/createApp.js`: Core application creation logic for the Express API.
*   `./api/config-loader.js`: Utility for loading application configurations.
*   `./api/middleware/auth.js`, `./api/middleware/authorization.js`: Key middleware for user authentication and authorization.
*   `./api/models/database.js`: Defines the database connection and core interaction logic.
*   `./api/package.json`: Defines project metadata and Node.js dependencies for the API.
*   `./.mcp/README.md`: Documentation for the Model Context Protocol (MCP) servers.
*   `./.mcp/template-applicator.py`, `./.mcp/template-selector.py`: Scripts related to MCP template management.
*   `./config/deployment-config.json`: Project-wide deployment configurations.
*   `./config/database.js`: Database configuration settings.
*   `./wikijs-ai-content-processor.js`: Script for processing content for Wiki.js via AI.

## 4. Dependencies
The `homelab-gitops` project, particularly its API component, relies on a Node.js environment. Key dependencies typically found in such an Express.js application include:
*   **Express.js:** Web framework for building the API.
*   **Database Client:** (e.g., `pg` for PostgreSQL, `mongoose` for MongoDB) for interacting with the database.
*   **Authentication/Authorization Libraries:** (e.g., `passport`, `jsonwebtoken`, `bcrypt`) for securing API endpoints.
*   **Logging Libraries:** (e.g., `winston`, `morgan`) for application logging.
*   **Configuration Libraries:** (e.g., `dotenv`, `nconf`) for managing environment variables and settings.
*   **Validation Libraries:** (e.g., `joi`, `express-validator`) for input schema validation.
*   **Testing Frameworks:** (e.g., `jest`, `supertest`) for unit and integration testing.
*   **Utility Libraries:** (e.g., `lodash`, `async`) for common programming tasks.

Specific to this project, dependencies for MCP server integrations and other utilities for GitHub interaction, email notifications, CSV export, and Wiki.js management are also present as indicated by the file names.

## 5. Common Tasks
*   **Project Setup:**
    *   One-line project creation: `git clone ... && cd my-new-project && ./scripts/apply-template.sh`
    *   Interactive setup: `./scripts/apply-template.sh --interactive`
    *   Configure MCP servers: `./scripts/setup-mcp-config.sh`
    *   Initialize GitHub project: `./scripts/apply-github-project-template.py`
*   **Auditing:**
    *   Manual Git repository audit: `/opt/gitops/scripts/sync_github_repos.sh`
    *   Review current audit report: `/output/GitRepoReport.json`
*   **Deployment:**
    *   Deploy the API: `scripts/deploy.sh`
*   **Development:**
    *   Debugging API issues (check `/output/GitRepoReport.json` for parsing errors).
    *   Modifying API routes, middleware, or data models within the `api/` directory.
    *   Writing and running tests using `jest.config.js` or `jest.simple.config.js`.
*   **Monitoring:**
    *   Checking historical audit snapshots in `/audit-history/`.
*   **Documentation:**
    *   Updating project documentation in `README.md`, `CLAUDE.md`, and the `docs/` directory.
