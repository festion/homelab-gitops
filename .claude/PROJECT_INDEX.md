# Project Index: homelab-gitops

## 1. Core Purpose

This repository, `homelab-gitops`, appears to be the central management system for a personal homelab environment. It uses GitOps principles to automate the deployment, configuration, and management of various services. The system includes a Node.js backend API, a web-based dashboard, and extensive scripting for automation. It also features a sophisticated integration with AI models (specifically "Claude") through a custom "Model Context Protocol" (MCP) for tasks like documentation, content processing, and system orchestration.

## 2. Architecture

The project is structured as a multi-component system:

-   **Backend API (`/api`)**: A Node.js application, likely using Express.js, that serves as the central control plane. It manages application logic, data persistence (via MongoDB/Mongoose), user authentication, and orchestration of AI agents.
-   **Frontend Dashboard (`/dashboard`)**: A modern web application built with a JavaScript framework (likely React or Vue, managed by Vite) and styled with Tailwind CSS. It provides a user interface for monitoring and interacting with the homelab services.
-   **Containerization (`docker-compose.*.yml`)**: Services are containerized using Docker and managed with Docker Compose for different environments (e.g., `production`, `green`).
-   **AI/MCP Framework (`/mcp-servers`, `/mcp-integrations`)**: A custom-built framework for running and integrating with AI agents. This includes dedicated servers for different tasks (e.g., `wikijs-mcp-server`, `code-linter-mcp-server`) and client libraries.
-   **Automation & Scripts (`/scripts`, `/*.sh`)**: A rich set of shell scripts for handling deployments, backups, health checks, configuration, and CI/CD pipeline tasks.
-   **Monitoring (`/monitoring`, `/infrastructure`)**: The system integrates with a monitoring stack including Prometheus for metrics, Loki for logging, and Grafana for visualization. It also manages infrastructure components like Traefik (reverse proxy) and Cloudflare.
-   **Documentation & Wiki Integration (`/docs`, `wikijs-*.js`)**: Strong emphasis on automated documentation, with numerous Markdown files and dedicated scripts to process content and upload it to a Wiki.js instance.

## 3. Key Files

-   `api/server.js`: The main entry point for the core backend API.
-   `docker-compose.production.yml`: Defines the services, networks, and volumes for the production deployment.
-   `dashboard/vite.config.ts`: The build and development configuration for the frontend dashboard application.
-   `package.json`: Defines top-level project scripts and dependencies.
-   `wikijs-ai-content-processor.js`: A key script that seems to handle the AI-powered processing of content for the Wiki.js integration.
-   `serena-orchestrator.js`: A component within the API that likely manages the workflow and tasks of the AI agents.
-   `scripts/deploy.sh`: A central script for orchestrating the deployment of services.
-   `STANDARD_MCP_CONFIG.json`: A configuration file that likely defines the standard setup for the Model Context Protocol.

## 4. Dependencies

-   **Backend**: Node.js, Express, Mongoose, Socket.io, Jest, Winston (for logging).
-   **Frontend**: Vite, Tailwind CSS, and a modern JS framework (e.g., React, Vue).
-   **Infrastructure**: Docker, Docker Compose, Nginx, Traefik, Prometheus, Loki, Grafana.
-   **Services**: Wiki.js, Infisical (for secret management).
-   **AI**: Python (`venv`), Anthropic Claude SDK (`@anthropic-ai` in `node_modules`).
-   **Databases**: MongoDB (inferred from Mongoose), likely SQLite for testing.
