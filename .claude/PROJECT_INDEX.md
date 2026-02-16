I have created the `PROJECT_INDEX.md` file.
026-02-16

## Purpose

The `homelab-gitops` project aims to automate the management, deployment, and documentation of a home lab environment using GitOps principles. It integrates various services, including a robust API for system interaction, WebSocket-based agents for real-time operations, and a documentation system (Wiki.js) for automated content processing and synchronization. The project emphasizes automation, security, and structured configuration management through tools like Infisical and a custom Micro-Control Plane (MCP).

## Architecture

The project follows a modular architecture, primarily centered around Node.js services and Python scripts, orchestrated for GitOps deployment:

*   **API (`api/`):** The core backend services, responsible for exposing functionalities to manage the homelab. This includes routes, models, services, and middleware for authentication, authorization, and validation. It integrates with Infisical for secrets management and interacts with MCP services.
*   **Agent Workspace (`agent-workspace/websocket/`):** Contains WebSocket-based agents for real-time communication and automation tasks within the homelab ecosystem.
*   **Infrastructure (`infrastructure/`):** Houses infrastructure-as-code definitions, likely including Docker Compose files (`docker-compose.production.yml`) and potentially Kubernetes manifests for defining the homelab's environment.
*   **Micro-Control Plane (MCP) (`.mcp/`, `mcp-servers/`):** A custom system for managing configurations, deployments, and various automated tasks within the homelab. It includes components like backup managers, batch processors, and template applicators.
*   **Wiki.js Integration (`wikijs-ai-agent/`, `wikijs-sync-agent/`, `wikijs-ai-content-processor.js`):** Dedicated agents and scripts for interacting with a Wiki.js instance, facilitating automated documentation generation, content processing, and synchronization.
*   **Prompts (`.prompts/`):** A directory for managing AI prompts, indicating integration with AI agents for various operational or content generation tasks.
*   **Dashboard (`dashboard/`):** (Inferred, as content is not shown) Likely a frontend application for visualizing homelab status and interacting with the API.

## Key Files

*   `README.md`: The main project README, providing a general overview.
*   `package.json`: Defines project metadata, scripts, and Node.js dependencies for both the root project and the `api` service.
*   `.pre-commit-config.yaml`: Configuration for pre-commit hooks to enforce code quality and standards.
*   `docker-compose.production.yml`: Defines the Docker services, networks, and volumes for production deployment.
*   `install.sh`: Script for initial project setup and installation.
*   `deploy-v1.1.0.sh`, `update-production.sh`: Scripts for deploying and updating the homelab services.
*   `create-consolidated-config.py`: A Python script for consolidating configuration files.
*   `wikijs-ai-content-processor.js`: JavaScript content processor for Wiki.js.
*   `api/server.js`: The main entry point for the API backend server.
*   `api/websocket-server.js`: The entry point for the WebSocket server.
*   `api/mcp-connector.js`: Connects the API to the Micro-Control Plane.
*   `api/AUTHENTICATION.md`: Documentation detailing the API's authentication mechanisms.
*   `api/SECURITY_IMPLEMENTATION.md`: Documentation on security measures implemented within the API.
*   `api/jest.config.js`: Configuration file for Jest unit tests within the API module.
*   `CI_CD_PIPELINE_IMPLEMENTATION.md`: Documentation related to Continuous Integration/Continuous Deployment pipeline implementation.
*   `PRODUCTION_DEPLOYMENT_GUIDE.md`: A guide for deploying the project to a production environment.

## Dependencies

*   **Runtime:** Node.js (for API and various scripts), Python (for `.mcp` tools and other scripts), Docker/Docker Compose (for deployment).
*   **Build/Dev:** `npm` or `yarn` for package management, `Jest` for testing, `ESLint` and `Prettier` for code linting and formatting, `pre-commit` for Git hooks.

## Common Tasks

*   **Setup:** Run `npm install` (in root and `api/`) to install Node.js dependencies. For Python dependencies, check for `requirements.txt` in relevant directories and use `pip install -r requirements.txt`.
*   **Development:**
    *   To start development servers, refer to `start-dev.ps1` or similar scripts, which may involve running Node.js services locally.
*   **Build:**
    *   No explicit "build" step is typically required for Node.js applications beyond dependency installation, but specific frontend (e.g., `dashboard/`) or documentation components might have their own build processes defined in their `package.json` scripts.
*   **Test:**
    *   Run unit tests for the API: Navigate to `api/` and execute `npm test` or `jest`.
*   **Deploy:**
    *   For local Docker-based deployment: `docker-compose -f docker-compose.production.yml up -d`.
    *   For specific version deployments: Execute `deploy-v1.1.0.sh` or `update-production.sh`.
    *   Consult `PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed production deployment steps.
*   **Linting/Formatting:**
    *   Run `npm run lint` or similar commands (defined in `package.json`) for code linting.
    *   Code formatting is typically enforced via `prettier` and `eslint`.
