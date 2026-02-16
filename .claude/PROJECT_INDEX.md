# Project Index: Homelab GitOps

## 1. Core Purpose

This repository contains the source code and configuration for a comprehensive Homelab GitOps platform. It is designed to automate the deployment, management, and monitoring of various services within a homelab environment. The core functionalities include a centralized API, a content management and documentation system (WikiJS), integration with Claude AI for automation, and robust monitoring and logging. The system leverages Git as the single source of truth for declarative infrastructure and application configuration.

## 2. Architecture

The platform follows a multi-tier, service-oriented architecture, managed via GitOps principles and containerized using Docker.

*   **API Server (`api/`):** A Node.js/Express application that serves as the central orchestration point. It manages deployments, handles webhook integrations, and interacts with various backend services.
*   **WikiJS Integration (`wikijs-ai-agent/`, `wikijs-sync-agent/`):** A dedicated set of services to manage and synchronize documentation with a WikiJS instance. It includes an AI agent for content processing and automation.
*   **MCP (Model Context Protocol) Servers (`mcp-servers/`):** A collection of specialized microservices that provide context and control for various homelab systems (e.g., Proxmox, TrueNAS, networking).
*   **Dashboard (`dashboard/`):** A web-based user interface for monitoring and interacting with the GitOps platform.
*   **Infrastructure & Monitoring (`infrastructure/`, `monitoring/`):** Configuration files for infrastructure components like Traefik (reverse proxy), Grafana (dashboards), Prometheus (metrics), and Loki (logs).
*   **Automation & Scripts (`scripts/`, `wrappers/`):** A collection of shell scripts and wrappers for automating deployment, testing, backups, and other operational tasks.

## 3. Key Files

*   `docker-compose.production.yml`: Defines the production services, networks, and volumes for the entire stack.
*   `package.json`: Lists the core project dependencies and scripts for the root-level coordination.
*   `api/server.js`: The main entry point for the core backend API server.
*   `api/routes/`: Contains the API endpoint definitions and routing logic.
*   `wikijs-ai-agent/run_server.py`: The entry point for the Python-based WikiJS AI agent.
*   `mcp-servers/`: Directory containing the various Model Context Protocol servers that act as bridges to other services.
*   `scripts/deploy.sh`: A key script for orchestrating application deployments.
*   `infrastructure/`: Contains configuration for essential services like Traefik, Grafana, and Prometheus.
*   `PROJECT_OVERVIEW.md`, `ROADMAP-2025.md`: High-level documentation outlining the project's vision and goals.

## 4. Dependencies

*   **Backend:** Node.js, Express, Mongoose, Axios, Socket.IO, Winston (logging).
*   **AI & Python:** Python, various libraries for AI processing (details in `wikijs-ai-agent/requirements.txt`).
*   **Frontend (Dashboard):** Vite, TypeScript, React.
*   **Infrastructure:** Docker, Docker Compose, Nginx, Traefik.
*   **Databases/Storage:** MongoDB, Redis (implied by dependencies), PostgreSQL (for WikiJS).
*   **Development & Testing:** Jest, ESLint, Prettier, Nodemon.
