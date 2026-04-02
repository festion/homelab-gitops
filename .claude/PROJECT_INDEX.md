# Project Index: homelab-gitops

## 1. Core Purpose
The `homelab-gitops` project serves as a comprehensive GitOps-driven framework for managing a homelab environment. Its primary purpose is to automate the deployment, configuration, monitoring, and integration of various services and applications within a homelab setup. This includes a robust API backend for service orchestration, a dashboard for monitoring and control, and specialized agents for integration with systems like Wiki.js, Infisical, and custom Model Context Protocol (MCP) servers. The project emphasizes automated documentation, continuous deployment, and security best practices.

## 2. Architecture
The architecture follows a modular and distributed approach:

*   **API Layer (`api/`)**: A Node.js-based API gateway handling various functionalities, including authentication, configuration loading, email notifications, enhanced discovery, GitHub MCP management, and WebSocket communication. It interacts with different services and databases.
*   **Dashboard (`dashboard/`)**: A React-based frontend application providing a user interface for monitoring, managing deployments, and visualizing system health.
*   **Configuration Management (`config/`, `.mcp/`, `mcp-servers/`)**: Utilizes a Model Context Protocol (MCP) system for managing configurations, templates, and dependencies across services. Dedicated MCP servers (e.g., `wikijs-mcp-server`, `network-mcp-server`) handle specific integrations.
*   **Infrastructure (`infrastructure/`)**: Contains configurations and scripts related to infrastructure components like Cloudflare, Grafana, Homepage, KEA, Node-RED, Promtail, Proxmox, and Traefik.
*   **Scripts and Automation (`scripts/`, `cron/`, `wrappers/`)**: A collection of Bash and Python scripts for deployment, auditing, health checks, backups, GitHub synchronization, and various automation tasks. Cron jobs orchestrate scheduled operations.
*   **Documentation (`docs/`, `*.md` files)**: Extensive Markdown documentation covering deployment plans, architecture, security, API specifications, and operational guides.
*   **Agents and Integrations (`wikijs-ai-agent/`, `wikijs-sync-agent/`, `claude-resources/`, `mcp-integrations/`)**: Specialized agents for integrating with third-party services like Wiki.js for AI content processing and synchronization, Claude for AI-driven tasks, and various MCP clients for specific integrations (e.g., code linting).

## 3. Key Files

