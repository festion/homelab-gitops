# Project Index: homelab-gitops

## 1. Core Purpose

This project implements a comprehensive GitOps framework for managing a homelab environment. It automates deployment, configuration, and monitoring of various services through version-controlled infrastructure as code. The system integrates custom AI tooling (MCP, Claude, Serena) to manage and automate documentation workflows with WikiJS, and provides a central API and dashboard for orchestration and monitoring.

## 2. Architecture

The architecture is a multi-tiered system centered around GitOps principles:

-   **Core:** The root directory contains Docker Compose files (`docker-compose.production.yml`), configuration (`config/`), and automation scripts (`scripts/`) that define and manage the infrastructure.
-   **Backend:** A Node.js API (`api/`) acts as the central orchestrator, managing services, handling websocket communication, and integrating with other components like the MCP servers and secret management systems.
-   **Frontend:** A modern web application (`dashboard/`) built with Vite provides a user interface for monitoring, managing deployments, and interacting with the system.
-   **MCP Services:** A set of microservices (`mcp-servers/`, `mcp-enhanced-servers/`) that handle specialized tasks such as interfacing with Proxmox, TrueNAS, WikiJS, and performing code analysis.
-   **AI & Documentation:** An AI agent (`wikijs-ai-agent/`) is integrated with WikiJS to process and manage documentation automatically. A sophisticated prompting framework (`.prompts/`) guides the AI's behavior.
-   **Infrastructure & Monitoring:** The system uses Traefik for reverse proxying, and the TICK stack (Prometheus, Grafana, Loki) for comprehensive monitoring and log aggregation, defined in the `infrastructure/` and `monitoring/` directories.

## 3. Key Files

-   `README.md`: The main entry point for understanding the project's overview and setup.
-   `PROJECT_OVERVIEW.md`: A more detailed explanation of the project's goals and structure.
-   `docker-compose.production.yml`: Defines the core services and their configurations for the production environment.
-   `api/server.js`: The primary entry point for the backend Node.js application that orchestrates the entire system.
-   `dashboard/vite.config.ts`: The build and development configuration file for the frontend dashboard application.
-   `config/deployment-config.json`: Central configuration file that dictates deployment parameters across various services.
-   `scripts/deploy.sh`: Key deployment script used in the CI/CD pipeline to apply changes to the environment.
-   `mcp-servers/`: Directory containing the various microservices that provide specialized functionality for interacting with homelab systems.
-   `PHASE3A-VISION.md`: Outlines the strategic vision and future roadmap for the project.
-   `STANDARD_MCP_CONFIG.json`: Defines the standard configuration for the Model Context Protocol (MCP) used by custom agents.

## 4. Dependencies

-   **Core Technologies:** Docker, Node.js, Python, Bash.
-   **Key Services:**
    -   **Proxy:** Traefik
    -   **Monitoring:** Prometheus, Grafana, Loki
    -   **Documentation:** WikiJS
    -   **Secrets:** Infisical
-   **Primary Libraries:**
    -   **Backend:** Express.js, Socket.IO, Mongoose, Winston
    -   **Frontend:** Vite, TypeScript (likely with a framework like React or Vue)
    -   **Testing:** Jest
-   **Infrastructure Platforms:**
    -   Proxmox (Virtualization)
    -   TrueNAS (Storage)
    -   Cloudflare (Networking/DNS)
