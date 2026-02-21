I have created the `PROJECT_INDEX.md` file. What would you like me to do next?
-gitops` project serves as a comprehensive GitOps repository for managing a homelab environment. It automates the deployment, configuration, and monitoring of various services and infrastructure components, ensuring consistency, reliability, and ease of management through version-controlled configurations and automated pipelines. It appears to integrate with AI agents for documentation, content processing, and general automation.

## Architecture

The project is structured around several key modules and their interactions:

*   **`api/`**: Contains the backend API services, likely built with Node.js/Express, handling various functionalities including MCP integration, enhanced discovery, email notifications, and general application logic. It includes middleware for authentication, authorization, and security.
*   **`.mcp/`**: Houses the "Master Control Program" logic, which includes Python scripts for backup management, batch processing, conflict resolution, and template application. This is central to managing configurations and deployments.
*   **`wikijs-ai-agent/` and `wikijs-sync-agent/`**: These directories suggest dedicated agents for interacting with Wiki.js, potentially for AI-driven content generation, synchronization of documentation, or knowledge management within the homelab.
*   **`frontend/`**: (Inferred from general project structure, though not detailed in provided key files) Likely contains the user interface for interacting with the homelab services or dashboards.
*   **`infrastructure/`**: (Inferred) Would contain infrastructure-as-code definitions (e.g., Terraform, Ansible) for provisioning and managing underlying resources.
*   **`agent-workspace/websocket/`**: Implements a websocket-based communication for agents, possibly enabling real-time control, monitoring, and task execution.
*   **`scripts/`**: Contains various shell scripts for deployment, setup, and other operational tasks.

## Key Files

*   **`./API_SPECIFICATION.md`**: Documents the API endpoints and data structures.
*   **`./package.json`**: Defines project metadata and Node.js dependencies for the root project.
*   **`./docker-compose.production.yml`**: Defines the production Docker Compose setup for deploying services.
*   **`./install.sh`**: Script for initial project setup or installation.
*   **`./deploy-v1.1.0.sh`**: Script for deploying version 1.1.0 of the project.
*   **`./update-production.sh`**: Script for updating the production environment.
*   **`./wikijs-ai-content-processor.js`**: JavaScript file for processing content for Wiki.js using AI.
*   **`./.mcp/backup-manager.py`**: Python script for managing backups within the MCP framework.
*   **`./api/server.js`**: Main entry point for the API server.
*   **`./api/AUTHENTICATION.md`**: Documentation for API authentication mechanisms.
*   **`./api/jest.config.js`**: Configuration file for Jest unit tests in the API module.
*   **`./.github/workflows/`**: GitHub Actions workflows for CI/CD pipelines.

## Dependencies

*   **Node.js/npm**: Indicated by `package.json`, `package-lock.json`, `.eslintrc.js`, `.prettierrc`, and numerous `.js` files in `api/` and at the root.
*   **Python**: Indicated by the `.mcp/` directory with `.py` files, and `create-consolidated-config.py`.
*   **Docker/Docker Compose**: Evidenced by `docker-compose.production.yml` and `docker-compose.green.yml`.
*   **Jest**: For JavaScript testing, as seen by `jest.config.js` files.
*   **Infisical**: For secrets management, indicated by `INFISICAL_INTEGRATION_COMPLETE.md`, `HOMEPAGE_INFISICAL_INTEGRATION_COMPLETE.md`, and `api/config/infisical.js`.

## Common Tasks

*   **Install Dependencies**: Run `npm install` in the root and `api/` directories, and potentially `pip install -r requirements.txt` if Python dependencies are explicitly listed.
*   **Build**: For Node.js projects, a build step might be configured in `package.json` (e.g., `npm run build`), or it might be directly run through Docker Compose.
*   **Test**: Execute `npm test` or `npx jest` in relevant directories (e.g., `api/`). Specific configurations are in `jest.config.js`.
*   **Deploy**: Utilize shell scripts like `deploy-v1.1.0.sh`, `update-production.sh`, or orchestrate deployments via `docker-compose.production.yml`.
*   **Develop**: `start-dev.ps1` suggests a development startup script, likely involving local server processes.
