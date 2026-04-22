# Project Index: homelab-gitops

## 1. Core Purpose

This repository implements a GitOps framework for managing a personal homelab environment. It automates the deployment, configuration, and monitoring of various services through a combination of a central API, specialized microservices (MCP Servers), and a unified dashboard. The system integrates AI capabilities via Claude for tasks like documentation and content processing, and uses Infisical for secrets management.

## 2. Architecture

The project follows a multi-tiered architecture:

*   **Frontend Dashboard**: A web-based interface located in the `/dashboard` directory, built with Vite, React, and TypeScript. It serves as the primary control panel for monitoring and interacting with the backend services.
*   **Backend API**: A core Node.js/Express application in the `/api` directory. It manages system logic, handles data persistence, and exposes RESTful endpoints and a WebSocket server for real-time communication.
*   **MCP (Model Context Protocol) Servers**: A set of specialized microservices found in `/mcp-servers` and `/mcp-enhanced-servers`. These servers handle discrete tasks such as interacting with Wiki.js, linting code, and monitoring network devices.
*   **Infrastructure & Configuration**: Managed via Docker (`docker-compose.production.yml`), Nginx (`/nginx`), and various configuration files in `/infrastructure` and `/monitoring` for services like Traefik, Prometheus, and Grafana.
*   **Automation & CI/CD**: A collection of shell and Python scripts in `/scripts` and `/wrappers` automates operational tasks. GitHub Actions (`.github/workflows`) are used for CI/CD pipelines.

## 3. Key Files

| File/Directory | Description |
| :--- | :--- |
| `docker-compose.production.yml` | Defines the core services, networking, and volumes for the production environment. |
| `api/server.js` | The main entry point for the backend Node.js API server. |
| `dashboard/vite.config.ts` | Build and development configuration for the frontend dashboard application. |
| `package.json` | (Root and sub-directories) Manages Node.js dependencies and defines run scripts. |
| `/scripts` | Contains essential automation scripts for deployment, backups, health checks, and maintenance. |
| `/wrappers` | Shell script wrappers that simplify interactions with external services like Proxmox, TrueNAS, and Claude. |
| `wikijs-ai-content-processor.js` | Core logic for the AI-powered agent that processes and uploads content to Wiki.js. |
| `STANDARD_MCP_CONFIG.json` | Central configuration file defining the behavior and communication for MCP servers. |
| `PHASE3A-VISION.md` | High-level document outlining the strategic goals and future direction of the project. |

## 4. Dependencies

| Category | Key Technologies |
| :--- | :--- |
| **Backend** | Node.js, Express.js, Mongoose, Socket.IO, Winston |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS |
| **Databases** | MongoDB, PostgreSQL, Redis, SQLite (for testing) |
| **Infrastructure** | Docker, Nginx, Traefik |
| **Monitoring** | Prometheus, Grafana, Loki, Promtail |
| **CI/CD** | GitHub Actions, Jest, ESLint |
| **Integrations**| Infisical (Secrets), Wiki.js (CMS), Claude (AI) |
