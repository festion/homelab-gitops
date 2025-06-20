# Suggested Commands for Development (Updated)

## MCP Server Operations (Primary Workflow)
```bash
# Use Serena to orchestrate all MCP server operations
# Serena should marshall other MCP servers as needed

# Code validation (MANDATORY before commits)
# Use code-linter MCP server for all code validation
# Example: Validate JavaScript/TypeScript files
# Example: Validate Python scripts
# Example: Validate shell scripts

# Repository operations via GitHub MCP server
# Create issues for audit findings
# Create pull requests for fixes
# Manage branches through GitHub MCP
# Handle releases via GitHub MCP

# Let Serena coordinate multi-server workflows
# Combine code-linter + GitHub MCP operations
# Orchestrate complex automation tasks
```

## Development Environment
```bash
# Start full development environment (API + Dashboard)
./dev-run.sh

# Start API server manually (development mode)
cd /mnt/c/GIT/homelab-gitops-auditor
NODE_ENV=development node api/server.js

# Start dashboard development server
cd /mnt/c/GIT/homelab-gitops-auditor/dashboard
npm run dev

# Install dashboard dependencies
cd dashboard && npm install

# Install API dependencies
cd api && npm install express
```

## Git Actions Configuration
```bash
# Configure Git Actions workflows (should be done via GitHub MCP)
# .github/workflows/lint-and-test.yml
# .github/workflows/deploy.yml
# .github/workflows/security-scan.yml

# Test Git Actions locally (if needed)
# act -l  # List available actions
# act     # Run actions locally
```

## Code Quality Enforcement (Via MCP)
```bash
# MANDATORY: All code must pass code-linter MCP validation
# Use code-linter MCP server for:
# - JavaScript/TypeScript linting
# - Python code validation
# - Shell script linting
# - JSON/YAML validation

# Run ESLint for dashboard (prefer MCP when available)
cd dashboard && npm run lint

# Watch TailwindCSS compilation
cd dashboard && npm run tw:watch

# TypeScript compilation check
cd dashboard && tsc -b
```

## Building and Deployment
```bash
# Build dashboard for production
cd dashboard && npm run build

# Deploy to production (coordinate via Serena/GitHub MCP)
bash scripts/deploy.sh

# Manual deployment with specific options
bash manual-deploy.sh --port=8080 --no-nginx

# Install dashboard only
bash scripts/install-dashboard.sh
```

## Auditing and Testing
```bash
# Run manual GitHub sync audit
bash scripts/sync_github_repos.sh

# Run audit in development mode
bash scripts/sync_github_repos.sh --dev

# Test DNS sync (dry run)
bash scripts/gitops_dns_sync.sh

# Run individual DNS sync components
bash scripts/fetch_npm_config.sh
python3 scripts/generate_adguard_rewrites_from_sqlite.py
python3 scripts/generate_adguard_rewrites_from_sqlite.py --commit
```

## Repository Management (Via GitHub MCP)
```bash
# Prefer GitHub MCP server operations over direct git commands
# Use GitHub MCP for:
# - Creating issues from audit findings
# - Managing pull requests
# - Creating and managing branches
# - Handling repository lifecycle
# - Managing releases and tags

# Fallback git commands (when MCP not available)
git status
git add .
git commit -m "message"
git push
```

## System Commands (Linux/WSL)
```bash
# List files and directories
ls -la

# Search for files
find . -name "*.json" -type f

# Search in file contents
grep -r "pattern" --include="*.js" .

# Process management
ps aux | grep node
kill -9 <PID>

# File operations
mkdir -p directory/path
cp source destination
mv source destination
rm -rf directory

# Permissions
chmod +x script.sh
chown user:group file
```

## Service Management (Production)
```bash
# Check API service status
systemctl status gitops-audit-api

# Restart API service
systemctl restart gitops-audit-api

# Check logs
journalctl -u gitops-audit-api -f

# Check Nginx status
systemctl status nginx
```

## Debugging and Monitoring
```bash
# Check API endpoint
curl http://localhost:3070/audit

# Check dashboard serving
curl http://localhost:5173

# Monitor log files
tail -f /opt/gitops/logs/gitops_dns_sync.log

# Check port usage
netstat -tlnp | grep 3070

# Test cron environment
env -i bash -c '/opt/gitops/scripts/gitops_dns_sync.sh'
```

## MCP Server Integration Workflow
```bash
# 1. Planning (via Serena)
# Use Serena to coordinate planning across MCP servers

# 2. Code Development
# Write code following established conventions

# 3. Validation (MANDATORY)
# Use code-linter MCP server to validate ALL code

# 4. Repository Operations
# Use GitHub MCP server for all git operations

# 5. Automation
# Ensure Git Actions are configured and triggered

# 6. Coordination
# Let Serena orchestrate the entire workflow
```

## Required MCP Server Dependencies
- **Serena**: Primary orchestrator for all operations
- **GitHub MCP**: Repository operations, issues, PRs, releases  
- **Code-linter MCP**: Code quality validation (MANDATORY)
- **Additional MCP servers**: As needed and coordinated through Serena

## Critical Reminders
- **NEVER commit code without code-linter MCP validation**
- **Use Serena to marshall all MCP server operations**
- **Favor GitHub MCP over direct git commands**
- **Configure Git Actions for all critical workflows**
- **All repository operations should go through GitHub MCP when possible**