# Project Index: homelab-gitops

## 1. Core Purpose

This project, "GitOps Auditor," audits Git repositories within a homelab environment. It checks for uncommitted changes, stale branches, and synchronization drift between local and remote repositories. It is built on a template designed for homelab infrastructure automation, utilizing a system of "Model Context Protocol" (MCP) servers for interacting with various services like GitHub.

## 2. Architecture

The core of the project is a Node.js Express API that performs the git audits and provides endpoints for the results. The frontend dashboard component has been retired. The application is designed to be run as a `systemd` service (`gitops-audit-api`) in production. It relies on a specific filesystem layout (`/opt/gitops`, `/repos`, `/output`) for its operation. The architecture is modular, using MCP connectors to interface with different systems (e.g., GitHub, filesystems).

## 3. Key Files

-   `CLAUDE.md`: **Authoritative Source.** Contains critical, non-obvious operational instructions, production paths, and troubleshooting guidance for an AI assistant. Should be consulted first.
-   `api/server.js`: The main entry point for the Express.js backend API.
-   `api/createApp.js`: Configures and initializes the Express application, including middleware and routes.
-   `api/mcp-connector.js`: Core module for connecting to and managing various MCP servers.
-   `api/github-mcp-manager.js`: Manages the specific integration with GitHub via the MCP framework.
-   `api/routes/`: This directory contains the API endpoint definitions.
-   `api/middleware/`: Contains Express middleware for handling security, authentication, and validation.
-   `scripts/sync_github_repos.sh`: The shell script used to manually trigger a full audit of the configured repositories.
-   `docker-compose.production.yml`: Defines the services and configuration for production deployment using Docker.

## 4. Dependencies

-   **Runtime**: Node.js, Express.js.
-   **System**: `git` is required for all core audit functionality. `systemd` is used for managing the production service.
-   **Infrastructure**: Docker and Docker Compose are used for deployment.
-   **Configuration**: The application expects a specific directory structure on the host system (e.g., `/opt/gitops`, `/repos`, `/output`).

## 5. Common Tasks

-   **Manually Trigger an Audit**: Execute the script `/opt/gitops/scripts/sync_github_repos.sh`.
-   **Deploy API Changes**: Run the `scripts/deploy.sh` script.
-   **Troubleshoot a Failed Audit**: Before debugging the scanner, check that the output file `/output/GitRepoReport.json` exists and contains valid JSON.
-   **Check API Status**: The API service runs on port `3070`. Use standard tools like `curl` or `netstat` to verify it's running.
-   **Recall Project Knowledge**: Use the `memory-search` command as directed in `CLAUDE.md` to query the project's learnings database before making changes.
