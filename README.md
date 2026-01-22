# 🚀 Homelab Project Template

[![Latest Release](https://img.shields.io/github/v/release/festion/homelab-gitops-auditor?style=for-the-badge&logo=github&color=blue)](https://github.com/festion/homelab-gitops-auditor/releases/latest)
[![License](https://img.shields.io/github/license/festion/homelab-gitops-auditor?style=for-the-badge&color=green)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/festion/homelab-gitops-auditor?style=for-the-badge&logo=github&color=yellow)](https://github.com/festion/homelab-gitops-auditor/stargazers)

A comprehensive project template repository designed for homelab environments with integrated MCP (Model Context Protocol) servers, automated documentation generation, and GitHub project management.

## ✨ Key Features

- **🔧 Pre-configured MCP Servers** - 10+ integrated servers for filesystem, network, GitHub, Home Assistant, and more
- **📝 Smart Documentation** - Template-driven CLAUDE.md generation with placeholders
- **🤖 GitHub Integration** - Project boards, issue templates, and automated workflows
- **⚡ One-Command Setup** - Automated project initialization and configuration
- **🏠 Homelab Optimized** - Built for self-hosted infrastructure and GitOps workflows
- **🔄 Template System** - Reusable configurations for consistent project structure

## 🚀 Quick Start

### One-Line Project Creation

```bash
# Clone and setup new project
git clone https://github.com/festion/homelab-project-template.git my-new-project
cd my-new-project
./scripts/apply-template.sh
```

### Interactive Setup

```bash
# Interactive template configuration
./scripts/apply-template.sh --interactive

# Configure MCP servers
./scripts/setup-mcp-config.sh

# Initialize GitHub project (optional)
./scripts/apply-github-project-template.py
```

## 📦 What's Included

### MCP Server Integration
- **Filesystem** - Local file operations and management
- **Network-FS** - Network file system access and operations
- **GitHub** - Repository management, issues, and project boards
- **Home Assistant** - Smart home automation and device control
- **Proxmox** - Virtual machine and container management
- **TrueNAS** - Network storage and backup management
- **WikiJS** - Documentation and knowledge management
- **Serena Enhanced** - Advanced development tools and workflows
- **Code Linter** - Automated code quality and style checking
- **Directory Polling** - File system monitoring and change detection

### Project Structure
```
your-project/
├── CLAUDE.md              # AI assistant instructions (generated)
├── README.md               # Project documentation (generated)
├── docs/                   # Detailed documentation
│   ├── SETUP.md           # Setup and installation guide
│   ├── MCP_CONFIGURATION.md # MCP server configuration
│   ├── CUSTOMIZATION.md   # Template customization guide
│   └── TROUBLESHOOTING.md # Common issues and solutions
├── .github/               # GitHub templates and workflows
│   ├── ISSUE_TEMPLATE/    # Issue templates
│   └── workflows/         # GitHub Actions
├── scripts/               # Utility and setup scripts
└── template-config.json   # Template configuration
```

### GitHub Project Management
- **Issue Templates** - Bug reports, feature requests, and documentation
- **Project Boards** - Automated kanban boards with smart automation
- **Labels & Milestones** - Organized project tracking and releases
- **Workflows** - CI/CD integration and automated processes

## Related Projects

This repository works alongside [operations](https://github.com/festion/operations):

| Repository | Purpose | Content |
|------------|---------|---------|
| **homelab-gitops** (this repo) | Infrastructure automation | Code, configs, MCP servers, dashboard |
| **operations** | Documentation & SOPs | Markdown docs, runbooks, procedures |

See [RELATED_PROJECTS.md](RELATED_PROJECTS.md) for details on how these repositories complement each other.

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[MCP Configuration](docs/MCP_CONFIGURATION.md)** - Complete MCP server documentation
- **[Customization Guide](docs/CUSTOMIZATION.md)** - Template customization and advanced usage
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[GitHub Project Template](docs/GITHUB_PROJECT_TEMPLATE.md)** - Project management guide

## 🔧 Quick Configuration

### Basic Setup
```bash
# Set project details
export PROJECT_NAME="My Awesome Project"
export PROJECT_DESCRIPTION="A brief description of what this project does"
export PROJECT_TYPE="Dashboard"

# Apply template
./scripts/apply-template.sh
```

### MCP Server Configuration
```bash
# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Test MCP connections
./scripts/test-mcp-integration.sh
```

## 🎯 Use Cases

### GitOps Environments
- **Infrastructure as Code** projects with automated documentation
- **Container orchestration** with integrated monitoring and management
- **CI/CD pipelines** with GitHub Actions and automated testing

### Homelab Projects
- **Smart home automation** with Home Assistant integration
- **Network monitoring** and infrastructure management
- **Self-hosted services** with integrated documentation and monitoring

### Development Workflows
- **API development** with automated testing and documentation
- **Dashboard applications** with React/TypeScript templates
- **CLI tools** with comprehensive help and configuration systems

## 🛠 Advanced Features

### Template Placeholders
The template system supports dynamic content replacement:
- `{{PROJECT_NAME}}` - Project name and titles
- `{{PROJECT_DESCRIPTION}}` - Project description and purpose
- `{{KEY_COMPONENTS}}` - Major project components
- `{{SETUP_INSTRUCTIONS}}` - Installation and setup steps
- See [template-config.json](template-config.json) for full list

### Custom MCP Servers
Add your own MCP servers by:
1. Creating wrapper scripts in `wrappers/`
2. Adding configuration to `STANDARD_MCP_CONFIG.json`
3. Testing with `./scripts/test-mcp-integration.sh`

### GitHub Project Automation
- **Smart Labels** - Automatically categorize issues and PRs
- **Project Boards** - Kanban-style project management
- **Milestone Tracking** - Release planning and progress tracking
- **Automated Workflows** - CI/CD, testing, and deployment

## 🔍 Template Philosophy

This template follows several key principles:

1. **Convention over Configuration** - Sensible defaults with easy customization
2. **Documentation First** - Auto-generated docs that stay up-to-date
3. **Integration Ready** - Pre-configured for common homelab tools
4. **Scalable Structure** - Grows with your project's complexity
5. **Developer Experience** - Fast setup, clear instructions, helpful tooling

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Documentation improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- **Documentation**: Check the [docs/](docs/) directory for detailed guides
- **Issues**: Report bugs and request features via [GitHub Issues](../../issues)
- **Discussions**: Join conversations in [GitHub Discussions](../../discussions)

## 🗺️ Roadmap

### Upcoming Features
- **Docker Compose** templates for containerized environments
- **Kubernetes** manifests and Helm charts
- **Terraform** modules for infrastructure deployment
- **Monitoring** integration with Prometheus and Grafana
- **Backup** strategies and automated restoration

### Version 2.0 Goals
- Multi-language support (Python, Go, Rust templates)
- Advanced GitHub Actions workflows
- Integrated security scanning and compliance
- Enterprise features (SSO, RBAC, audit logging)

---

**Ready to start your next homelab project?** 🏠

```bash
git clone https://github.com/festion/homelab-project-template.git my-project
cd my-project
./scripts/apply-template.sh --interactive
```