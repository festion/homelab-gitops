# Project Index: homelab-gitops
## 1. Core Purpose
The `homelab-gitops` project serves as a comprehensive GitOps auditor and project template for homelab environments. Its primary functions include auditing Git repositories for uncommitted changes, stale tags, missing files, and sync drift, serving these audit results via an Express API. It also integrates with various Model Context Protocol (MCP) servers and facilitates automated documentation generation and GitHub project management, designed for self-hosted infrastructure and GitOps workflows.

## 2. Architecture
The project is structured around a Node.js/Express API (e.g., `api/server.js`, `api/server-v2.js`) that runs on port 3070. This API is responsible for orchestrating Git repository audits and exposing the results. Key architectural components include:
- **API Backend**: Built with Express.js, handling requests related to audit reports, MCP integrations, and other core functionalities. It includes middleware for authentication, authorization, and security, and interacts with various models for data persistence (e.g., compliance, metrics, users).
- **MCP Server Integration**: Utilizes over 10 pre-configured MCP servers for managing different aspects of the homelab, such as filesystem, network, GitHub, and Home Assistant. The `api/mcp-connector.js` facilitates this integration.
- **Automated Documentation**: Leverages template-driven generation for `CLAUDE.md` and `README.md`, ensuring up-to-date project documentation.
- **GitHub Integration**: Features workflows, issue templates, and project board management through dedicated scripts and API components (e.g., `api/github-mcp-manager.js`).
- **Configuration Management**: A `config` directory (e.g., `api/config-loader.js`, `config/deployment-config.json`) handles environment-specific settings, logging, and security configurations.
- **Scheduled Jobs**: Includes jobs for compliance checking and metrics collection (e.g., `api/jobs/complianceChecker.js`, `api/jobs/metricsCollector.js`).
- **Performance Testing**: A `perf` directory provides tools for benchmarking and performance analysis.

## 3. Key Files

### API Entry Points & Servers
- `api/server.js`: Main API server entry point.
- `api/server-mcp.js`: API server specifically for MCP integration.
- `api/server-v2.js`: A potential newer version or alternative API server.
- `api/createApp.js`: Centralized application creation logic.

### Authentication & Security
- `api/AUTHENTICATION.md`: Documentation on API authentication.
- `api/SECURITY_IMPLEMENTATION.md`: Documentation on security implementation.
- `api/config/security-config-example.json`: Example security configuration.
- `api/middleware/auth.js`: Authentication middleware.
- `api/middleware/authorization.js`: Authorization middleware.
- `api/middleware/security.js`: General security middleware.
- `api/middleware/enhanced-auth.js`, `api/middleware/enhanced-security.js`, `api/middleware/enhanced-security-headers.js`: Enhanced security middleware components.

### Configuration
- `api/config-loader.js`: Utility for loading configurations.
- `api/config/infisical-admin.js`, `api/config/infisical.js`: Infisical-related configurations.
- `api/config/logging.js`: Logging configuration.
- `api/config/orchestrationProfiles.js`: Orchestration profile configurations.

### MCP & Integration
- `api/mcp-connector.js`: Connects to MCP servers.
- `api/MCP_INTEGRATION.md`, `api/MCP_INTEGRATION_WIKI.md`: Documentation for MCP integration.
- `api/github-mcp-manager.js`: Manages GitHub MCP integration.
- `api/wiki-agent-manager.js`: Manages Wiki.js agent integration.
- `.mcp/README.md`: Readme for the MCP components.

### Utilities & Services
- `api/add-homepage-secrets.js`: Script to add homepage secrets.
- `api/csv-export.js`: CSV export functionality.
- `api/email-notifications.js`: Email notification service.
- `api/enhanced-discovery-manager.js`: Manages enhanced discovery processes.
- `api/serena-orchestrator.js`: Serena orchestrator integration.

### Data Models
- `api/models/compliance.js`: Database model for compliance.
- `api/models/database.js`: Core database connection and utility functions.
- `api/models/metrics.js`: Database model for metrics.
- `api/models/pipeline.js`: Database model for pipelines.
- `api/models/user.js`: Database model for users.

### Jobs & Performance
- `api/jobs/complianceChecker.js`: Scheduled job for compliance checks.
- `api/jobs/metricsCollector.js`: Scheduled job for metrics collection.
- `api/perf/README.md`: Performance testing documentation.
- `api/perf/baseline.json`: Performance baseline data.
- `api/perf/harness.js`: Performance testing harness.

### Testing
- `api/jest.config.js`, `api/jest.simple.config.js`: Jest testing configurations.
- `api/.github/workflows/test.yml`: GitHub Actions workflow for testing.
- `api/test/`: Directory for API tests.
- `api/test-infisical-admin.js`, `api/test-infisical.js`: Specific Infisical integration tests.

### Root Level
- `CLAUDE.md`: AI assistant instructions.
- `README.md`: Project overview and quick start guide.
- `API_SPECIFICATION.md`: API specification documentation.

## 4. Dependencies
The project primarily relies on Node.js and Express.js for its API backend. Key dependencies inferred from the presence of `api/package.json` and related files include:
- **Express.js**: For building the RESTful API.
- **Database drivers**: Likely for a relational or NoSQL database, given the `api/models` directory (e.g., PostgreSQL, MySQL, MongoDB).
- **Jest**: For unit and integration testing.
- **ESLint/Prettier**: For code quality and formatting.
- **Security-related libraries**: For authentication, authorization, and other security features (e.g., JWT, bcrypt, helmet).
- **Logging libraries**: For application logging (e.g., Winston, Morgan).
- **Configuration management libraries**: For handling environment variables and configuration files.
- **HTTP client libraries**: For making external API calls (e.g., to GitHub, Infisical).

## 5. Common Tasks
- **Develop/Modify API Endpoints**: Add new routes, update existing ones in `api/routes/`, and extend logic within `api/services/` and `api/models/`.
- **Configure MCP Integrations**: Adjust or add new MCP server connections and logic via `api/mcp-connector.js` and related configuration files.
- **Manage Security**: Update authentication and authorization middleware in `api/middleware/`, and modify security configurations in `api/config/`.
- **Implement Scheduled Jobs**: Create or modify background jobs for tasks like compliance checks (`api/jobs/complianceChecker.js`) or metrics collection (`api/jobs/metricsCollector.js`).
- **Update Documentation**: Generate or refine `CLAUDE.md`, `README.md`, or other markdown files within the `docs/` or `api/docs/` directories based on changes to the codebase or features.
- **Perform Testing**: Write and run unit/integration tests using Jest, located in `api/test/` and `api/tests/`.
- **Analyze Performance**: Utilize tools in `api/perf/` to benchmark API endpoints and identify performance bottlenecks.
- **Manage GitHub Workflows**: Modify CI/CD configurations and other automation scripts in `.github/workflows/`.
- **Add New Features**: Implement new functionalities, ensuring adherence to existing architectural patterns, and creating corresponding tests and documentation.
