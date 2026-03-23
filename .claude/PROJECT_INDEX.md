# Project Index: homelab-gitops
## 1. Core Purpose
The `homelab-gitops` project aims to manage and automate a home lab environment using GitOps principles. This involves declarative infrastructure management, continuous deployment, monitoring, automated documentation, and integration with various services (e.g., WikiJS, Infisical, Proxmox, TrueNAS) through a Model Context Protocol (MCP).

## 2. Architecture
The project follows a modular and distributed architecture, primarily composed of:

*   **API Server (`api/`):** A Node.js-based API serving various endpoints, including webhook processing, MCP integration, and data management. It handles authentication, data schemas, and integrates with databases.
*   **Frontend/Dashboard (`dashboard/`, `frontend/`):** A web-based interface (likely React/Vite based on `dashboard/package.json`) for visualizing the homelab status, managing deployments, and interacting with the system.
*   **Model Context Protocol (MCP) Servers and Clients (`.mcp/`, `mcp-servers/`, `mcp-enhanced-servers/`, `mcp-integrations/`):** A central component for standardizing communication and interaction with various homelab services (e.g., network devices, Proxmox, TrueNAS, WikiJS). This includes specialized servers and clients for different integrations.
*   **Documentation and WikiJS Integration (`wikijs-ai-agent/`, `wikijs-sync-agent/`):** Modules responsible for generating, processing, and synchronizing documentation with a WikiJS instance, potentially leveraging AI for content creation and management.
*   **Infrastructure as Code (`infrastructure/`, `nginx/`, `monitoring/`):** Configuration files and scripts for defining and deploying infrastructure components, including Nginx for routing, Prometheus/Loki/Promtail for monitoring, and other homelab services.
*   **Automation Scripts (`scripts/`, `cron/`):** A collection of Bash and Python scripts for deployment, system audits, health checks, backups, and other scheduled tasks.
*   **Containerization:** Utilizes Docker and Docker Compose (`docker-compose.production.yml`) for deploying services in isolated containers.

## 3. Key Files
*   **`README.md`**: Main project overview and entry point.
*   **`API_SPECIFICATION.md`**: Details the structure and functionality of the project's APIs.
*   **`DEPLOYMENT_ARCHITECTURE.md`**: Outlines the overall deployment strategy and infrastructure layout.
*   **`package.json` (root, `api/`, `dashboard/`, `wikijs-sync-agent/`):** Defines Node.js project metadata and dependencies for various components.
*   **`docker-compose.production.yml`**: Defines the services, networks, and volumes for the production deployment using Docker Compose.
*   **`STANDARD_MCP_CONFIG.json`**: Standard configuration template for Model Context Protocol integrations.
*   **`scripts/deploy.sh`**: A primary script for orchestrating deployments.
*   **`api/server.js`**: The main entry point for the core API server.
*   **`dashboard/index.html`**: The main entry file for the web-based dashboard.
*   **`wikijs-ai-agent/README.md`**: Documentation for the WikiJS AI Agent.
*   **`HOMEPAGE_INFISICAL_INTEGRATION_COMPLETE.md`**: Documents the completion of Infisical integration for the homepage.
*   **`PHASE3A-VISION.md`**: Outlines the vision for Phase 3A of the project.

## 4. Dependencies
The project relies on a mix of Node.js and Python ecosystems:

*   **Node.js/NPM:**
    *   **Core:** `express`, `axios`, `jest` (for testing), `winston` (logging), `cors`, `body-parser`.
    *   **Database:** `mongoose`, `mongodb`, `pg` (PostgreSQL client), `redis`.
    *   **Real-time:** `socket.io`.
    *   **Utilities:** `dotenv`, `node-cron`, `fs-extra`.
    *   **Frontend (Dashboard):** `react`, `vite`, `tailwindcss`.
*   **Python (via `venv/`):**
    *   `watchdog`: For monitoring file system events, likely used in directory polling or synchronization.
    *   `pkg_resources`: A utility for accessing package resources.
    *   Other potential Python dependencies for `mcp-enhanced-servers` and `wikijs-ai-agent` as indicated by `requirements.txt` within those directories.
*   **Docker/Docker Compose:** For container orchestration.
*   **Git:** For version control and GitOps workflows.
