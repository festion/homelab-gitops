# Code Style and Conventions (Updated)

## General Principles
- **Prefer fixing existing code over complete rewrites** - only use full rebuilds as a last resort
- **Use Serena to marshall all MCP servers and tools** - Serena should orchestrate all tool usage
- **Favor GitHub MCP server for repository operations** - Use GitHub MCP instead of direct git commands
- **All code must be validated with code-linter MCP server** - No code commits without linting validation
- **Configure Git Actions for automation** - Set up CI/CD workflows for quality and deployment
- **Focus on incremental improvements** - small, focused changes rather than large refactors

## MCP Server Usage Requirements
- **Serena orchestration**: Use Serena as the primary coordinator for all MCP server operations
- **GitHub MCP priority**: Repository operations should go through GitHub MCP server when possible
- **Code-linter enforcement**: Every code change must pass code-linter MCP server validation
- **Git Actions integration**: Configure automated workflows for testing, linting, and deployment

## JavaScript/TypeScript Style
- **Function naming**: camelCase for functions and variables
- **Constants**: UPPER_SNAKE_CASE for constants (e.g., `STATUS_COLORS`, `API_BASE_URL`)
- **File naming**: kebab-case for file names, PascalCase for React components
- **Error handling**: Use try-catch blocks and proper error responses
- **API responses**: Consistent JSON structure with status and error fields
- **Linting**: Must pass code-linter MCP server validation before commit

## React/Frontend Conventions
- **Component structure**: Functional components with hooks
- **Props typing**: Use TypeScript interfaces for component props
- **State management**: useState for local state, no complex state management library used
- **File organization**: Components in `/components/`, pages in `/pages/`
- **CSS classes**: TailwindCSS utility classes, avoid custom CSS where possible
- **Code quality**: All React code must pass code-linter MCP validation

## Backend/API Conventions
- **Route structure**: RESTful endpoints with clear HTTP verbs
- **Path handling**: Use `path.join()` for cross-platform compatibility
- **Environment detection**: `isDev` flag for development vs production behavior
- **CORS**: Enabled for development, disabled for production
- **Error responses**: Consistent structure with `{ error: "message" }` format
- **Validation**: All backend code must pass code-linter MCP server checks

## Shell Script Conventions
- **Shebang**: `#!/bin/bash` with `set -euo pipefail` for safety
- **Variables**: UPPER_CASE for configuration, lowercase for local variables
- **Comments**: Header comments with version, maintainer, license
- **Error handling**: Use `|| { echo "error"; exit 1; }` pattern
- **Output**: Emoji prefixes for user-friendly messages (📂, ✅, ❌, 🌐)
- **Dev mode**: Support `--dev` flag or `.dev_mode` file detection
- **Linting**: Shell scripts must be validated through code-linter MCP

## Repository Management
- **Use GitHub MCP**: Prefer GitHub MCP server for all repository operations
- **Issue creation**: Use GitHub MCP to create issues for audit findings
- **Pull requests**: Manage PRs through GitHub MCP server
- **Branch management**: Create and manage branches via GitHub MCP
- **Release management**: Handle releases through GitHub MCP server

## Quality Assurance Workflow
1. **Code development**: Write code following established conventions
2. **MCP validation**: Run code-linter MCP server validation
3. **Repository operations**: Use GitHub MCP for git operations
4. **Git Actions**: Trigger automated workflows for testing
5. **Serena coordination**: Let Serena orchestrate the entire workflow

## File Structure Conventions
- **Config files**: Top-level configuration files (package.json, vite.config.ts)
- **Documentation**: Markdown files in root and `/docs/` directory
- **Scripts**: Shell and Python scripts in `/scripts/` directory
- **API**: Backend code in `/api/` directory
- **Frontend**: React application in `/dashboard/` directory
- **Output**: Generated files in `/output/` and `/audit-history/`
- **Git Actions**: Workflow files in `.github/workflows/`

## Naming Patterns
- **API endpoints**: `/audit`, `/audit/history`, `/audit/clone`, etc.
- **Script files**: descriptive names with underscores (e.g., `sync_github_repos.sh`)
- **Component files**: PascalCase with `.tsx` extension (e.g., `SidebarLayout.tsx`)
- **Utility files**: lowercase with purpose (e.g., `statusMeta.ts`)
- **Git Actions**: descriptive names (e.g., `lint-and-test.yml`, `deploy.yml`)

## Documentation Standards
- **README files**: Comprehensive setup and usage instructions
- **Inline comments**: Explain complex logic and business rules
- **API documentation**: Clear parameter and response descriptions
- **Change tracking**: Use CHANGELOG.md for version history
- **MCP documentation**: Document MCP server dependencies and usage