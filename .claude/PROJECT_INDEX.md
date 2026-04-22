# Project Index: homelab-gitops

## 1. Core Purpose
This project provides a comprehensive GitOps framework for managing a homelab environment. It automates deployment, configuration, and monitoring of various services through a centralized, version-controlled system. The platform integrates CI/CD pipelines, a backend API, a frontend dashboard, and multiple specialized servers for interacting with services like Proxmox, WikiJS, and Infisical for secrets management.

## 2. Architecture
The system is built on a multi-component architecture orchestrated via Docker.
- **Backend API (`/api`)**: A Node.js/Express application that serves as the central control plane. It manages application logic, websocket communication, and integration with other services.
- **Frontend Dashboard (`/dashboard`)**: A modern web interface built with Vite and a frontend framework (likely React/Vue/Svelte) for monitoring and interacting with the backend services.
- **MCP Servers (`/mcp-servers`)**: A collection of specialized microservices (Model Context Protocol servers) that act as bridges to various homelab services (e.g., Proxmox, TrueNAS, WikiJS).
- **Infrastructure (`/infrastructure`)**: Contains Infrastructure-as-Code (IaC) configurations for core services like Traefik (reverse proxy), Prometheus, and Grafana (monitoring).
- **Automation (`/scripts`)**: A suite of shell and Python scripts for handling deployment, backups, health checks, and CI/CD tasks.
- **Configuration (`/config`)**: Centralized configuration for applications, deployment environments, and discovery sources.

## 3. Key Files
- **`docker-compose.production.yml`**: Defines the services, networks, and volumes for the production deployment, acting as the primary orchestration file.
- **`api/server.js`**: The main entry point for the core backend API, setting up routes, middleware, and services.
- **`dashboard/vite.config.ts`**: The build and development configuration file for the frontend dashboard application.
- **`package.json`**: The root package file defining project-wide scripts and dependencies. The `api/package.json` and `dashboard/package.json` files manage dependencies for their respective scopes.
- **`/scripts/deploy.sh`**: A key script used in the deployment pipeline to apply configurations and restart services.
- **`STANDARD_MCP_CONFIG.json`**: A template or standard configuration file for the Model Context Protocol (MCP) servers, defining the baseline for integrations.
- **`PHASE3A-VISION.md`**: Outlines the strategic vision and long-term goals for the project's third phase.

## 4. Dependencies
- **Backend**: Node.js, Express.js, Mongoose (for MongoDB), Socket.IO, Jest
- **Frontend**: Vite, a modern JS framework (e.g., React, Vue), TailwindCSS
- **Infrastructure**: Docker, Docker Compose, Traefik, Nginx
- **Monitoring**: Prometheus, Grafana, Loki
- **Automation**: Python, Shell (Bash)
- **CI/CD**: Git, GitHub Actions, Pre-commit hooks
