# MCP Server Integration Guidelines

## Serena as Primary Orchestrator
- **Serena should marshall all other MCP servers and tools** - Use Serena to coordinate between different MCP servers rather than calling them directly
- **Centralized tool management** - Let Serena handle the orchestration of various MCP servers for optimal workflow
- **Multi-server coordination** - Serena can leverage multiple MCP servers simultaneously for complex operations

## Repository Operations
- **Favor GitHub MCP server for all repository operations** - Use GitHub MCP server instead of direct git commands when possible
- **Repository management** - Create issues, pull requests, branches, and manage repository lifecycle through GitHub MCP
- **Code review workflows** - Leverage GitHub MCP for automated code review processes
- **Issue tracking** - Use GitHub MCP for issue creation and management related to audit findings

## Code Quality Enforcement
- **All code must be validated with code-linter MCP server** - No code should be committed without passing linting validation
- **Pre-commit validation** - Run code-linter MCP server checks before any code changes are finalized
- **Continuous quality** - Integrate linting checks into all development workflows
- **Multi-language support** - Use code-linter MCP for JavaScript, TypeScript, Python, and shell scripts

## Git Actions Configuration
- **Git Actions should be configured** - Set up automated workflows for CI/CD processes
- **Automated testing** - Configure Git Actions to run tests on pull requests
- **Deployment automation** - Use Git Actions for automated deployment to production environments
- **Quality gates** - Implement Git Actions workflows that enforce code quality standards

## MCP Server Priority Order
1. **Serena** - Primary orchestrator for all operations
2. **GitHub MCP** - Repository operations, issues, PRs, releases
3. **Code-linter MCP** - Code quality validation and enforcement
4. **Other MCP servers** - As coordinated through Serena

## Integration Workflow
1. **Planning** - Use Serena to coordinate planning across multiple MCP servers
2. **Implementation** - Leverage GitHub MCP for repository operations
3. **Validation** - Enforce code-linter MCP checks on all changes
4. **Deployment** - Coordinate Git Actions through GitHub MCP
5. **Monitoring** - Use Serena to orchestrate monitoring across tools

## Best Practices
- **Always use MCP servers through Serena** when available
- **Prefer MCP server operations over direct CLI commands**
- **Ensure code-linter validation before any commits**
- **Configure Git Actions for all critical workflows**
- **Document MCP server dependencies and requirements**