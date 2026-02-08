# Project Index: Homelab GitOps

This document provides a high-level overview of the `homelab-gitops` repository, outlining its purpose, architecture, key files, and dependencies.

## 1. Core Purpose

This project is a comprehensive GitOps framework for managing a personal homelab. It automates the deployment, configuration, and monitoring of various self-hosted services. The core functionality includes a central API, a web dashboard for management, AI-powered content processing for a Wiki.js instance, and a suite of microservices for various integrations and tasks.

## 2. Architecture

The system is designed with a multi-component, microservice-oriented architecture:

-   **Frontend**: A web dashboard located in the `dashboard/` directory, providing a user interface for monitoring and interacting with the system. It is built with a modern JavaScript framework (Vite/TypeScript).
-   **Backend API**: A central Node.js/Express application in `api/` that serves as the primary orchestrator, managing state, handling requests, and communicating with other services.
-   **AI Agent**: A Python-based service (`wikijs-ai-agent/`) that integrates with Wiki.js to provide AI-enhanced content processing, summarization, and management.
-   **MCP Services**: A collection of small, specialized services (`mcp-servers/`, `mcp-integrations/`) that handle specific tasks like directory polling, code linting, and system monitoring, communicating via a standardized "Model Context Protocol" (MCP).
-   **Infrastructure & Deployment**: The entire stack is containerized using Docker and managed via `docker-compose`. Traefik is used as a reverse proxy, and the `infrastructure/` directory contains configurations for monitoring tools like Prometheus and Grafana.

## 3. Key Files

-   `docker-compose.production.yml`: The main Docker Compose file that defines all production services, networks, and volumes.
-   `api/server.js`: The entry point for the core backend Node.js application.
-   `dashboard/vite.config.ts`: Configuration for the frontend dashboard application.
-   `wikijs-ai-agent/run_server.py`: The main script to start the Python-based AI agent for Wiki.js.
-   `scripts/`: A directory containing numerous automation scripts for deployment, backups, health checks, and system maintenance.
-   `infrastructure/`: Contains configuration files for Traefik, Prometheus, Grafana, and other core infrastructure components.
-   `STANDARD_MCP_CONFIG.json`: A file likely defining the standard configuration for the Model Context Protocol used by microservices.

## 4. Dependencies

-   **Backend**: Node.js, Express.js, Mongoose, Axios
-   **Frontend**: TypeScript, Vite, (likely React or Vue), Tailwind CSS
-   **AI / Python Services**: Python 3.11, Watchdog
-   **Infrastructure**: Docker, Docker Compose, Traefik, Nginx
-   **Monitoring**: Prometheus, Grafana, Loki
-   **Scripting**: Bash, Python