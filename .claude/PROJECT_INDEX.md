Done.
lab-gitops Project Index

Generated: 2026-02-16

## Purpose
The `homelab-gitops` project aims to manage and automate the deployment and configuration of a homelab environment using GitOps principles. It integrates various components including an API backend, a frontend dashboard, infrastructure definitions, and AI-driven content processing and synchronization with Wiki.js, leveraging Git as the single source of truth for all configurations and deployments.

## Architecture
The project follows a modular architecture:
-   **API Backend (`api/`)**: Provides various services including authentication, data export, email notifications, enhanced discovery, GitHub MCP management, and integration with Wiki.js and Infisical. It serves as the central hub for interacting with the homelab components.
-   **Frontend (`frontend/`)**: Likely a web-based dashboard for visualizing and interacting with the homelab status and controls. (Details not fully available in current context)
-   **Infrastructure (`infrastructure/`)**: Contains definitions for deploying and managing the underlying homelab infrastructure (e.g., Kubernetes manifests, Docker Compose files).
-   **MCP Server (`.mcp/`, `mcp-servers/`, `mcp-enhanced-servers/`)**: Manages configurations, templates, and batch processing for various services, acting as a "Managed Configuration Processor".
-   **Wiki.js Integration (`wikijs-ai-agent/`, `wikijs-sync-agent/`)**: Modules responsible for AI-driven content generation/processing and synchronization of documentation with a Wiki.js instance.
-   **Agent Workspace (`agent-workspace/`)**: Contains components related to agent activation and deployment, possibly for orchestrating various tasks within the homelab.

These components interact through APIs, webhooks, and shared configuration managed via Git.

## Key Files
-   `package.json`: Defines project metadata and Node.js dependencies.
-   `docker-compose.production.yml`: Production Docker Compose configuration for deploying services.
-   `install.sh`: Script for initial project setup and dependency installation.
-   `update-production.sh`: Script for updating the production deployment.
-   `api/server.js`: Main entry point for the API backend.
-   `api/AUTHENTICATION.md`: Documentation for API authentication mechanisms.
-   `api/SECURITY_IMPLEMENTATION.md`: Details on security implementation within the API.
-   `wikijs-ai-content-processor.js`: Core logic for AI-driven content processing for Wiki.js.
-   `create-consolidated-config.py`: Python script for consolidating configuration files.
-   `.pre-commit-config.yaml`: Configuration for pre-commit hooks to enforce code quality.
-   `README.md`: General project overview and getting started guide.

## Dependencies
-   **Node.js**: Required for the API backend and various utility scripts (indicated by `package.json` and `package-lock.json` in root and `api/`).
-   **Python**: Used for MCP components (`.mcp/`), configuration scripts (`create-consolidated-config.py`), and potentially other automation (indicated by `venv/`).
-   **Docker/Docker Compose**: Essential for deploying and managing services across the homelab infrastructure.
-   **Git**: Core for GitOps workflow, managing all configurations and code.

## Common Tasks
-   **Installation**: Run `install.sh` to set up the development environment and dependencies.
-   **Testing**: Execute `npm test` or `jest` commands within relevant directories (e.g., `api/`) to run unit and integration tests.
-   **Deployment**: Use `docker-compose.production.yml` with `docker-compose up -d` for production deployments, or specific scripts like `deploy-v1.1.0.sh` or `update-production.sh`.
-   **Development**: Start development servers (e.g., `start-dev.ps1` or `npm run dev` in respective project parts) for local development.
-   **Linting/Formatting**: Run `npm run lint` or use configured pre-commit hooks (`.pre-commit-config.yaml`) to maintain code style and quality.
