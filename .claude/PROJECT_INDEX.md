I have created the `PROJECT_INDEX.md` file as requested.
 1) Purpose

The `homelab-gitops` project aims to provide a comprehensive, GitOps-managed solution for a homelab environment. It integrates various services, including a central API, a frontend interface, infrastructure automation, monitoring capabilities, and AI/automation agents (like the WikiJS AI Agent and an MCP system) to ensure efficient deployment, management, and operation of homelab resources. The system emphasizes automated deployments, configuration management, and intelligent task execution through a combination of custom services and established tools.

## 2) Architecture

The project's architecture is modular, primarily driven by services and components that interact to manage the homelab environment.

- **API (`api/`)**: A Node.js backend serving as the central hub for various functionalities, including authentication, data processing, and orchestration. It integrates with external systems like GitHub and potentially other "MCP" components. It includes routes, services, models, and middleware for robust operation.
- **Frontend (`frontend/`)**: (Implied, not fully detailed in provided file list) A user interface for interacting with the homelab services and visualizing data.
- **Infrastructure (`infrastructure/`)**: Manages the underlying infrastructure, likely through Infrastructure as Code (IaC) principles, defining how services are deployed and configured.
- **MCP System (`.mcp/`, `mcp-servers/`, `api/mcp-connector.js`)**: A Master Control Program framework with components for batch processing, conflict resolution, template application, and dependency management, crucial for automated operations and configuration.
- **WikiJS AI Agent (`wikijs-ai-agent/`, `wikijs-ai-content-processor.js`)**: An intelligent agent designed to interact with a WikiJS instance, potentially for documentation generation, content processing, or knowledge management.
- **Agent Workspace (`agent-workspace/websocket/`)**: A WebSocket-based environment for various agents to communicate and execute tasks, likely involving deployment and orchestration.
- **NGINX (`nginx/`)**: Acts as a reverse proxy and load balancer, routing traffic to different services within the homelab.
- **Monitoring (`monitoring/`)**: Components responsible for collecting metrics, logging, and providing insights into the health and performance of the homelab services.

## 3) Key Files

- `./API_SPECIFICATION.md`: Documentation detailing the API endpoints and their usage.
- `./CI_CD_PIPELINE_IMPLEMENTATION.md`: Outlines the implementation plan for the Continuous Integration/Continuous Deployment pipeline.
- `./create-consolidated-config.py`: A Python script likely used for generating a unified configuration from disparate sources.
- `./deploy-v1.1.0.sh`: A shell script for deploying version 1.1.0 of the project.
- `./docker-compose.production.yml`: Docker Compose configuration for production environment deployment.
- `./package.json`: Main project dependencies and scripts for the Node.js ecosystem.
- `./README.md`: General overview and getting started guide for the project.
- `./wikijs-ai-content-processor.js`: Core logic for the WikiJS AI content processing.
- `./api/server.js`: The main entry point for the API backend server.
- `./api/routes/`: Directory containing API route definitions.
- `./api/services/`: Directory for API business logic and service implementations.
- `./api/models/`: Directory for API data models and database interactions.
- `./api/middleware/auth.js`: Middleware for authentication in the API.
- `./api/tests/`: Directory containing API-specific tests.
- `./.mcp/pipeline-engine/`: Core components of the MCP pipeline engine.
- `./agent-workspace/websocket/websocket-architecture.js`: Defines the architecture of the WebSocket agent workspace.

## 4) Dependencies

- **Runtime:**
    - Node.js (for API and various JavaScript utilities)
    - Python (for MCP system scripts like `create-consolidated-config.py` and `.mcp/` utilities)
    - Docker & Docker Compose (for containerized deployments)
    - Nginx (for reverse proxying)
- **Build/Development:**
    - npm (Node.js package manager)
    - Git (for version control and GitOps workflows)
    - Jest (for JavaScript testing)
    - ESLint, Prettier (for code quality and formatting)

## 5) Common Tasks

- **Setup & Installation**:
    - `sh install.sh`: Initial project setup.
    - `sh setup-linting.sh`: Configure linting tools.
- **Development**:
    - `npm install` (in root and `api/` directories): Install Node.js dependencies.
    - `npm start` (or similar scripts defined in `package.json`): Start development servers.
    - `./start-dev.ps1`: (For PowerShell users) Start development environment.
- **Testing**:
    - `npm test` (or `npm run test:unit`, `npm run test:integration` as per `package.json`): Run tests.
    - `npx jest` (in `api/` directory): Execute API specific tests.
- **Deployment**:
    - `sh deploy-v1.1.0.sh`: Deploy a specific version.
    - `sh manual-deploy.sh`: Perform a manual deployment.
    - `sh update-production.sh`: Update the production environment.
    - `docker-compose -f docker-compose.production.yml up -d`: Deploy using Docker Compose in production mode.
- **Cleanup**:
    - `sh cleanup-mcp-structure.sh`: Clean up MCP related structures.
