# Project Index: Homelab GitOps

## 1. Core Purpose

This repository contains the GitOps configuration and automation framework for a personal homelab. It manages the deployment, configuration, and operation of various services, with a strong focus on AI-powered automation, documentation synchronization with WikiJS, and system monitoring. A custom Model Context Protocol (MCP) is used for inter-service communication.

## 2. Architecture

The project follows a service-oriented architecture orchestrated via GitOps principles.

-   **Backend**: A central Node.js API (`api/`) built with Express.js, providing core logic, WebSocket communication, and endpoints for managing services.
-   **Frontend**: A web dashboard (`dashboard/`) for monitoring and interacting with the homelab environment.
-   **AI & Automation**: A suite of specialized agents and servers for various tasks, including:
    -   `wikijs-ai-agent`: An AI agent for processing and managing content within WikiJS.
    -   `mcp-servers`: A collection of servers implementing the Model Context Protocol (MCP) to integrate with services like Proxmox, TrueNAS, and WikiJS.
-   **Infrastructure**: Infrastructure-as-Code (IaC) configurations for services like Traefik, Grafana, and Cloudflare are managed in the `infrastructure/` directory.
-   **Deployment**: Services are containerized using Docker and managed via `docker-compose` files. A comprehensive set of `scripts/` automates deployment, testing, and maintenance tasks.

## 3. Key Files

-   **`docker-compose.production.yml`**: Defines the services and their configurations for the production environment.
-   **`package.json`**: Lists Node.js dependencies and defines project scripts.
-   **`api/server.js`**: The main entry point for the backend API server.
-   **`dashboard/`**: Contains the source code for the frontend web application.
-   **`wikijs-ai-agent/`**: Contains the primary Python-based AI agent for WikiJS integration.
-   **`mcp-servers/`**: Directory containing the various microservices that communicate over the MCP protocol.
-   **`infrastructure/`**: Contains configuration files for core infrastructure components.
-   **`scripts/`**: A collection of essential shell and Node.js scripts for automation, deployment, and maintenance.
-   **`docs/`**: Contains detailed project documentation, plans, and guides.

## 4. Dependencies

-   **Backend**: Node.js, Express.js, Socket.IO, Mongoose
-   **Frontend**: Vite, TypeScript, React (inferred from dashboard config)
-   **Python**: Used for AI agents (`wikijs-ai-agent`) and various scripts.
-   **Databases**: MongoDB (inferred), PostgreSQL, Redis
-   **DevOps & Infrastructure**: Docker, Nginx, Traefik, Prometheus, Grafana, Jest, ESLint
