# Project Index: homelab-gitops

## 1. Core Purpose
The `homelab-gitops` project serves as a comprehensive GitOps framework for managing a homelab environment. Its core purpose is to automate, monitor, and document the various services and infrastructure components within the homelab using a declarative, version-controlled approach. This includes API services, continuous deployment pipelines, monitoring solutions, and AI-driven content processing for WikiJS.

## 2. Architecture
The project employs a modular and distributed architecture, consisting of several interconnected components:

*   **API Services (`api/`):** A Node.js-based backend providing various functionalities, including authentication, data handling, and integration with the Management Control Plane (MCP) and WikiJS.
*   **Management Control Plane (MCP):** A central system for orchestrating and managing homelab resources. This includes:
    *   **MCP Servers (`mcp-servers/`):** Specialized servers for different domains (e.g., code linting, directory polling, network, Proxmox, TrueNAS, WikiJS).
    *   **MCP Integrations (`mcp-integrations/`):** Clients that connect to MCP servers for specific tasks.
    *   **MCP Enhanced Servers (`mcp-enhanced-servers/`):** Advanced Python-based services like directory polling and documentation tools.
*   **WikiJS AI/Sync Agents (`wikijs-ai-agent/`, `wikijs-sync-agent/`):** Components responsible for AI-enhanced content generation, processing, and synchronization of documentation with a WikiJS instance.
*   **Deployment & CI/CD:** A set of scripts and configurations (`.github/workflows/`, `scripts/deployment/`) for automated continuous integration and deployment of homelab services.
*   **Monitoring (`monitoring/`, `infrastructure/grafana`):** Configurations for Prometheus, Grafana, Loki, and Promtail to collect, visualize, and alert on homelab metrics and logs.
*   **Dashboard (`dashboard/`):** A frontend application for a consolidated view and interaction with the homelab's status and managed services.
*   **Infrastructure (`infrastructure/`):** Declarative configurations for various infrastructure components like Cloudflare, Homepage, Kea, Node-RED, Proxmox, and Traefik.
*   **Scripts (`scripts/`):** A collection of shell and Python scripts for automation, health checks, auditing, and maintenance tasks.

## 3. Key Files

*   `README.md`: Project overview and getting started guide.
*   `PROJECT_OVERVIEW.md`: High-level summary of the project.
*   `API_SPECIFICATION.md`: Details of the project's API.
*   `DEPLOYMENT_ARCHITECTURE.md`: Describes the deployment strategy and infrastructure.
*   `CI_CD_PIPELINE_IMPLEMENTATION.md`: Outlines the CI/CD pipeline.
*   `wikijs-ai-agent/README.md`: Documentation for the AI-powered WikiJS agent.
*   `wikijs-sync-agent/README.md`: Documentation for the WikiJS synchronization agent.
*   `api/server.js`: Main entry point for the API services.
*   `api/package.json`: Node.js dependencies for the API.
*   `dashboard/package.json`: Node.js dependencies for the dashboard frontend.
*   `wikijs-ai-agent/requirements.txt`: Python dependencies for the WikiJS AI agent.
*   `.mcp/pipeline-engine/`: Core logic for the MCP pipeline.
*   `config/deployment-config.json`: Central deployment configuration.
*   `docker-compose.production.yml`: Docker Compose configuration for production deployments.
*   `./PHASE3A-VISION.md`: Vision document for Phase 3A.
*   `./HOMEPAGE_INFISICAL_INTEGRATION_COMPLETE.md`: Documentation on Infisical integration for the homepage.
*   `./STANDARD_MCP_CONFIG.json`: Standard configuration for MCP.
*   `./RELATED_PROJECTS.md`: Information on related projects.

## 4. Dependencies
The project leverages a mix of Node.js and Python ecosystems:

*   **Node.js Dependencies (from `package.json` files in `api/`, `dashboard/`, `mcp-servers/`, `wikijs-sync-agent/`):**
    *   `express`: Web framework for API services.
    *   `axios`: HTTP client for making requests.
    *   `mongoose` / `pg`: Database ORMs/drivers (MongoDB, PostgreSQL).
    *   `socket.io`: For WebSocket communication.
    *   `jest`: Testing framework.
    *   `react` / `vite` / `tailwindcss`: Frontend development for the dashboard.
    *   `nodemon`: For development server auto-restarts.
    *   `dotenv`: Environment variable management.
    *   `winston`: Logging library.
*   **Python Dependencies (from `wikijs-ai-agent/requirements.txt` and `venv/`):**
    *   `watchdog`: File system event monitoring.
    *   `pkg_resources`: Package resource management.
    *   `anthropic`: Likely for Claude AI integration in the WikiJS agent.
