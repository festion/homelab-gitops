I have created the `PROJECT_INDEX.md` file as you requested. It provides a concise overview of the project's purpose, architecture, key files, and dependencies.
ab infrastructure using GitOps principles. It encompasses automation, documentation, and various integrations to streamline deployment, configuration management, and monitoring. The system aims to provide a robust framework for continuous delivery and operational consistency across homelab services, with a focus on integrating AI-driven content processing and secret management.

## 2. Architecture

The project's architecture is modular, built around several key components:

*   **API Server (`./api/`):** A Node.js-based backend providing core functionality, including secret management (Infisical integration), GitHub MCP (Managed Config Processor) management, data export, and exposing various endpoints for application services. It integrates with middleware for authentication, authorization, and enhanced security.
*   **Agent Workspace (`./agent-workspace/websocket/`):** Contains the WebSocket-based agent responsible for executing tasks, likely coordinating deployments or automation workflows within the homelab environment.
*   **MCP (Managed Config Processor) Framework (`./.mcp/`):** A Python-based system for managing and processing configurations, including backup management, batch processing, conflict resolution, and template application. It forms the core of the GitOps approach.
*   **Wiki.js Integration (`./wikijs-ai-agent/`, `./wikijs-sync-agent/`):** Modules for synchronizing content with a Wiki.js instance, potentially utilizing AI for content processing and generation.
*   **Frontend (`./frontend/`):** (Implied) A user interface for interacting with the homelab services, possibly for monitoring, configuration, or content management.
*   **Infrastructure (`./infrastructure/`):** (Implied) Configuration and scripts related to the underlying homelab infrastructure (e.g., Kubernetes manifests, Docker Compose files).
*   **Monitoring (`./monitoring/`):** (Implied) Components for observing the health and performance of homelab services.

These components interact through defined APIs, WebSocket connections, and shared configuration files, enabling automated deployment, management, and documentation of homelab resources.

## 3. Key Files

*   `./agent-workspace/websocket/activate-agent.sh`: Script to activate the WebSocket agent.
*   `./agent-workspace/websocket/AGENT_TASKS.md`: Documentation on tasks handled by the WebSocket agent.
*   `./agent-workspace/websocket/websocket-architecture.js`: Defines the architecture of the WebSocket agent.
*   `./api/add-homepage-secrets.js`: Script to add secrets to the homepage service.
*   `./api/AUTHENTICATION.md`: Documentation detailing API authentication mechanisms.
*   `./api/config-loader.js`: Utility for loading application configurations.
*   `./api/csv-export.js`: Module for exporting data in CSV format.
*   `./api/email-notifications.js`: Handles sending email notifications.
*   `./api/enhanced-discovery-manager.js`: Manages enhanced service discovery.
*   `./api/github-mcp-manager.js`: Manages GitHub-based MCP interactions.
*   `./api/jest.config.js`: Jest configuration for API unit tests.
*   `./api/jobs/complianceChecker.js`: Background job for checking compliance.
*   `./api/jobs/metricsCollector.js`: Background job for collecting metrics.
*   `./api/mcp-connector.js`: Connects to the MCP framework.
*   `./api/MCP_INTEGRATION.md`: Documentation on MCP integration.
*   `./api/middleware/auth.js`: Authentication middleware for API routes.
*   `./api/models/database.js`: Defines database connection and models.
*   `./api/server.js`: Main entry point for the API server.
*   `./api/services/infisical.js`: Service for interacting with Infisical secret management.
*   `./api/tests/infisical-admin.test.js`: Tests for Infisical admin functionality.
*   `./create-consolidated-config.py`: Python script to create a consolidated configuration.
*   `./cleanup-mcp-structure.sh`: Shell script for cleaning up MCP related structures.
*   `./deploy-v1.1.0.sh`: Script for deploying version 1.1.0 of the homelab services.
*   `./install.sh`: Main installation script for the project.
*   `./package.json`: Node.js project manifest, listing dependencies and scripts.
*   `./README.md`: Project overview and getting started guide.
*   `./setup-linting.sh`: Script to configure linting for the project.
*   `./update-production.sh`: Script to update the production environment.
*   `./wikijs-ai-content-processor.js`: JavaScript AI content processor for Wiki.js.
*   `./wikijs-content-processor-cli.js`: CLI for the Wiki.js content processor.
*   `./wikijs-upload-test.js`: Test script for Wiki.js content upload.
*   `./.mcp/backup-manager.py`: Python script for MCP backup operations.
*   `./.mcp/template-applicator.py`: Python script for applying MCP templates.

## 4. Dependencies

*   **Node.js/npm:** The primary runtime environment for the API server and various utility scripts. Dependencies are managed via `package.json` and `package-lock.json` in the root and `./api/` directories (e.g., `express`, `jest`, `axios`, `infisical-node`).
*   **Python:** Used for the MCP framework (`./.mcp/`) and other scripting tasks (e.g., `create-consolidated-config.py`).
*   **Bash/Shell:** Numerous `.sh` scripts for setup, deployment, and operational tasks.
*   **Git:** Core dependency for the GitOps workflow, managing configuration and code versions.
*   **Docker/Docker Compose:** Used for containerization and orchestration of services (`docker-compose.production.yml`, `docker-compose.green.yml`).

## 5. Common Tasks

*   **Install Dependencies:**
    ```bash
    ./install.sh
    # Also navigate to ./api and run npm install
    cd api && npm install
    ```
*   **Start Development Server:**
    ```bash
    # For API server
    cd api && npm start
    # For other services, refer to specific docker-compose files or scripts
    ```
*   **Run Tests:**
    ```bash
    # For API unit tests
    cd api && npm test
    # Or specifically using Jest
    cd api && npx jest --config jest.config.js
    ```
*   **Deploy Services:**
    ```bash
    ./deploy-v1.1.0.sh
    ./update-production.sh
    ```
*   **Lint Code:**
    ```bash
    ./setup-linting.sh
    # For JavaScript files
    npm run lint # (if configured in package.json)
    ```
*   **Clean MCP Structure:**
    ```bash
    ./cleanup-mcp-structure.sh
    ```
