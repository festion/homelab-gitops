# Project Index: homelab-gitops

## 1. Core Purpose

This repository contains the GitOps configuration and automation for a personal homelab. It manages the deployment, configuration, and lifecycle of various services through a combination of containerization, scripting, and CI/CD pipelines. The system includes a Node.js API backend, a frontend dashboard, and integrations with services like WikiJS, Infisical for secrets management, and monitoring tools. A significant component is the "Model Context Protocol" (MCP) for AI-driven automation and content processing, potentially involving the Claude AI.

## 2. Architecture

The project is structured as a monorepo with a multi-tiered architecture:

*   **Frontend:** A modern web dashboard located in the `dashboard/` directory, built with Vite and TypeScript, providing a user interface for managing and monitoring the homelab services.
*   **Backend API:** A Node.js application in the `api/` directory, built with Express.js. It handles business logic, data persistence (likely with MongoDB via Mongoose), and serves as the central hub for automation and integrations. It exposes RESTful endpoints and uses WebSockets for real-time communication.
*   **Infrastructure & Configuration:** The `infrastructure/` directory contains Infrastructure-as-Code (IaC) definitions for services like Traefik, Grafana, and Prometheus. Docker is used for containerization, with compositions defined in `docker-compose.production.yml`. Nginx is used for reverse proxying.
*   **Automation & Scripts:** A collection of shell and Python scripts in `scripts/` and `wrappers/` automate tasks such as deployment, backups, health checks, and system validation.
*   **MCP Servers:** Specialized Node.js and Python servers located in `mcp-servers/` and `mcp-enhanced-servers/` that implement the Model Context Protocol for advanced, AI-powered tasks.
*   **CI/CD:** Continuous integration and deployment are managed via GitHub Actions, configured in the `.github/workflows` directory.

## 3. Key Files

*   `api/server.js`: The main entry point for the backend Node.js application.
*   `dashboard/vite.config.ts`: The configuration file for the frontend Vite application.
*   `docker-compose.production.yml`: Defines the services, networks, and volumes for the production deployment using Docker.
*   `package.json`: Lists the project's root Node.js dependencies and defines key scripts for development, testing, and deployment.
*   `scripts/deploy.sh`: A primary script for orchestrating the deployment of services.
*   `infrastructure/`: Directory holding the configuration files for key infrastructure components like Traefik and monitoring tools.
*   `WIKIJS_AI_AGENT.md`: Core documentation detailing the WikiJS AI agent, a key feature of the ecosystem.

## 4. Dependencies

*   **Backend:** Node.js, Express.js, Mongoose, Socket.IO, Jest (for testing), Winston (for logging).
*   **Frontend:** Vite, TypeScript, React (inferred from `vite` and `tsconfig.json`).
*   **Databases:** MongoDB, Redis, PostgreSQL (inferred from `package.json` dependencies like `pg`, `redis`, `mongoose`).
*   **DevOps & Infrastructure:** Docker, Nginx, Traefik, Prometheus, Grafana, Loki.
*   **Languages:** JavaScript (Node.js), Python, Shell.
*   **AI:** Integrations with Anthropic's Claude AI models are present.
