# MCP Servers Collection

A comprehensive collection of Model Context Protocol (MCP) servers for homelab automation and management.

## Available MCP Servers

### Core Infrastructure
- **network-mcp-server/** - Network device and connectivity management
- **proxmox-mcp-server/** - Proxmox virtualization platform integration
- **truenas-mcp-server/** - TrueNAS storage system management

### Home Automation
- **home-assistant-mcp-server/** - Home Assistant integration and control

### Development & Documentation
- **github-mcp-server/** - GitHub repository and project management
- **code-linter-mcp-server/** - Code linting and quality analysis
- **wikijs-mcp-server/** - WikiJS documentation system integration
- **claude-auto-commit-mcp-server/** - Automated commit generation and review

### Utilities
- **directory-polling-server/** - File system monitoring and change detection

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure individual MCP servers:
   ```bash
   cd <server-directory>
   # Follow individual server setup instructions
   ```

3. Use wrapper scripts for easy management:
   ```bash
   ./setup-mcp-servers.sh
   ```

## Usage

Each MCP server can be configured in Claude Desktop by adding them to your MCP configuration file. See individual server documentation for specific setup instructions.

## Contributing

Please see individual server directories for their specific contribution guidelines and requirements.

## License

MIT License - see individual server directories for specific licensing information.