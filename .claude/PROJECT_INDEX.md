# Project Index: homelab-gitops

## 1. Core Purpose

This project provides a comprehensive GitOps framework for managing a personal homelab environment. It automates deployment, configuration, and monitoring of various services through a centralized, version-controlled system. The platform integrates AI capabilities (Anthropic Claude) for tasks like automated documentation and commit management, and uses WikiJS as its documentation hub.

## 2. Architecture

The system is built on a distributed, service-oriented architecture, managed via Docker Compose.

-   **Core API (`/api`)**: A Node.js/Express application that serves as the central orchestration point. It manages deployments, configurations, and communicates with various sub-modules.
-   **Frontend Dashboard (`/dashboard`)**: A web-based interface built with Vite, providing users with a control panel to monitor and interact with the homelab services.
-   **MCP Servers (`/mcp-servers`)**: A collection of specialized micro-servers (Model Context Protocol servers) that handle specific integrations, such as Proxmox, TrueNAS, WikiJS, and code analysis.
-   **Infrastructure (`/infrastructure`)**: Contains Infrastructure-as-Code (IaC) configurations for core services like Traefik (reverse proxy), Grafana (monitoring), and Cloudflare tunnels.
-   **Automation & Scripts (`/scripts`, `/wrappers`)**: A suite of Bash and Python scripts that drive the CI/CD pipeline, deployments, health checks, and other operational tasks.
-   **AI & Documentation**: Features a deep integration with WikiJS, managed by a dedicated AI agent (`/wikijs-ai-agent`) that processes and uploads documentation automatically.

## 3. Key Files

-   **`docker-compose.production.yml`**: Defines the services, networks, and volumes for the production deployment. The primary file for understanding the runtime environment.
-   **`api/server.js`**: The main entry point for the backend API, which orchestrates most of the system's logic.
-   **`dashboard/vite.config.ts`**: The build and development configuration file for the frontend dashboard application.
-   **`config/deployment-config.json`**: Central configuration file defining deployment parameters, service discovery sources, and environment settings.
-   **`scripts/deploy.sh`**: The main deployment script used to apply changes to the production environment.
-   **`wrappers/*.sh`**: A collection of wrapper scripts that abstract the functionality of the various MCP servers, making them easy to invoke from automation pipelines.
-   **`wikijs-ai-content-processor.js`**: A key component of the automated documentation system, responsible for processing content for WikiJS.

## 4. Dependencies

-   **Backend**: Node.js, Express.js, Mongoose, Axios
-   **Frontend**: Vite, TypeScript (UI framework not specified, likely React or Vue)
-   **Infrastructure**: Docker, Docker Compose, Traefik, Nginx, Prometheus, Grafana
-   **Scripting**: Python 3, Bash
-   **AI Services**: Anthropic Claude
-   **Data Storage**: A mix of file-based storage, a central database for the API (likely MongoDB or PostgreSQL), and a SQLite database for the Wiki Agent (`wiki-agent.db`).
