I have created the `PROJECT_INDEX.md` file as requested. I will wait for your next instruction.
ims to manage and automate a homelab environment utilizing GitOps principles. It focuses on streamlined deployments, configuration management, and the integration of various services. Key aspects include a robust backend API, secure secret management via Infisical, and automated documentation synchronization with Wiki.js, potentially enhanced by AI agents for content processing and operational automation.

## Architecture
*   **API (`api/`):** The core backend services, including primary servers (`server.js`, `server-mcp.js`, `server-v2.js`), authentication, data handling, and integrations with external platforms like GitHub and Infisical.
*   **Managed Configuration Project (MCP - `.mcp/`):** Contains Python-based tools for configuration management, pipeline execution, template application, and backup strategies, central to the GitOps workflow.
*   **Wiki.js Integration (`wikijs-ai-agent/`, `wikijs-sync-agent/`, `wikijs-ai-content-processor.js`):** Modules dedicated to content processing, synchronization, and AI-driven operations for the Wiki.js documentation platform.
*   **Agent Workspace (`agent-workspace/`):** Houses components for various agents, particularly a `websocket/` sub-module for communication and task automation, including deployment.
*   **Frontend (`frontend/`):** (Inferred) Likely contains the user interface for interacting with the homelab management system.
*   **Infrastructure (`infrastructure/`):** (Inferred) Typically holds Infrastructure as Code (IaC) definitions.
*   **Monitoring (`monitoring/`):** (Inferred) Configuration for observing system health and performance.

## Key Files
*   `README.md`: Primary project overview and getting started guide.
*   `package.json` (root and `api/`): Defines Node.js project dependencies and scripts.
*   `install.sh`: Script for initial project setup and dependency installation.
*   `deploy-v1.1.0.sh`: Specific script for deploying version 1.1.0 of the project.
*   `update-production.sh`: Script for updating the production environment.
*   `wikijs-ai-content-processor.js`: JavaScript module for processing content for Wiki.js using AI.
*   `api/server.js`: The main entry point for the project's API server.
*   `INFISICAL_INTEGRATION.md`: Documentation detailing the integration with Infisical for secret management.
*   `API_SPECIFICATION.md`: Comprehensive documentation for the project's API endpoints and functionalities.
*   `.github/workflows/`: Directory containing CI/CD workflow definitions (e.g., `test.yml`).
*   `docker-compose.production.yml`: Defines the production Docker container orchestration.

## Dependencies
*   **Node.js/npm:** Runtime environment and package manager for the API and potential frontend components (managed by `package.json`).
*   **Python:** Runtime for configuration management scripts within the `.mcp/` directory, typically managed with a virtual environment (`venv/`).
*   **Docker/Docker Compose:** Used for containerization and orchestrating various services in development and production environments.
*   **Git:** Essential for version control and the GitOps operational model.
*   **Infisical:** External secret management platform.
*   **Wiki.js:** External platform for documentation hosting and management.

## Common Tasks
*   **Install Dependencies:** Run `npm install` in the root and `api/` directories. Python dependencies would typically be installed via `pip` within the `venv/`.
*   **Run Development Server:** Use `npm start` in the `api/` directory or execute `start-dev.ps1` for local development.
*   **Test:** Execute `npm test` or `jest` commands, particularly within the `api/` directory, leveraging `jest.config.js`.
*   **Deploy:** Utilize deployment scripts such as `./deploy-v1.1.0.sh` or `./update-production.sh` for specific version deployments or production updates.
*   **Lint/Code Style Check:** Run `npm run lint` (if configured in `package.json`) or execute `./setup-linting.sh` to ensure code quality and adherence to style guidelines.
