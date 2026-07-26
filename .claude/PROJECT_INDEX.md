# Project Index: homelab-gitops

## 1. Core Purpose
The `homelab-gitops` project aims to establish a GitOps-managed homelab environment. It facilitates automated deployment, configuration management, and monitoring of various services, integrating a custom Multi-Cloud Platform (MCP) for service orchestration, secret management via Infisical, and documentation with Wiki.js.

## 2. Architecture
The architecture is modular and highly automated:
- **GitOps Workflow:** All configurations and deployments are managed through Git, enabling a declarative approach to infrastructure.
- **API Backend:** A Node.js-based API (`api/`) serves as the central control plane, managing various services, integrations, and data processing.
- **Frontend Dashboard:** A React/Vite-based dashboard (`dashboard/`) provides a user interface for monitoring and interaction.
- **Multi-Cloud Platform (MCP):** A core component (`.mcp/`, `mcp-servers/`, `mcp-enhanced-servers/`) that likely orchestrates and manages different services and integrations within the homelab.
- **CI/CD Pipeline:** Automated pipelines, possibly managed by GitHub Actions (`.github/workflows/`, `modules/pipeline-engine/`), handle continuous integration and deployment processes.
- **Containerization:** Services are containerized using Docker and managed with Docker Compose (`docker-compose.production.yml`).
- **Configuration Management:** Centralized configuration files (`config/`) and integration with Infisical for secure secret management.
- **Monitoring Stack:** Utilizes Prometheus for metrics, Loki for logs, and Grafana for visualization, with Promtail for log collection (`monitoring/`, `infrastructure/grafana`).
- **Web Server/Reverse Proxy:** Nginx is used for serving web content and potentially as a reverse proxy (`nginx/`).
- **Wiki.js Integration:** Automation for processing and uploading documentation to Wiki.js.

## 3. Key Files
- `./PHASE2-PRODUCTION-DEPLOYMENT.md`: Details for production deployment in Phase 2.
- `./dashboard/proxy-server.py`: Python script for proxying requests in the dashboard.
- `./dashboard/README.md`: Documentation for the dashboard.
- `./mcp-enhanced-servers/directory-polling-system.py`: Enhanced MCP server for directory polling.
- `./mcp-enhanced-servers/serena-documentation-tools.py`: Serena documentation tools for enhanced MCP.
- `./RELATED_PROJECTS.md`: Lists related projects.
- `./PHASE2_DEVELOPMENT_PLAN.md`: Development plan for Phase 2.
- `./content-processor-config.json`: Configuration for content processing.
- `./WIKIJS-UPLOAD-SYSTEM-README.md`: README for the Wiki.js upload system.
- `./SECURITY_CONSIDERATIONS.md`: Documents security considerations.
- `./HOMEPAGE_SECRETS_FIX_REQUIRED.md`: Notes on required fixes for homepage secrets.
- `./modules/pipeline-engine/README.md`: Documentation for the pipeline engine module.
- `./modules/pipeline-engine/execution/PipelineRunner.py`: Executes pipeline steps.
- `./modules/pipeline-engine/designer/PipelineBuilder.py`: Builds pipelines.
- `./modules/pipeline-engine/github/WorkflowManager.py`: Manages GitHub workflows.
- `./modules/GitHubActionsTools/README.md`: README for GitHub Actions tools.
- `./README.md`: Project overview and main documentation.
- `./config/deployment-config.json`: Main deployment configuration.
- `./config/discovery-sources.json`: Configuration for discovery sources.
- `./config/environments/production.json`: Production environment specific configuration.
- `./config/deployment-config.schema.json`: Schema for deployment configuration.
- `./config/discovery-cron.json`: Configuration for discovery cron jobs.
- `./.mcp.json`: Main MCP configuration file.
- `./INFISICAL_HOMELAB_ADMIN_PROJECT.md`: Documentation for Infisical homelab administration.
- `./HOMEPAGE_SECRETS_TO_ADD.md`: Lists secrets to be added to the homepage.

## 4. Dependencies
- **Node.js/npm:** Core for API and dashboard components.
- **Python:** Used for MCP components, scripting, and various utilities.
- **Docker/Docker Compose:** For containerization and orchestration of services.
- **Git:** Fundamental for the GitOps methodology.
- **Infisical:** External service for secret management.
- **Wiki.js:** External platform for documentation.
- **Prometheus, Grafana, Loki, Promtail:** For the monitoring stack.
- **Nginx:** Web server and reverse proxy.
- **Bash:** Extensive use of shell scripting for automation.
- **ESLint, Prettier:** For code quality and formatting.
- **Jest, Vitest:** For testing in Node.js and dashboard environments.
- **React, Vite, Tailwind CSS:** For the dashboard frontend development.
