# Project Index: festion__homelab-gitops

## 1. Core Purpose

The `festion__homelab-gitops` project serves as a comprehensive template repository for homelab environments. Its primary function is to audit Git repositories within the homelab for uncommitted changes, stale tags, missing files, and synchronization drift between local and GitHub states. It presents these audit results via an Express API, historically backed by a React dashboard (now retired). Beyond auditing, it integrates with Model Context Protocol (MCP) servers, automates documentation generation, and facilitates GitHub project management, providing a robust GitOps framework for infrastructure automation.

## 2. Architecture

The codebase implements a multi-component architecture:

*   **API Service (`/api`):** An Express.js API (systemd service `gitops-audit-api` on port 3070) that handles core logic, integrates with MCP servers, manages data, and exposes endpoints. It includes modules for authentication, authorization, input validation, and security.
*   **MCP Server Integration (`/.mcp`, `/mcp-servers`, `/mcp-integrations`):** Integrates with over 10 pre-configured MCP servers (e.g., Filesystem, Network-FS, GitHub, Home Assistant, WikiJS, Serena Enhanced) for various homelab operations.
*   **Documentation Generation:** Features automated, template-driven `CLAUDE.md` and `README.md` generation.
*   **GitHub Integration:** Manages project boards, issue templates, and automated workflows via `.github/` configurations.
*   **Data Management:** Scans repositories located at `/repos`, stores the current audit report at `/output/GitRepoReport.json`, and maintains historical snapshots in `/audit-history/`.
*   **Scripts (`/scripts`):** Houses utility scripts for setup, deployment, and ongoing operations.

## 3. Key Files

*   **Core API:**
    *   `api/server.js`, `api/server-mcp.js`, `api/server-v2.js`: Main entry points for the API services.
    *   `api/routes/`: Defines API endpoints.
    *   `api/models/`: Database models for compliance, metrics, pipeline, and user data.
    *   `api/services/`: Contains business logic for various API functionalities.
    *   `api/middleware/`: Implements authentication, authorization, security, and validation logic.
*   **Configuration:**
    *   `api/config/`: API-specific configurations (e.g., `infisical.js`, `orchestrationProfiles.js`).
    *   `config/deployment-config.json`: Global deployment configurations.
    *   `config-loader.js`: Utility for loading configurations.
*   **Documentation:**
    *   `CLAUDE.md`: AI assistant instructions.
    *   `README.md`: Project overview and quick start guide.
    *   `API_SPECIFICATION.md`, `AUTHENTICATION.md`, `SECURITY_CONSIDERATIONS.md`: API and security documentation.
*   **Scripts & Tools:**
    *   `install.sh`, `setup-claude.sh`, `update-production.sh`: Project setup and update scripts.
    *   `create-consolidated-config.py`: Python script for configuration management.
    *   `cleanup-mcp-structure.sh`: Script for MCP structure cleanup.
*   **Testing:**
    *   `api/jest.config.js`, `api/jest.simple.config.js`: Jest configurations for API tests.
    *   `api/test/`, `api/tests/`: API test files.
    *   `api/.github/workflows/test.yml`: GitHub Actions workflow for testing.

## 4. Dependencies

*   **Programming Languages:** Node.js (for the Express API), Python (for various scripts), Bash (for shell scripts).
*   **Frameworks/Libraries:** Express.js for the API, Jest for testing.
*   **External Systems/Protocols:**
    *   **Git:** Core for auditing repositories.
    *   **GitHub:** For repository management, project boards, and CI/CD workflows.
    *   **Model Context Protocol (MCP):** Integrates with various MCP servers for extended functionality (e.g., Filesystem, Network-FS, Home Assistant, Proxmox, WikiJS, Serena Enhanced).
    *   **Infisical:** For secret management (implied by `infisical-admin.js`, `infisical.js` in `api/config`).
*   **Operating System:** Designed for homelab environments, likely Linux-based given the shell scripts and systemd reference.

## 5. Common Tasks

*   **Project Setup:**
    *   Clone the repository and run `./scripts/apply-template.sh` for one-line setup.
    *   Execute `./scripts/apply-template.sh --interactive`, `./scripts/setup-mcp-config.sh`, and `./scripts/apply-github-project-template.py` for interactive setup and configuration.
*   **Auditing:**
    *   Perform a manual audit by running `/opt/gitops/scripts/sync_github_repos.sh`.
    *   Understand that nightly audits are scheduled for 03:00.
*   **Deployment:**
    *   Deploy the API using `scripts/deploy.sh`.
*   **API Development/Maintenance:**
    *   Start the API server (e.g., `node api/server.js`).
    *   Implement new API routes in `api/routes/`.
    *   Develop or modify business logic in `api/services/`.
    *   Manage database models in `api/models/`.
*   **Testing:**
    *   Run API tests using `jest` (e.g., `npm test` in the `api/` directory).
*   **Configuration:**
    *   Adjust API configurations in `api/config/` and global configurations in `config/`.
*   **Documentation:**
    *   Refer to `CLAUDE.md` and `README.md` for project instructions and overview.
    *   Consult other `.md` files in `docs/` and `api/docs/` for specific details.
