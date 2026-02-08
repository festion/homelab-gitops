OK. I have created the `PROJECT_INDEX.md` file.
 `homelab-gitops`, is a comprehensive system for managing a personal homelab environment using GitOps principles. It automates the deployment, configuration, and management of various services, including a backend API, a content-aware Wiki (WikiJS), and integrated AI agents (Claude, Serena). The core goal is to provide a robust, version-controlled, and automated infrastructure foundation for personal projects and services.

## 2. Architecture

The system is composed of several key modules:

*   **API Server (`/api`):** A Node.js backend that serves as the central control plane. It manages system configurations, orchestrates AI agents, and exposes endpoints for interacting with various services.
*   **Master Control Program (`/.mcp`):** A Python-based automation engine responsible for template management, batch processing, and applying configurations across the infrastructure.
*   **AI Integration (`/wikijs-ai-agent`, `/.prompts`):** A suite of tools and agents that leverage AI models for content processing, documentation generation, and task automation, primarily integrated with the WikiJS platform.
*   **Deployment Engine:** Utilizes Docker Compose (`docker-compose.production.yml`) for container orchestration. A collection of shell scripts (`*.sh`) provides a CI/CD-like workflow for deploying and updating services.
*   **Frontend (`/frontend`):** A user interface (details inferred) for interacting with the backend API and managing the homelab services.

These components work together to maintain the state of the homelab as defined in this Git repository. Changes pushed to the repository trigger automated workflows that update the live environment.

## 3. Key Files

*   `docker-compose.production.yml`: Defines the core services, networking, and volumes for the production environment.
*   `api/server.js`: The main entry point for the Node.js backend API.
*   `package.json`: Lists the project's primary Node.js dependencies and defines common scripts.
*   `/.mcp/`: Contains the core Python scripts for the Master Control Program automation engine.
*   `update-production