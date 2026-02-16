Okay, the `PROJECT_INDEX.md` file has been created. What's next?

The `homelab-gitops` project serves as a central hub for managing a homelab environment. It orchestrates various services and configurations using GitOps principles, leveraging APIs, agents, and specialized modules for deployment, monitoring, and documentation. It integrates with tools like Infisical for secret management and WikiJS for documentation, providing a robust and automated infrastructure management solution.

## Architecture
The project's architecture is modular, centered around an `api` module that provides backend services, including routing, data models, and business logic. A `websocket` agent system (`agent-workspace/websocket`) enables real-time communication and task execution. Configuration management is handled by the `.mcp` (Multi-Cloud Platform) module, which integrates with the API via an `mcp-connector`. Dedicated `wikijs-ai-agent` and `wikijs-sync-agent` modules manage documentation generation and synchronization with Wiki.js. The `config` directory stores environment-specific settings, including integration with Infisical for secure secret management. Supporting modules like `infrastructure` and `monitoring` facilitate deployment and operational oversight, while an implied `frontend` (e.g., `dashboard`) provides a user interface.

## Key Files
*   `./agent-workspace/websocket/activate-agent.sh`: Script to activate the websocket agent.
*   `./agent-workspace/websocket/AGENT_TASKS.md`: Documentation for agent-specific tasks.
*   `./agent-workspace/websocket/docs/activate-websocket-agent.md`: Guide for activating the websocket agent.
*   `./agent-workspace/websocket/docs/websocket-deployment-agent.md`: Documentation on deploying the websocket agent.
*   `./agent-workspace/websocket/docs/WEBSOCKET-DEPLOYMENT-PLAN.md`: Plan for websocket agent deployment.
*   `./agent-workspace/websocket/PHASE2-EXECUTION-PLAN.md`: Execution plan for Phase 2, likely related to agent development.
*   `./agent-workspace/websocket/websocket-architecture.js`: Defines the architecture of the websocket agent.
*   `./api/add-homepage-secrets.js`: Script to add secrets to the homepage.
*   `./api/AUTHENTICATION.md`: Documentation for API authentication.
*   `./api/config/infisical-admin.js`: Configuration for Infisical admin integration.
*   `./api/config/infisical.js`: Configuration for general Infisical integration.
*   `./api/config-loader.js`: Utility for loading API configurations.
*   `./api/config/logging.js`: Configuration for API logging.
*   `./api/config/orchestrationProfiles.js`: Defines orchestration profiles for the API.
*   `./api/config/security-config-example.json`: Example security configuration for the API.
*   `./api/coverage/block-navigation.js`: Related to code coverage reports, likely for blocking navigation.
*   `./api/coverage/coverage-final.json`: Final code coverage report data.
*   `./api/coverage/lcov-report/block-navigation.js`: LCOV report for `block-navigation.js`.
*   `./api/coverage/lcov-report/prettify.js`: LCOV report utility for prettifying output.
*   `./api/coverage/lcov-report/sorter.js`: LCOV report utility for sorting.
*   `./api/coverage/prettify.js`: Utility for prettifying code coverage reports.
*   `./api/coverage/sorter.js`: Utility for sorting code coverage data.
*   `./api/csv-export.js`: API endpoint or service for exporting data to CSV.
*   `./api/docs/LOGGING.md`: Documentation for API logging.
*   `./api/email-notifications.js`: API service for sending email notifications.
*   `./api/enhanced-discovery-manager.js`: Manages enhanced discovery within the API.
*   `./api/github-mcp-manager.js`: Manages GitHub integrations with the MCP.
*   `./api/.github/workflows/test.yml`: GitHub Actions workflow for API testing.
*   `./api/jest.config.js`: Jest configuration for API unit tests.
*   `./api/jest.simple.config.js`: Simplified Jest configuration for API tests.
*   `./api/jobs/complianceChecker.js`: Job for checking compliance.
*   `./api/jobs/metricsCollector.js`: Job for collecting metrics.
*   `./api/mcp-connector.js`: Connects the API to the MCP system.
*   `./api/MCP_INTEGRATION.md`: Documentation for MCP integration with the API.
*   `./api/MCP_INTEGRATION_WIKI.md`: Wiki-specific documentation for MCP integration.
*   `./api/middleware/auth.js`: Authentication middleware for the API.
*   `./api/middleware/authorization.js`: Authorization middleware for the API.
*   `./api/middleware/enhanced-auth.js`: Enhanced authentication middleware.
*   `./api/middleware/enhanced-input-validation.js`: Enhanced input validation middleware.
*   `./api/middleware/enhanced-security-headers.js`: Middleware for enhanced security headers.
*   `./api/middleware/enhanced-security.js`: General enhanced security middleware.
*   `./api/middleware/enhanced-validation.js`: Enhanced validation middleware.
*   `./api/middleware/security-integration-example.js`: Example of security integration middleware.
*   `./api/middleware/security.js`: General security middleware.
*   `./api/middleware/validation.js`: Input validation middleware.
*   `./api/middleware/webhook-middleware.js`: Middleware for handling webhooks.
*   `./api/models/compliance.js`: Database model for compliance data.
*   `./api/models/database.js`: Database connection and utility module.
*   `./api/models/metrics.js`: Database model for metrics data.
*   `./api/models/pipeline.js`: Database model for pipeline data.

## Dependencies
*   **Runtime:** Node.js (for API and agent components), Python (for MCP scripts and other utilities).
*   **Build/Development:** npm (for Node.js dependency management), Jest (for testing), ESLint (for JavaScript linting), Prettier (for code formatting), pre-commit (for managing Git hooks).
*   **Key Libraries (Node.js):** Express.js (API framework), Infisical SDK (for secret management).

## Common Tasks
*   **Setup:**
    *   `npm install` (run in project root and `api/` directory to install Node.js dependencies).
    *   Ensure Python dependencies are met (e.g., via `pip install` for `.mcp` scripts).
*   **Run Development Server:**
    *   `node api/server.js` or `npm start` (if configured in `package.json`) to run the API server.
    *   Refer to `start-dev.ps1` for development startup scripts.
*   **Test:**
    *   `npm test` or `jest` (run from the `api/` directory) to execute API unit and integration tests.
    *   Check `.github/workflows/test.yml` for CI testing commands.
*   **Lint/Format:**
    *   `npm run lint` or `npm run format` (if configured in `package.json`), or directly use `eslint .` and `prettier --write .` to enforce code style.
    *   `.pre-commit-config.yaml` defines pre-commit hooks for linting/formatting.
*   **Deployment:**
    *   Refer to scripts like `deploy-v1.1.0.sh`, `update-production.sh`, `manual-deploy.sh`, and `docker-compose.production.yml` for deployment procedures.
    *   Use `validate-v1.1.0.sh` for deployment validation.
