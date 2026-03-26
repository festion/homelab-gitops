# Project Index: homelab-gitops

## 1. Core Purpose

This repository implements a GitOps framework for managing a personal homelab environment. It automates the deployment, configuration, and monitoring of various services through a centralized, version-controlled system. The project integrates AI agents (Claude), documentation platforms (WikiJS), and secret management (Infisical) to create a highly automated and maintainable infrastructure-as-code setup.

## 2. Architecture

The project follows a multi-component, service-oriented architecture:

*   **API Server (`api/`)**: A Node.js/Express backend that serves as the central control plane. It manages deployments, handles webhook integrations, and communicates with other services.
*   **Frontend Dashboard (`dashboard/`)**: A web-based user interface (built with Vite) for monitoring, managing, and interacting with the homelab services and the GitOps pipeline.
*   **Infrastructure (`infrastructure/`)**: Infrastructure-as-Code (IaC) configurations for core services like Traefik (reverse proxy), Grafana/Prometheus (monitoring), and Cloudflare (networking).
*   **MCP Services (`mcp-servers/`, `mcp-integrations/`)**: A set of modular, specialized microservices (Model Context Protocol servers) that manage specific hardware or software integrations, such as TrueNAS, Proxmox, and WikiJS.
*   **Automation Scripts (`scripts/`)**: A collection of shell, Python, and JavaScript scripts that automate deployment, backups, health checks, and other operational tasks.
*   **AI & Documentation Agents (`wikijs-ai-agent/`)**: Specialized agents that automate content processing, synchronization, and documentation management with the WikiJS platform.

Deployments are managed via Docker Compose and orchestrated through a combination of Git webhooks and cron jobs, adhering to GitOps principles where the `main` branch represents the desired state of the infrastructure.

## 3. Key Files

*   **`docker-compose.production.yml`**: Defines the core services, networking, and volumes for the production environment. It is the primary file used for service orchestration.
*   **`api/server.js`**: The main entry point for the backend API, responsible for initializing routes, middleware, and websocket connections.
*   **`package.json`**: (Root and `api/`) Lists Node.js dependencies and defines key scripts for development, testing, and running the application.
*   **`dashboard/vite.config.ts`**: The build configuration file for the frontend dashboard application.
*   **`scripts/deploy.sh`**: A primary deployment script used to apply changes and restart services according to the GitOps workflow.
*   **`PROJECT_OVERVIEW.md` / `README.md`**: Provide a high-level overview of the project's goals, structure, and status.
*   **`PHASE*.md` (e.g., `PHASE3A-VISION.md`)**: A series of documents outlining the strategic vision, roadmap, and implementation details for different project phases.

## 4. Dependencies

*   **Languages**: JavaScript (Node.js), Python, Shell (Bash)
*   **Backend**: Express.js, Socket.IO, Mongoose, Winston (logging)
*   **Frontend**: Vite, React/Vue (inferred from `vite.config.ts` and typical dashboard stacks)
*   **Orchestration**: Docker, Docker Compose
*   **Infrastructure & Services**: Nginx, Traefik, Prometheus, Grafana, Loki, Infisical, WikiJS
*   **Databases**: MongoDB/PostgreSQL (inferred from dependencies), Redis
*   **CI/CD & Version Control**: Git, GitHub Actions, Pre-commit hooks
