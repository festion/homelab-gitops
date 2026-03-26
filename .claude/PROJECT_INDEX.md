# Project Index: homelab-gitops

## 1. Core Purpose

This repository implements a GitOps methodology for managing a comprehensive homelab environment. It automates the deployment, configuration, and monitoring of various services, including a backend API, a frontend dashboard, and integrations with third-party tools like WikiJS and Infisical. The system leverages AI capabilities (Claude) and a custom Model Context Protocol (MCP) for advanced automation and orchestration.

## 2. Architecture

The project is structured as a multi-component system managed via Infrastructure as Code (IaC) principles.

-   **Backend API (`/api`)**: A Node.js application serving as the central control plane, managing integrations, and exposing endpoints for the frontend.
-   **Frontend Dashboard (`/dashboard`)**: A Vite-based single-page application providing a user interface for monitoring and managing the homelab services.
-   **Infrastructure (`/infrastructure`, `/nginx`, `/monitoring`)**: Configuration files for Docker, Nginx, Traefik, Prometheus, and Grafana, defining the core service stack.
-   **Automation & Scripts (`/scripts`, `/wrappers`)**: A collection of shell and Python scripts that drive the CI/CD pipeline, perform automated tasks, health checks, and backups.
-   **MCP Services (`/mcp-servers`, `/mcp-integrations`)**: Specialized servers and clients that form a "Model Context Protocol" network, enabling AI-driven interactions with various homelab components (e.g., Proxmox, TrueNAS).
-   **Documentation (`/docs`, `*.md`)**: Extensive markdown documentation covering architecture, deployment plans, security, and development processes.

## 3. Key Files

-   `docker-compose.production.yml`: Defines the core services and their configuration for the production environment.
-   `api/server.js`: The main entry point for the backend API server.
-   `dashboard/vite.config.ts`: Build and development configuration for the frontend dashboard.
-   `package.json`: Lists project dependencies and defines key scripts for building, testing, and running the application.
-   `PHASE3A-VISION.md`: Outlines the strategic vision and long-term goals for the project.
-   `STANDARD_MCP_CONFIG.json`: Core configuration file for the Model Context Protocol services.
-   `scripts/deploy.sh`: Primary script for handling automated deployments.
-   `PROJECT_OVERVIEW.md`: Provides a high-level summary of the project's goals and structure.

## 4. Dependencies

-   **Runtime Environment**: Docker, Node.js, Python
-   **Backend Framework**: Express.js
-   **Database**: MongoDB (inferred from Mongoose), Redis, PostgreSQL
-   **Frontend Stack**: Vite, TypeScript, Tailwind CSS
-   **Infrastructure & Services**: Nginx, Traefik, Prometheus, Grafana, Loki, Infisical, WikiJS
-   **Testing**: Jest
-   **AI Integration**: Anthropic Claude API
