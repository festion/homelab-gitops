# Project Index

Generated: 2026-02-03

## Purpose
This project, `homelab-gitops`, provides a comprehensive framework for managing a homelab environment using GitOps principles. It serves as a template and an operational repository for infrastructure automation, featuring a custom "Model Context Protocol" (MCP) for integrating with various services like GitHub, Home Assistant, and Wiki.js. The system is containerized and includes a Node.js backend API, a frontend dashboard, extensive CI/CD pipelines, and a full monitoring stack.

## Directory Structure
```
/
├── api/                # Main backend API server (Node.js/Express)
├── dashboard/          # Frontend application code (React/Vite)
├── .mcp/               # Core logic and configuration for the Model Context Protocol (MCP) servers.
├── .github/workflows/  # CI/CD pipeline definitions using GitHub Actions
├── scripts/            # Utility, setup, and operational shell/node scripts
├── monitoring/         # Configuration files for Prometheus, Grafana, and Loki
├── nginx/              # Nginx configuration for the reverse proxy
└── docs/               # Detailed project documentation and guides
```

## Key Files
- `docker-compose.production.yml`: Defines the multi-container production environment, including the API, dashboard, database, and monitoring stack.
- `package.json`: Lists root-level Node.js dependencies and defines high-level scripts for development, testing, and building.
- `api/server.js`: The main entry point for the backend API server.
- `CI_CD_PIPELINE_IMPLEMENTATION.md`: Detailed documentation on the CI/CD architecture and workflows.
- `wikijs-ai-content-processor.js`: A key script for the automated documentation and Wiki.js integration features.
- `.pre-commit-config.yaml`: Defines pre-commit hooks used to maintain code quality and consistency.

## Architecture Patterns
- **GitOps:** The repository is the single source of truth. All changes to infrastructure and applications are managed through Git.
- **Microservices-oriented:** The application is broken down into multiple containerized services (API, dashboard, database, etc.) orchestrated by Docker Compose.
- **Model Context Protocol (MCP):** A custom, extensible architecture for integrating with external services and tools. It acts as a standardized wrapper or adapter layer.
- **CI/CD Automation:** Heavy reliance on GitHub Actions for automated testing, security scanning, and blue-green deployments to production.
- **Infrastructure as Code (IaC):** All service definitions, network configurations, and deployment logic are version-controlled within the repository.
- **Monitoring Stack:** A comprehensive observability stack using Prometheus for metrics, Grafana for visualization, and Loki/Promtail for log aggregation.

## Entry Points
- **Production Start:** `docker-compose -f docker-compose.production.yml up -d`
- **Development Start:** `npm run dev` (runs both API and dashboard with hot-reloading)
- **API Server Only:** `cd api && npm start`
- **Project Initialization:** `./scripts/apply-template.sh` (for using this repository as a template)

## Dependencies
- **Containerization:** Docker, Docker Compose
- **Backend:** Node.js, Express.js
- **Frontend:** React, Vite
- **Database:** PostgreSQL (primary), Redis (caching)
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus, Grafana, Loki
- **Integrations:** Wiki.js, Home Assistant, GitHub API

## Common Tasks
- **Install All Dependencies:** `npm run install:all`
- **Run All Tests:** `npm test`
- **Run Linting:** `npm run lint`
- **Build for Production:** `npm run build`
- **Deploy to Staging/Production:** Pushing to `develop` or `main` branches triggers the corresponding GitHub Actions deployment workflow. Manual dispatch is also available.
- **Run Wiki.js Processor:** `npm run wikijs-processor`
