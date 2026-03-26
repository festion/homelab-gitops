# Project Index: homelab-gitops

## 1. Core Purpose

This repository implements a GitOps-based management system for a homelab environment. It automates the deployment, configuration, and monitoring of various services through a centralized API, a web dashboard, and a suite of specialized agents. The system is designed to be version-controlled, auditable, and easily extensible.

## 2. Architecture

The project follows a multi-tiered, microservice-oriented architecture:

-   **Frontend:** A web-based dashboard (`dashboard/`) built with a modern JavaScript framework (Vite-based) provides a user interface for monitoring and interacting with the system.
-   **Backend:** A core API (`api/`) built with Node.js and Express.js serves as the central orchestration layer. It manages application logic, data persistence, and communication between different components via REST and WebSocket endpoints.
-   **Services & Agents:**
    -   **MCP Servers (`mcp-servers/`):** A collection of specialized microservices (e.g., `wikijs-mcp-server`, `proxmox-mcp-server`) that implement a custom "Model Context Protocol" (MCP) to interface with various homelab services.
    -   **WikiJS Agents (`wikijs-ai-agent/`):** Dedicated agents for synchronizing and processing documentation with a Wiki.js instance.
-   **Infrastructure:** The entire system is designed to be deployed via Docker. `docker-compose.production.yml` defines the production environment, which includes services like Traefik for reverse proxying and a full monitoring stack (Prometheus, Grafana, Loki).
-   **Automation & CI/CD:** Automation is handled by a combination of Bash scripts (`scripts/`), Python scripts, and GitHub Actions (`.github/workflows`) for continuous integration and deployment, adhering to GitOps principles.

## 3. Key Files

-   `README.md`: Provides a high-level overview of the project, setup instructions, and goals.
-   `PROJECT_OVERVIEW.md`: Detailed documentation covering the project's vision, scope, and technical strategy.
-   `docker-compose.production.yml`: The main Docker Compose file defining the services, networks, and configurations for the production deployment.
-   `api/server.js`: The primary entry point for the backend Node.js application, which initializes the Express server and middleware.
-   `dashboard/vite.config.ts`: The build configuration file for the frontend dashboard application.
-   `config/deployment-config.json`: A central configuration file that defines deployment parameters, service endpoints, and environment settings.
-   `scripts/deploy.sh`: The main deployment script responsible for orchestrating the build and startup of the application stack.
-   `mcp-servers/README.md`: Documentation explaining the Model Context Protocol (MCP) and how the various MCP servers operate.
-   `WIKIJS-UPLOAD-SYSTEM-README.md`: Explains the architecture and functionality of the Wiki.js integration and content processing agents.

## 4. Dependencies

-   **Runtime:**
    -   **Docker & Docker Compose:** Containerization and orchestration of all services.
    -   **Node.js:** Backend API, scripts, and various agents.
    -   **Python:** Automation and utility scripts.
    -   **Bash:** Core deployment and automation scripts.
-   **Key Libraries & Frameworks:**
    -   **Express.js:** Backend API framework.
    -   **Socket.io:** Real-time communication via WebSockets.
    -   **Mongoose / pg:** Database interaction for MongoDB and PostgreSQL.
    -   **Vite:** Frontend build tooling.
-   **Infrastructure & Services:**
    -   **Traefik:** Reverse proxy and load balancer.
    -   **Prometheus, Grafana, Loki:** Monitoring, metrics, and logging stack.
    -   **Wiki.js:** External documentation platform, integrated via agents.
    -   **Infisical:** Secrets management.
