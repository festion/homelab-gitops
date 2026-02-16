Okay, I've created the `PROJECT_INDEX.md` file.
02-16

## Purpose
The `homelab-gitops` project aims to automate the management and deployment of a homelab environment using GitOps principles. It integrates various services, including a Master Control Program (MCP), GitHub, Infisical for secret management, and potentially AI agents for content processing and automation. The project focuses on streamlined deployments, robust API interactions, and comprehensive monitoring and security within a continuously integrated and deployed system.

## Architecture
The project is structured around several key modules and services:
- **API Server (`api/`)**: Provides the core backend services, handling various integrations (MCP, GitHub, Infisical), data processing, authentication, and routing for different endpoints (e.g., `phase2-endpoints.js`, `server-mcp.js`). It also includes middleware for security and validation.
- **Agent Workspace (`agent-workspace/websocket/`)**: Contains components related to WebSocket communication, potentially for real-time agent interaction and task execution within the homelab.
- **MCP Integration (`.mcp/`, `api/mcp-connector.js`)**: Implements an interface with a Master Control Program for advanced automation, template application, and conflict resolution.
- **Frontend (`frontend/`)**: (Inferred, not fully detailed in provided structure) Likely houses the user interface for interacting with the homelab management system.
- **Infrastructure (`infrastructure/`)**: Contains definitions and scripts for managing the underlying infrastructure, likely using Infrastructure as Code (IaC) principles.
- **Deployment Scripts**: Various shell scripts (`deploy-v1.1.0.sh`, `update-production.sh`) manage the deployment lifecycle.
- **Documentation (`docs/`, various `.md` files)**: Extensive documentation covering API specifications, deployment guides, security considerations, and project overview.

## Key Files
- `README.md`: Main project overview and entry point.
- `package.json`: Defines project metadata, scripts, and dependencies for Node.js applications (root and `api/`).
- `deploy-v1.1.0.sh`: Primary script for deploying version 1.1.0 of the homelab services.
- `api/server.js`: Main entry point for the API backend.
- `api/AUTHENTICATION.md`: Details the authentication mechanisms and requirements for the API.
- `api/mcp-connector.js`: Module responsible for connecting and interacting with the MCP.
- `wikijs-ai-content-processor.js`: A JavaScript utility for processing content, likely with AI integration, for Wiki.js.
- `.pre-commit-config.yaml`: Configuration for pre-commit hooks to maintain code quality and standards.
- `create-consolidated-config.py`: Python script for creating a consolidated configuration.

## Dependencies
The project primarily uses Node.js.
- **Runtime Dependencies**: Managed via `package.json` files (e.g., in root and `api/` directories). Common modules include Express.js for the API, potentially `axios` or `node-fetch` for HTTP requests, and various utility libraries.
- **Development/Build Dependencies**: ESLint for linting, Prettier for code formatting, Jest for testing. Python is also used for utility scripts.

## Common Tasks
- **Install Dependencies**:
  ```bash
  npm install # In root and api/ directories
  ```
- **Run API Server**:
  ```bash
  npm start --prefix api/ # Or directly node api/server.js
  ```
- **Run Tests**:
  ```bash
  npm test --prefix api/
  npm test # For root level tests
  ```
- **Deploy**:
  ```bash
  ./deploy-v1.1.0.sh
  ./update-production.sh
  ```
- **Lint/Format Code**:
  ```bash
  npm run lint # (If defined in package.json)
  npm run format # (If defined in package.json)
  ```
- **Execute Utility Scripts**:
  ```bash
  python create-consolidated-config.py
  ```
