# .prompts Directory Standardization Guide

This guide provides multiple strategies to ensure all new projects include the standardized `.prompts` directory structure.

## 🎯 Quick Start - For Any Existing Project

### One-Line Setup Command
```bash
bash <(curl -s https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/scripts/setup-prompts-directory.sh)
```

This command will:
- ✅ Create the complete `.prompts` directory structure
- ✅ Download all standard prompts from this repository
- ✅ Create a customizable project-context.md file
- ✅ Integrate with existing tooling (package.json, .gitignore)
- ✅ Optionally commit to git

## 📋 Implementation Strategies

### Strategy 1: GitHub Template Repository (Recommended)

**Best for**: New projects, organization-wide standardization

1. **Create Template Repository**:
   ```bash
   gh repo create your-org/project-template --template
   # Copy .prompts directory to template repo
   # Enable as GitHub template in repository settings
   ```

2. **Use Template for New Projects**:
   ```bash
   gh repo create my-new-project --template your-org/project-template
   ```

### Strategy 2: Setup Script (For Existing Projects)

**Best for**: Adding .prompts to existing projects

1. **Copy Setup Script**:
   ```bash
   # Copy scripts/setup-prompts-directory.sh to your project
   cp scripts/setup-prompts-directory.sh /path/to/your/project/
   chmod +x setup-prompts-directory.sh
   ```

2. **Run Setup**:
   ```bash
   ./setup-prompts-directory.sh
   ```

### Strategy 3: NPM Package (For Node.js Projects)

**Best for**: Node.js ecosystems

1. **Create NPM Package**:
   ```json
   {
     "name": "@your-org/project-prompts",
     "version": "1.0.0",
     "bin": {
       "setup-prompts": "./bin/setup-prompts.js"
     },
     "files": ["prompts/", "bin/"]
   }
   ```

2. **Install and Use**:
   ```bash
   npx @your-org/project-prompts
   ```

### Strategy 4: Git Hooks

**Best for**: Enforcing standards in existing workflows

1. **Pre-commit Hook**:
   ```bash
   #!/bin/bash
   # .git/hooks/pre-commit
   if [ ! -d ".prompts" ]; then
       echo "⚠️  .prompts directory missing!"
       echo "Run: bash setup-prompts-directory.sh"
       exit 1
   fi
   ```

### Strategy 5: GitHub Actions Automation

**Best for**: Automated enforcement across repositories

1. **Create Workflow**:
   ```yaml
   # .github/workflows/ensure-prompts.yml
   name: Ensure .prompts Directory

   on:
     push:
       branches: [main]

   jobs:
     check-prompts:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Check for .prompts directory
           run: |
             if [ ! -d ".prompts" ]; then
               echo "Adding .prompts directory..."
               bash <(curl -s https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/scripts/setup-prompts-directory.sh)
               git config user.name "GitHub Actions"
               git config user.email "actions@github.com"
               git add .prompts/
               git commit -m "Auto-add .prompts directory structure"
               git push
             fi
   ```

## 🏢 Organization-Wide Implementation

### Phase 1: Pilot (Week 1-2)
1. **Create Template Repository** with complete .prompts structure
2. **Test with 2-3 new projects** to validate approach
3. **Gather feedback** and refine prompts
4. **Document best practices** and usage guidelines

### Phase 2: Rollout (Week 3-4)
1. **Add .prompts to existing critical projects** using setup script
2. **Train team members** on prompt usage and benefits
3. **Update project creation workflows** to use template
4. **Set up automated enforcement** via GitHub Actions

### Phase 3: Standardization (Week 5-6)
1. **Audit all repositories** for .prompts compliance
2. **Implement organization policies** requiring .prompts
3. **Create maintenance procedures** for prompt updates
4. **Establish feedback loops** for continuous improvement

## 📚 Maintenance & Updates

### Keeping Prompts Current

1. **Central Source of Truth**: Use this repository as the master template
2. **Version Control**: Tag prompt releases (v1.0, v1.1, etc.)
3. **Update Script**: Re-run setup script to get latest prompts
4. **Change Management**: Document prompt changes in CHANGELOG.md

### Update Workflow
```bash
# Update all prompts in a project
bash <(curl -s https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/scripts/setup-prompts-directory.sh)

# Or if you have the script locally
./scripts/setup-prompts-directory.sh
```

### Customization Guidelines
1. **Core Prompts**: Keep standard system and development prompts unchanged
2. **Project-Specific**: Customize project-context.md for each project
3. **Additional Prompts**: Add project-specific prompts in appropriate categories
4. **Archive Old Prompts**: Move outdated prompts to archived/ directory

## 🔧 Integration with Development Tools

### VS Code Integration
```json
// .vscode/settings.json
{
    "files.associations": {
        ".prompts/**/*.md": "markdown"
    },
    "markdown.extension.toc.levels": "2..6",
    "markdownlint.config": {
        ".prompts/": {
            "line-length": false
        }
    }
}
```

### Package.json Scripts
```json
{
    "scripts": {
        "setup-prompts": "bash scripts/setup-prompts-directory.sh",
        "validate-prompts": "find .prompts -name '*.md' | xargs markdownlint",
        "update-prompts": "bash scripts/setup-prompts-directory.sh"
    }
}
```

### Makefile Integration
```makefile
# Makefile
.PHONY: setup-prompts update-prompts validate-prompts

setup-prompts:
	@bash scripts/setup-prompts-directory.sh

update-prompts: setup-prompts

validate-prompts:
	@find .prompts -name '*.md' | xargs markdownlint || echo "markdownlint not installed"
```

## 📊 Benefits & ROI

### Development Efficiency
- **Faster Onboarding**: New team members get complete context immediately
- **Consistent Reviews**: Standardized code review process across projects
- **Reduced Errors**: Step-by-step guidance prevents common mistakes
- **Knowledge Sharing**: Best practices documented and accessible

### Quality Improvements
- **Security**: Systematic security assessment procedures
- **Operations**: Standardized deployment and incident response
- **Documentation**: Consistent documentation across projects
- **Maintainability**: Clear guidelines for code and architecture

### Measurable Outcomes
- **Reduced Review Time**: 30-50% faster code reviews with checklists
- **Fewer Production Issues**: Systematic deployment procedures
- **Faster Issue Resolution**: Standardized incident response
- **Improved Team Satisfaction**: Clear processes and expectations

## 🚀 Getting Started Checklist

- [ ] Choose implementation strategy based on your needs
- [ ] Set up template repository or copy setup script
- [ ] Test with pilot project
- [ ] Train team on prompt usage
- [ ] Update development workflows
- [ ] Implement automation (optional)
- [ ] Establish maintenance procedures
- [ ] Measure and improve based on feedback

## 📞 Support & Resources

### Documentation
- `.prompts/README.md` - Basic usage guidelines
- `.prompts/PROMPTS_OVERVIEW.md` - Comprehensive overview
- `.prompts/templates/prompt-template.md` - Creating new prompts

### Scripts & Tools
- `scripts/setup-prompts-directory.sh` - One-line setup for any project
- GitHub template repository approach
- Package.json integration examples

### Best Practices
- Keep prompts version controlled with projects
- Customize project-context.md for each project
- Regular updates from central template
- Team training and feedback incorporation

Start with the one-line setup command and expand based on your organization's needs!
