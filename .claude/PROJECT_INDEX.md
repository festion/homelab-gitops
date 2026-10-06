# Project Index: homelab-gitops

## 1. Core Purpose

The `homelab-gitops` project serves as a GitOps Auditor for homelab environments. Its primary functions include auditing Git repositories for uncommitted changes, stale tags, missing files, and sync drift between local and GitHub repositories. It presents these audit results through a React dashboard backed by an Express API. Additionally, it provides a comprehensive project template with pre-configured MCP (Model Context Protocol) servers, automated documentation generation, and integrated GitHub project management features.

## 2. Architecture

The system is built as a React dashboard consuming an Express API.
- **API Service**: `gitops-audit-api` (systemd service) running on port `3070`.
- **Installation Root**: `/opt/gitops`.
- **Repository Scanning**: Scans repositories located in `/repos`.
- **Reporting**: Current audit reports are stored in `/output/GitRepoReport.json`, with historical snapshots in `/audit-history/`.
- **MCP Server Integration**: Includes over 10 integrated MCP servers for various functionalities (Filesystem, Network-FS, GitHub, Home Assistant, Proxmox, TrueNAS, WikiJS, Serena Enhanced, Code Linter, Directory Polling).
- **Project Structure**: Follows a template-driven structure, including `CLAUDE.md`, `README.md`, `docs/`, `.github/`, `scripts/`, and `template-config.json`.

## 3. Key Files

- `./api/add-homepage-secrets.js`: Script for adding homepage secrets.
- `./api/AUTHENTICATION.md`: Documentation for API authentication.
- `./api/config/infisical-admin.js`: Infisical admin configuration.
- `./api/config/infisical.js`: Infisical configuration.
- `./api/config-loader.js`: Utility for loading configurations.
- `./api/config/logging.js`: Logging configuration.
- `./api/config/orchestrationProfiles.js`: Orchestration profiles configuration.
- `./api/config/security-config-example.json`: Example security configuration.
- `./api/createApp.js`: Entry point for creating the Express application.
- `./api/csv-export.js`: Functionality for exporting data to CSV.
- `./api/docs/LOGGING.md`: Documentation for API logging.
- `./api/email-notifications.js`: Module for sending email notifications.
- `./api/enhanced-discovery-manager.js`: Manages enhanced discovery processes.
- `./api/github-mcp-manager.js`: Manages GitHub MCP integration.
- `./api/.github/workflows/test.yml`: GitHub Actions workflow for testing the API.
- `./api/jest.config.js`: Jest test runner configuration for the API.
- `./api/jest.simple.config.js`: Simplified Jest configuration.
- `./api/jobs/complianceChecker.js`: Background job for compliance checking.
- `./api/jobs/metricsCollector.js`: Background job for collecting metrics.
- `./api/lib/html-sanitize.js`: HTML sanitization utility.
- `./api/lib/regex-safe.js`: Utility for safe regular expression handling.
- `./api/lib/safe-exec.js`: Utility for safe command execution.
- `./api/lib/sql-identifiers.js`: Utility for SQL identifier handling.
- `./api/mcp-connector.js`: Connects to MCP servers.
- `./api/MCP_INTEGRATION.md`: Documentation for MCP integration.
- `./api/MCP_INTEGRATION_WIKI.md`: Wiki-specific documentation for MCP integration.
- `./api/middleware/auth.js`: Authentication middleware.
- `./api/middleware/authorization.js`: Authorization middleware.
- `./api/middleware/enhanced-auth.js`: Enhanced authentication middleware.
- `./api/middleware/enhanced-input-validation.js`: Enhanced input validation middleware.
- `./api/middleware/enhanced-security-headers.js`: Enhanced security headers middleware.
- `./api/middleware/enhanced-security.js`: Enhanced security middleware.
- `./api/middleware/enhanced-validation.js`: Enhanced validation middleware.
- `./api/middleware/rateLimit.js`: Rate limiting middleware.
- `./api/middleware/security-integration-example.js`: Example security integration middleware.
- `./api/middleware/security.js`: Security middleware.
- `./api/middleware/validation.js`: Validation middleware.
- `./api/middleware/webhook-middleware.js`: Webhook middleware.
- `./api/models/compliance.js`: Database model for compliance.
- `./api/models/database.js`: Database connection and utilities.
- `./api/models/metrics.js`: Database model for metrics.
- `./api/models/pipeline.js`: Database model for pipelines.
- `./api/models/user.js`: Database model for users.
- `./api/package.json`: Node.js project configuration and dependencies for the API.
- `./api/package-lock.json`: Node.js dependency lock file for the API.
- `./api/perf/baseline.json`: Performance baseline data.
- `./api/perf/bench-concurrent.js`: Concurrency benchmarking script.
- `./api/perf/bench-response-time.js`: Response time benchmarking script.
- `./api/perf/harness.js`: Performance testing harness.
- `./api/perf/README.md`: Performance testing documentation.
- `./api/phase2-endpoints.js`: Phase 2 API endpoints.
- `./api/routes`: Directory containing API route definitions.
- `./api/schemas`: Directory containing API data schemas.
- `./api/scripts`: Directory containing API utility scripts.
- `./api/SECURITY_IMPLEMENTATION.md`: Documentation for API security implementation.
- `./api/serena-orchestrator.js`: Serena orchestrator for advanced development tools.
- `./api/server.js`: Main API server entry point.
- `./api/server-mcp.js`: MCP-specific API server.
- `./api/server-v2.js`: Version 2 of the API server.
- `./api/services`: Directory containing API service logic.
- `./api/test`: Directory containing API tests.
- `./api/test-infisical-admin.js`: Tests for Infisical admin integration.
- `./api/test-infisical.js`: Tests for Infisical integration.
- `./api/tests`: Directory containing additional API tests.
- `./api/utils`: Directory containing API utility functions.
- `./api/wiki-agent-manager.js`: Manages the WikiJS agent.
- `CLAUDE.md`: AI assistant instructions.
- `README.md`: Project overview and quick start guide.
- `scripts/apply-template.sh`: Script for applying project template.
- `scripts/deploy.sh`: Deployment script for the API.
- `scripts/setup-mcp-config.sh`: Script to configure MCP servers.
- `scripts/sync_github_repos.sh`: Script for manual GitHub repository synchronization.

## 4. Dependencies

- **Related Projects**: This repository works alongside `operations` ([https://github.com/festion/operations](https://github.com/festion/operations)), which contains documentation, SOPs, runbooks, and procedures.
- **Node.js Modules**: Dependencies for the API are defined in `api/package.json` and locked in `api/package-lock.json`.

## 5. Common Tasks

- **Nightly Audit**: Scheduled for 03:00.
- **Manual Audit**: Execute `/opt/gitops/scripts/sync_github_repos.sh`.
- **Deploy API**: Run `scripts/deploy.sh`.
- **One-Line Project Creation**: `git clone https://github.com/festion/homelab-project-template.git my-new-project && cd my-new-project && ./scripts/apply-template.sh`.
- **Interactive Project Setup**: `./scripts/apply-template.sh --interactive`.
- **Configure MCP Servers**: `./scripts/setup-mcp-config.sh`.
- **Initialize GitHub Project (optional)**: `./scripts/apply-github-project-template.py`.