*   `./PHASE3A-VISION.md`: High-level vision and goals for Phase 3A of the project.
*   `./HOMEPAGE_INFISICAL_INTEGRATION_COMPLETE.md`: Documentation detailing the successful integration of Infisical secrets management with the homelab homepage.
*   `./STANDARD_MCP_CONFIG.json`: Standard configuration file for the Model Context Protocol (MCP) system.
*   `./RELATED_PROJECTS.md`: Lists and describes related projects or components within the homelab ecosystem.
*   `./venv/lib/python3.11/site-packages/watchdog/events.py`: Part of the `watchdog` library, defining event objects for file system monitoring.
*   `./venv/lib/python3.11/site-packages/watchdog/observers/api.py`: Defines the API for file system event observers in the `watchdog` library.
*   `./venv/lib/python3.11/site-packages/watchdog/observers/inotify_buffer.py`: Component for buffering `inotify` events in the `watchdog` library.
*   `./venv/lib/python3.11/site-packages/watchdog/observers/fsevents2.py`: FSEvents (macOS) observer implementation for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/observers/inotify.py`: `inotify` (Linux) observer implementation for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/observers/read_directory_changes.py`: Windows-specific observer for `watchdog` using `ReadDirectoryChangesW`.
*   `./venv/lib/python3.11/site-packages/watchdog/observers/kqueue.py`: `kqueue` (BSD/macOS) observer implementation for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/observers/fsevents.py`: Older FSEvents (macOS) observer for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/observers/polling.py`: Polling observer implementation for `watchdog`, used as a fallback.
*   `./venv/lib/python3.11/site-packages/watchdog/observers/inotify_c.py`: C-extension based `inotify` observer for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/observers/__init__.py`: Initialization file for `watchdog` observers package.
*   `./venv/lib/python3.11/site-packages/watchdog/observers/winapi.py`: Windows API utilities for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/tricks/__init__.py`: Initialization file for `watchdog` tricks package.
*   `./venv/lib/python3.11/site-packages/watchdog/version.py`: Version information for the `watchdog` library.
*   `./venv/lib/python3.11/site-packages/watchdog/watchmedo.py`: Command-line utility for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/utils/dirsnapshot.py`: Directory snapshot utility for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/utils/bricks.py`: Utility functions for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/utils/process_watcher.py`: Process watcher utility for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/utils/patterns.py`: Pattern matching utilities for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/utils/echo.py`: Echo utility for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/utils/__init__.py`: Initialization file for `watchdog` utilities package.
*   `./venv/lib/python3.11/site-packages/watchdog/utils/platform.py`: Platform-specific utilities for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/utils/delayed_queue.py`: Delayed queue implementation for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/utils/event_debouncer.py`: Event debouncer for `watchdog`.
*   `./venv/lib/python3.11/site-packages/watchdog/__init__.py`: Initialization file for the `watchdog` library.
*   `./venv/lib/python3.11/site-packages/pkg_resources/extern/__init__.py`: Part of `pkg_resources`, for external dependencies.
*   `./venv/lib/python3.11/site-packages/pkg_resources/__init__.py`: Initialization file for the `pkg_resources` library (setuptools).
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/platformdirs/android.py`: Android platform directory definitions.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/platformdirs/api.py`: API for platform directories.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/platformdirs/version.py`: Version information for platform directories.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/platformdirs/unix.py`: Unix platform directory definitions.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/platformdirs/windows.py`: Windows platform directory definitions.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/platformdirs/__main__.py`: Main entry point for platform directories module.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/platformdirs/__init__.py`: Initialization file for platform directories package.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/platformdirs/macos.py`: macOS platform directory definitions.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/packaging/_structures.py`: Internal structures for the `packaging` library.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/packaging/version.py`: Version parsing and comparison for `packaging`.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/packaging/tags.py`: Tag support for `packaging`.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/packaging/__about__.py`: About information for the `packaging` library.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/packaging/requirements.py`: Requirement parsing for `packaging`.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/packaging/__init__.py`: Initialization file for the `packaging` library.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/packaging/specifiers.py`: Specifier parsing for `packaging`.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/packaging/markers.py`: Marker parsing for `packaging`.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/packaging/_manylinux.py`: `manylinux` support for `packaging`.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/packaging/_musllinux.py`: `musllinux` support for `packaging`.
*   `./venv/lib/python3.11/site-packages/pkg_resources/_vendor/packaging/utils.py`: Utility functions for the `packaging` library.
*   `./@dashboard/src/components/WikiAgent/analytics/types/metricsTypes.js`: Defines data models, KPIs, alert thresholds, and utility functions for analytics related to the WikiJS Agent.

## 4. Dependencies
The project leverages a mix of JavaScript/Node.js and Python dependencies:

**JavaScript/Node.js:**
*   **Express.js**: For building the API server (`api/server.js`).
*   **React**: For the frontend dashboard (`dashboard/`).
*   **Jest**: For testing (evident from `jest.config.js`, `jest.simple.config.js`, and the extensive `node_modules` directory with Jest-related packages).
*   **Axios**: For HTTP requests.
*   **Socket.IO**: For WebSocket communication.
*   **Mongoose / PostgreSQL**: Database ORM/drivers (implied by file names in `api/models`, `api/config/database.js`, and `node_modules/pg`).
*   **Winston**: For logging.
*   **Nodemon**: For development server auto-restarts.
*   **`fs-extra`**: For extended file system operations.
*   Many other utilities and libraries as indicated by the vast `node_modules` directory, including those for security (`jose`, `pkce-challenge`), configuration (`dotenv`), and various web-related functionalities (`cors`, `body-parser`, `express-rate-limit`).

**Python:**
*   **`watchdog`**: For file system monitoring (evident from `venv/lib/python3.11/site-packages/watchdog/`).
*   **`pkg_resources` / `packaging`**: For package resource management and version handling (evident from `venv/lib/python3.11/site-packages/pkg_resources/`).
*   Other standard Python libraries and potentially project-specific dependencies managed within the `venv/` directory.

The project uses `npm` for JavaScript dependency management (`package.json`, `package-lock.json`) and likely `pip` for Python dependencies (indicated by the `venv` directory).
