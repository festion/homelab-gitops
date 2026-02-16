Okay, I've created the `PROJECT_INDEX.md` file. What's next?
pose

The `homelab-gitops` project aims to manage and automate a home lab environment using GitOps principles. It integrates various services, including an API backend, a frontend dashboard, a "Master Control Program" (MCP) for orchestration, a Wiki.js-based documentation system with AI agent capabilities, and robust infrastructure for deployment, monitoring, and security. The project focuses on automated deployments, configuration management, and intelligent system operations to ensure a stable, self-healing, and easily maintainable homelab infrastructure.

## Architecture

The project is structured into several interconnected modules:

*   **API**: Provides backend services, including authentication, data export, GitHub integration, MCP connectivity, phase 2 endpoints (likely for advanced features), and webhook processing. It's built with Node.js/Express.
*   **Frontend**: Likely a web-based dashboard for interacting with the homelab services, managed by the `frontend` directory.
*   **MCP (.mcp/)**: The "Master Control Program" acts as an orchestration engine, managing backups, batch processing, conflict resolution, template application, and dependency management for various homelab services.
*   **Wiki.js AI Agent (wikijs-ai-agent/, wikijs-sync-agent/)**: Integrates AI capabilities with a Wiki.js instance for automated documentation, content processing, and synchronization.
*   **Infrastructure (infrastructure/)**: Contains configurations and scripts for deploying and managing the underlying infrastructure, potentially including Docker, Kubernetes/K3s, and networking.
*   **Monitoring (monitoring/)**: Implements systems for observing the health and performance of homelab services.
*   **Agent Workspace (agent-workspace/)**: Contains files related to specific agent tasks and websocket communication for real-time interactions.
*   **Scripts (scripts/)**: Houses various utility scripts for setup, deployment, and maintenance.

These modules interact through RESTful APIs, WebSockets, and shared configurations to achieve a cohesive GitOps-driven homelab management system.

## Key Files

*   `README.md`: Project overview and getting started guide.
*   `package.json`: Defines Node.js project metadata and dependencies for the root, and similar files exist in `api/` and `frontend/`.
*   `.pre-commit-config.yaml`: Configuration for pre-commit hooks to enforce code quality and standards.
*   `docker-compose.production.yml`: Defines the production Docker Compose setup for deploying services.
*   `install.sh`: Script for initial project setup and dependency installation.
*   `deploy-v1.1.0.sh`: Script for deploying a specific version of the homelab services.
*   `update-production.sh`: Script to update the production environment.
*   `api/server.js`: Main entry point for the API backend server.
*   `api/routes/`: Directory containing API route definitions.
*   `api/models/database.js`: Defines database connection and models for the API.
*   `api/middleware/auth.js`: Implements authentication middleware for API security.
*   `wikijs-ai-content-processor.js`: Core logic for AI-driven content processing for Wiki.js.
*   `create-consolidated-config.py`: Python script for consolidating configuration files.
*   `.mcp/pipeline-engine/`: Core components of the Master Control Program's pipeline engine.
*   `.prompts/`: Directory containing various prompts for AI agents and system interactions.

## Dependencies

The project primarily relies on Node.js/npm for its API and frontend components, indicated by `package.json` and `package-lock.json` files in the root and `api/` directories. Python is also used for various scripts and the MCP system, as evidenced by `.mcp/` and `.venv/` directories, suggesting a virtual environment. Runtime dependencies likely include:

*   Node.js (for API and frontend)
*   npm (for package management)
*   Python 3 (for MCP and scripts)
*   Docker and Docker Compose (for containerization and orchestration)
*   Potentially Kubernetes/K3s (for production deployments, suggested by `infrastructure/`)
*   Git (for version control and GitOps workflows)
*   Database systems (e.g., PostgreSQL for Wiki.js, possibly others for API data)

Build dependencies are managed through `package.json` for JavaScript projects and `requirements.txt` (if present) for Python.

## Common Tasks

*   **Setup**: Run `./install.sh` to set up initial project dependencies and environment.
*   **Development Start**: For Node.js services, navigate to the respective directory (e.g., `api/`) and run `npm start` or equivalent, or use `start-dev.ps1` for development environments.
*   **Testing**: Run `npm test` in relevant directories (e.g., `api/`) for unit and integration tests. Jest is used for testing in the API module (`api/jest.config.js`).
*   **Linting**: Use `npm run lint` or execute `./setup-linting.sh` to enforce code style and catch errors.
*   **Deployment**: Execute deployment scripts like `./deploy-v1.1.0.sh` or `./update-production.sh` for deploying to production environments. Manual deployment steps might be detailed in `manual-deploy.sh`.
*   **Configuration**: Modify configuration files in `config/` or `api/config/` and potentially run `create-consolidated-config.py`.
*   **Documentation Upload**: Use `upload-docs-to-wiki.js` or `upload-mcp-docs-to-wikijs.py` to synchronize documentation with Wiki.js.
