# Project Index: homelab-gitops

## 1. Core Purpose
The `homelab-gitops` project serves as a comprehensive system for managing a homelab environment through GitOps principles. Its primary purpose is to automate deployment, configuration, monitoring, and operational tasks across various services and infrastructure components. This includes an API backend, a dashboard for visualization, integration with micro-controller platforms (MCP), and AI-driven documentation and content processing (WikiJS AI Agent, Claude integration).

## 2. Architecture
The architecture is modular and distributed, built around several key components:

*   **API Layer (`api/`)**: Provides various endpoints for managing homelab resources, integrations, and services. It includes a `server.js` for core API functionality, `phase2-endpoints.js` for specific phase-based APIs, and `websocket-server.js` for real-time communication.
*   **Dashboard (`dashboard/`)**: A frontend application for visualizing homelab status, metrics, and controlling various aspects of the environment.
*   **Micro-Controller Platform (MCP) Integration (`mcp-servers/`, `mcp-integrations/`)**: A framework for integrating and managing various micro-controller-based services (e.g., `code-linter-mcp-server`, `wikijs-mcp-server`).
*   **Infrastructure Management (`infrastructure/`)**: Contains configurations and scripts for managing cloudflare, grafana, homepage, kea, monitoring, node-red, promtail, proxmox-agent, and traefik.
*   **Monitoring (`monitoring/`, `logs/`)**: Utilizes tools like Loki and Prometheus for collecting and visualizing logs and metrics across the homelab environment.
*   **Automation & Scripting (`scripts/`)**: A collection of bash and JavaScript scripts for deployment, backups, health checks, security setup, and various operational tasks.
*   **WikiJS AI Agent (`wikijs-ai-agent/`)**: An AI-powered agent for processing and managing documentation within WikiJS, including analytics and metrics tracking.
*   **Deployment**: Leverages `docker-compose.production.yml` for orchestrating services in a containerized environment.

## 3. Key Files
*   `API_SPECIFICATION.md`: Details the API endpoints and their functionalities.
*   `DEPLOYMENT_ARCHITECTURE.md`: Describes the overall deployment architecture.
*   `docker-compose.production.yml`: Defines the services, networks, and volumes for production deployment.
*   `package.json`: Main project dependencies and scripts. Sub-projects like `api`, `dashboard`, and `mcp-servers` also have their own `package.json`.
*   `PRODUCTION_DEPLOYMENT_GUIDE.md`: Provides instructions for deploying the project to production.
*   `wikijs-ai-content-processor.js`: Core logic for the WikiJS AI content processing.
*   `api/server.js`: The main entry point for the API server.
*   `dashboard/src/main.ts`: The main entry point for the dashboard frontend (assuming a React/Vite setup).
*   `infrastructure/traefik/`: Traefik proxy configurations.
*   `config/deployment-config.json`: Centralized deployment configuration.
*   `scripts/deploy.sh`: Primary deployment script.
*   `PHASE3A-VISION.md`: Outlines the vision for a specific development phase.
*   `HOMEPAGE_INFISICAL_INTEGRATION_COMPLETE.md`: Documents the completion of Infisical integration for the homepage.
*   `STANDARD_MCP_CONFIG.json`: Standard configuration for Micro-Controller Platform.
*   `RELATED_PROJECTS.md`: Lists related projects or components.
*   `api/jest.config.js`: Jest configuration for API unit and integration tests, including coverage thresholds and module mappings.
*   `dashboard/src/components/WikiAgent/analytics/types/metricsTypes.js`: Defines analytics data models, KPIs, alert thresholds, and utility functions for the WikiJS Agent.

## 4. Dependencies
The project has dependencies across various components:

*   **Node.js**: Managed via `package.json` files in the root, `api/`, `dashboard/`, and `mcp-servers/` directories. These include frameworks like Express.js for the API, React for the dashboard, and various utility libraries.
*   **Python**: Dependencies are managed within the `venv/` directory, used for scripts and potentially `mcp-enhanced-servers`. Examples include `watchdog` for file system monitoring.
*   **Docker**: Services are orchestrated using Docker Compose, as defined in `docker-compose.production.yml`, which includes databases, web servers, and application services.
*   **External Services**: Integrations with services like Infisical for secret management, GitHub for MCP management, and WikiJS for documentation.
*   **Monitoring Tools**: Prometheus and Loki are used for system monitoring and log aggregation.
