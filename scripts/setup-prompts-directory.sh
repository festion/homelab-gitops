#!/bin/bash
# setup-prompts-directory.sh - Add standardized .prompts directory to any project

set -e

PROJECT_NAME=$(basename "$PWD")
TEMPLATE_BASE="https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/.prompts"

echo "🚀 Setting up .prompts directory for project: $PROJECT_NAME"

# Check if .prompts already exists
if [ -d ".prompts" ]; then
    echo "⚠️  .prompts directory already exists!"
    echo "Do you want to update it? This will overwrite existing files. (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 0
    fi
    echo "📝 Updating existing .prompts directory..."
else
    echo "📁 Creating new .prompts directory structure..."
fi

# Create directory structure
mkdir -p .prompts/{system-prompts,development,operations,analysis,templates,archived}

# Function to download file with error handling
download_file() {
    local url="$1"
    local target="$2"
    echo "📥 Downloading $(basename "$target")..."

    if curl -sf "$url" > "$target"; then
        echo "✅ Downloaded: $target"
    else
        echo "❌ Failed to download: $url"
        echo "   Creating placeholder file..."
        echo "# Placeholder - Download failed" > "$target"
        echo "# Please manually create this file or check your internet connection" >> "$target"
    fi
}

# Download core documentation
download_file "$TEMPLATE_BASE/README.md" ".prompts/README.md"
download_file "$TEMPLATE_BASE/PROMPTS_OVERVIEW.md" ".prompts/PROMPTS_OVERVIEW.md"

# Download system prompts
download_file "$TEMPLATE_BASE/system-prompts/development-assistant.md" ".prompts/system-prompts/development-assistant.md"

# Download development prompts
download_file "$TEMPLATE_BASE/development/code-review-checklist.md" ".prompts/development/code-review-checklist.md"
download_file "$TEMPLATE_BASE/development/feature-development-guide.md" ".prompts/development/feature-development-guide.md"

# Download operations prompts
download_file "$TEMPLATE_BASE/operations/deployment-procedures.md" ".prompts/operations/deployment-procedures.md"
download_file "$TEMPLATE_BASE/operations/incident-response.md" ".prompts/operations/incident-response.md"

# Download analysis prompts
download_file "$TEMPLATE_BASE/analysis/gitops-audit-procedures.md" ".prompts/analysis/gitops-audit-procedures.md"
download_file "$TEMPLATE_BASE/analysis/security-assessment.md" ".prompts/analysis/security-assessment.md"

# Download templates
download_file "$TEMPLATE_BASE/templates/prompt-template.md" ".prompts/templates/prompt-template.md"
download_file "$TEMPLATE_BASE/templates/project-template-setup.md" ".prompts/templates/project-template-setup.md"

# Create archived directory placeholder
echo "# Archived Prompts Directory" > .prompts/archived/.gitkeep
echo "" >> .prompts/archived/.gitkeep
echo "This directory contains prompts that are no longer actively used but are kept for historical reference." >> .prompts/archived/.gitkeep

# Create project-specific context file
echo "📝 Creating project-specific context file..."
cat > .prompts/system-prompts/project-context.md << EOF
# $PROJECT_NAME Project Context

## Project Overview
[Add project-specific description here]

You are working on the $PROJECT_NAME project.

## Core Purpose
[Define the main purpose and goals of this project]

## Key Components
[List major components and their responsibilities]

### Architecture Overview
[Describe the overall architecture and design patterns]

### Technology Stack
[List the primary technologies, frameworks, and tools used]

## Development Context
[Specify development environment, coding standards, and practices]

### Development Environment
- [Development setup requirements]
- [Local development workflow]
- [Testing procedures]

### Coding Standards
- [Language-specific conventions]
- [Code organization patterns]
- [Documentation requirements]

## Operational Context
[Define deployment, monitoring, and operational considerations]

### Deployment
- [Deployment target environments]
- [Deployment procedures and tools]
- [Configuration management]

### Monitoring & Maintenance
- [Monitoring and alerting setup]
- [Maintenance procedures]
- [Backup and recovery]

## Project-Specific Guidelines
[Add any project-specific rules, constraints, or considerations]

Use this context when making decisions, writing code, or providing guidance for the $PROJECT_NAME project.

---
**Note**: This file was auto-generated. Please customize it with project-specific information.
**Last Updated**: $(date +"%Y-%m-%d")
EOF

# Add to .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    touch .gitignore
fi

# Check if .prompts is already in .gitignore
if ! grep -q ".prompts" .gitignore 2>/dev/null; then
    echo "📝 Adding .prompts to version control (recommended)..."
    echo "" >> .gitignore
    echo "# Prompts directory is version controlled for team consistency" >> .gitignore
    echo "# Remove the following line if you want to exclude .prompts from git" >> .gitignore
    echo "# .prompts/" >> .gitignore
fi

# Create package.json scripts if package.json exists
if [ -f "package.json" ]; then
    echo "📝 Adding .prompts management scripts to package.json..."
    # Check if jq is available for JSON manipulation
    if command -v jq > /dev/null; then
        # Add scripts using jq
        jq '.scripts += {
            "setup-prompts": "bash scripts/setup-prompts-directory.sh",
            "validate-prompts": "find .prompts -name \"*.md\" -type f | wargs markdownlint || echo \"markdownlint not installed\"",
            "update-prompts": "bash scripts/setup-prompts-directory.sh"
        }' package.json > package.json.tmp && mv package.json.tmp package.json
        echo "✅ Added npm scripts for .prompts management"
    else
        echo "💡 Consider adding these scripts to your package.json:"
        echo '   "setup-prompts": "bash scripts/setup-prompts-directory.sh"'
        echo '   "validate-prompts": "find .prompts -name \"*.md\" -type f | xargs markdownlint"'
        echo '   "update-prompts": "bash scripts/setup-prompts-directory.sh"'
    fi
fi

# Success message and next steps
echo ""
echo "🎉 .prompts directory setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. 📝 Customize .prompts/system-prompts/project-context.md with your project details"
echo "2. 🔍 Review other prompts and adapt them to your project needs"
echo "3. 📚 Read .prompts/README.md for usage guidelines"
echo "4. 🔄 Commit the .prompts directory to version control"
echo ""
echo "💡 Quick Commands:"
echo "   Edit project context: \$EDITOR .prompts/system-prompts/project-context.md"
echo "   View all prompts: find .prompts -name '*.md' | head -10"
echo "   Add to git: git add .prompts && git commit -m 'Add standardized .prompts directory'"
echo ""
echo "🔗 For more information, see:"
echo "   .prompts/PROMPTS_OVERVIEW.md - Complete overview and best practices"
echo "   .prompts/templates/project-template-setup.md - Setting up organization standards"
echo ""

# Optional: Auto-commit if this is a git repository and user wants to
if [ -d ".git" ]; then
    echo "🤔 Do you want to automatically commit the .prompts directory to git? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git add .prompts/
        git add .gitignore 2>/dev/null || true
        if [ -f "package.json" ] && command -v jq > /dev/null; then
            git add package.json
        fi
        git commit -m "Add standardized .prompts directory structure

- Added comprehensive prompt collection for development and operations
- Includes system prompts, development guides, operations procedures
- Added project-specific context template
- Integrated with project tooling"
        echo "✅ Committed .prompts directory to git"
    fi
fi

echo "🚀 Happy prompting!"
