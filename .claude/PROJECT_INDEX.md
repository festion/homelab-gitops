**Please note:** The `PROJECT_INDEX.md` file has been updated. This file is not intended to be a substitute for the `README.md` file. It is a high-level overview of the project's structure and key components, intended for developers who are new to the project.
ting various services like Wiki.js for documentation, Infisical for secret management, and a custom "MCP" (Master Control Program) for automation and configuration. The project emphasizes security, maintainability, and efficient management of a complex homelab setup.

## Architecture
The project follows a modular architecture, centered around an `api` backend, an `agent-workspace` for automated tasks, and integration with external systems.
*   **API Layer (`api/`):** Provides core backend services, including endpoints for various functionalities, MCP integration, security middleware, data handling (models, schemas), and email notifications. It serves as the central hub for interacting with the homelab components.
*   **Agent Workspace (`agent-workspace/websocket/`):** Houses an agent-based system, likely for executing automated tasks and deployments. It utilizes websockets for real-time communication and orchestration.
*   **MCP (`.mcp/`):** A set of Python scripts and configurations (`backup-manager.py`, `batch-processor.py`, `pipeline-engine/`, `template-applicator.py`) indicating a custom framework for managing configuration, backups, and potentially deployment pipelines.
*   **Wiki.js Integration (`wikijs-ai-agent/`, `wikijs-sync-agent/`, `wikijs-ai-content-processor.js`):** Dedicated modules and scripts for synchronizing content with a Wiki.js instance, potentially leveraging AI for content processing and generation.
*   **Configuration (`config/`, `.mcp.json`, `STANDARD_MCP_CONFIG.json`):** Centralized configuration management across various components.
*   **Infrastructure (`infrastructure/`, `nginx/`, `docker-compose.*.yml`):** Defines the deployment infrastructure using Docker Compose for container orchestration and Nginx for proxying.
*   **Frontend (`frontend/`, `dashboard/`):** (Inferred) While not fully detailed, likely contains user interface components for interacting with the homelab management system.

## Key Files
*   `README.md`: The primary project overview and entry point.
*   `package.json`: Defines Node.js project metadata and dependencies.
*   `deploy-v1.1.0.sh`: A shell script for deploying version 1.1.0 of the project.
*   `update-production.sh`: Script for updating the production environment.
*   `create-consolidated-config.py`: Python script for consolidating various configuration files.
*   `wikijs-ai-content-processor.js`: JavaScript module for processing content for Wiki.js, potentially using AI.
*   `api/server.js`: Main entry point for the API backend.
*   `api/mcp-connector.js`: Connects the API to the MCP system.
*   `api/middleware/security.js`: Handles security-related middleware for the API.
*   `api/models/database.js`: Defines database connection and interaction logic.
*   `agent-workspace/websocket/websocket-architecture.js`: Outlines the architecture of the WebSocket agent.
*   `API_SPECIFICATION.md`: Documentation detailing the project's API.
*   `DEPLOYMENT_ARCHITECTURE.md`: Describes the overall deployment architecture.
*   `INFISICAL_INTEGRATION.md`: Documentation on integrating with Infisical for secret management.
*   `cleanup-mcp-structure.sh`: Script for cleaning up MCP-related structures.
*   `.pre-commit-config.yaml`: Configuration for pre-commit hooks to enforce code quality.

## Dependencies
*   **Node.js / npm:** Core for the API, agent workspace, and other JavaScript-based utilities.
*   **Python:** Used for MCP scripts, configuration processing, and potentially other automation tasks.
*   **Git:** Fundamental for the GitOps workflow, version control, and repository management.
*   **Docker / Docker Compose:** For containerization and orchestration of services in the homelab environment.
*   **Infisical:** External service for managing secrets and environment variables.
*   **Wiki.js:** External platform for documentation and content management.
*   **Bash:** For executing various shell scripts throughout the project.

## Common Tasks
*   **Install Dependencies:**
    *   For Node.js projects: `npm install` (in root, `api/`, `frontend/` directories).
    *   For Python projects: `pip install -r requirements.txt` (after activating `venv/`).
*   **Run API Server:** `npm start` (in `api/` directory) or using `docker-compose`.
*   **Run Tests:** `npm test` (in `api/` directory, configured by `jest.config.js`).
*   **Lint Code:** `npm run lint` or `npx eslint .` (for JavaScript), or using `setup-linting.sh`.
*   **Deploy:** Execute relevant deployment scripts like `deploy-v1.1.0.sh`, `manual-deploy.sh`, or `update-production.sh`.
*   **Develop:** Use `start-dev.ps1` for local development setup.
