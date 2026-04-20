# Project Index: homelab-gitops

## 1. Core Purpose

The `homelab-gitops` project is a comprehensive GitOps-driven system designed for automated management, monitoring, and intelligent documentation within a homelab environment. It integrates various services, including API backends, specialized Micro-Configuration Protocol (MCP) servers, a web-based dashboard, and AI-powered agents for streamlined operations and content generation.

## 2. Architecture

The project employs a multi-component architecture:

*   **API Layer (`api/`)**: A Node.js/Express backend providing core services, data management, third-party integrations (e.g., GitHub, MCP), and WebSocket communication. It includes authentication, routing, and business logic.
*   **Micro-Configuration Protocol (MCP) Servers (`mcp-servers/`, `mcp-enhanced-servers/`)**: A collection of specialized services (Node.js and Python-based) that handle specific automation and configuration tasks for different systems (e.g., WikiJS, directory polling, Proxmox, TrueNAS).
*   **Dashboard (`dashboard/`)**: A React.js frontend application (built with Vite) for visualizing system status, monitoring metrics, and providing a user interface for managing the homelab environment.
*   **Infrastructure as Code (`infrastructure/`)**: Configuration files for critical infrastructure components such as Traefik (reverse proxy), Grafana (monitoring), Homepage (dashboard), Cloudflare (security), and Proxmox (virtualization).
*   **Automation & Scripting (`scripts/`)**: A collection of Bash and Python scripts for deployment, system auditing, health checks, secret management (Infisical integration), and general system orchestration.
*   **AI Integration (`wikijs-ai-agent/`, `.claude/`, `.prompts/`)**: Components facilitating AI agent interaction for automated tasks, documentation generation (WikiJS), and prompt management, leveraging tools like Claude AI.
*   **GitOps Workflow**: The entire system configuration and deployment process is managed through Git, with CI/CD pipelines defining the automated delivery lifecycle.

## 3. Key Files

*   `./README.md`: Main project overview and introduction.
*   `./API_SPECIFICATION.md`: Detailed documentation of the project's API endpoints.
*   `./DEPLOYMENT_ARCHITECTURE.md`: High-level overview of the deployment strategy and infrastructure.
*   `./docker-compose.production.yml`: Docker Compose configuration for production deployments.
*   `./package.json`: Root project dependencies and scripts.
*   `./config/deployment-config.json`: Centralized deployment configuration settings.
*   `./scripts/deploy.sh`: Primary script for executing project deployments.
*   `./api/server.js`: Entry point for the main API server.
*   `./dashboard/src/main.ts`: Entry point for the frontend dashboard application.
*   `./wikijs-ai-content-processor.js`: JavaScript logic for processing content for WikiJS using AI.
*   `./.mcp.json`: Main configuration file for the Micro-Configuration Protocol.
*   `./.prompts/README.md`: Documentation for the AI prompts used within the project.
*   `./.claude/learnings.md`: Documentation of learnings and insights from Claude AI interactions.
*   `./mcp-servers/wikijs-mcp-server/package.json`: Dependencies for the WikiJS MCP server.
*   `./mcp-enhanced-servers/serena-documentation-tools.py`: Python script for enhanced documentation tasks.
*   `./infrastructure/traefik/`: Directory containing Traefik reverse proxy configurations.
*   `./monitoring/prometheus.yml`: Configuration file for Prometheus monitoring.
*   `./PHASE3A-VISION.md`: Document outlining the vision for Phase 3A of the project.
*   `./HOMEPAGE_INFISICAL_INTEGRATION_COMPLETE.md`: Documentation of the completed Infisical integration for Homepage secrets.
*   `./STANDARD_MCP_CONFIG.json`: A standard configuration template for MCP services.
*   `./RELATED_PROJECTS.md`: Information on projects related to `homelab-gitops`.

## 4. Dependencies

The project relies on a diverse set of technologies:

*   **Node.js Ecosystem**: Express.js, React, Vite, Jest (for testing), Mongoose (MongoDB ORM), `pg` (PostgreSQL client), Winston (logging), Nodemon, various npm utility libraries.
*   **Python Ecosystem**: Python 3.x, `watchdog` (for file system monitoring), and other scripting libraries utilized in `mcp-enhanced-servers` and `scripts/`.
*   **Containerization**: Docker and Docker Compose for application deployment and orchestration.
*   **Version Control**: Git for source code management and enabling GitOps workflows.
*   **Secret Management**: Infisical for securely managing application secrets.
*   **Documentation Platform**: WikiJS for centralized documentation and content management.
*   **AI Services**: Integration with AI models (e.g., Claude) for automation and content generation.
*   **Infrastructure Tools**: Traefik (reverse proxy), Grafana (observability), Prometheus (monitoring).
