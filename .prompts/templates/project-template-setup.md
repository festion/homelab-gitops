# Project Template Setup Guide

This guide helps you create a standardized project template that includes the `.prompts` directory structure for all new projects.

## Method 1: GitHub Template Repository

### Step 1: Create Template Repository
1. Create a new repository named `project-template` or `homelab-project-template`
2. Include the complete `.prompts` directory structure
3. Add basic project scaffolding (package.json, README template, etc.)
4. Enable as GitHub template repository

### Step 2: Template Repository Structure
```
project-template/
├── .prompts/                           # Complete prompts directory
│   ├── README.md
│   ├── PROMPTS_OVERVIEW.md
│   ├── system-prompts/
│   ├── development/
│   ├── operations/
│   ├── analysis/
│   ├── templates/
│   └── archived/
├── .github/                           # GitHub workflow templates
│   ├── workflows/
│   │   ├── ci.yml.template
│   │   └── deploy.yml.template
│   └── ISSUE_TEMPLATE/
├── docs/                              # Documentation templates
│   ├── README_TEMPLATE.md
│   ├── CONTRIBUTING.md
│   └── CODE_OF_CONDUCT.md
├── scripts/                           # Common scripts
│   ├── setup.sh
│   ├── lint.sh
│   └── deploy.sh
├── .gitignore                         # Standard gitignore
├── .eslintrc.js                       # Linting configuration
├── package.json.template              # Package template
└── README.md                          # Template usage instructions
```

### Step 3: Enable Template Repository
1. Go to repository Settings
2. Scroll to "Template repository" section
3. Check "Template repository" box
4. Save changes

### Step 4: Using the Template
```bash
# When creating new projects, select "Use this template"
# Or via GitHub CLI:
gh repo create my-new-project --template username/project-template
```

## Method 2: Project Initialization Script

### Create Universal Setup Script
```bash
#!/bin/bash
# setup-new-project.sh

PROJECT_NAME="$1"
PROJECT_TYPE="${2:-general}"  # general, nodejs, python, etc.

if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: $0 <project-name> [project-type]"
    exit 1
fi

echo "Setting up new project: $PROJECT_NAME"

# Create project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize git
git init

# Create .prompts directory structure
mkdir -p .prompts/{system-prompts,development,operations,analysis,templates,archived}

# Copy standard prompts from template
curl -s https://raw.githubusercontent.com/username/project-template/main/.prompts/README.md > .prompts/README.md
curl -s https://raw.githubusercontent.com/username/project-template/main/.prompts/PROMPTS_OVERVIEW.md > .prompts/PROMPTS_OVERVIEW.md

# Copy system prompts and customize
curl -s https://raw.githubusercontent.com/username/project-template/main/.prompts/system-prompts/project-context-template.md > .prompts/system-prompts/project-context.md
sed -i "s/PROJECT_NAME_PLACEHOLDER/$PROJECT_NAME/g" .prompts/system-prompts/project-context.md

# Copy other essential prompts
curl -s https://raw.githubusercontent.com/username/project-template/main/.prompts/development/code-review-checklist.md > .prompts/development/code-review-checklist.md
curl -s https://raw.githubusercontent.com/username/project-template/main/.prompts/templates/prompt-template.md > .prompts/templates/prompt-template.md

# Create basic project files based on type
case "$PROJECT_TYPE" in
    "nodejs")
        echo "Setting up Node.js project..."
        npm init -y
        echo "node_modules/" > .gitignore
        ;;
    "python")
        echo "Setting up Python project..."
        echo "__pycache__/" > .gitignore
        echo "*.pyc" >> .gitignore
        ;;
    *)
        echo "Setting up general project..."
        touch README.md
        ;;
esac

echo "Project $PROJECT_NAME setup complete with .prompts directory!"
```

## Method 3: Git Hooks for Existing Projects

### Pre-commit Hook to Check for .prompts
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check if .prompts directory exists
if [ ! -d ".prompts" ]; then
    echo "Warning: .prompts directory not found!"
    echo "Run: bash setup-prompts.sh to add standard prompts"
    echo "Continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
```

### Setup Script for Existing Projects
```bash
#!/bin/bash
# setup-prompts.sh - Add .prompts to existing project

echo "Adding .prompts directory to existing project..."

# Create directory structure
mkdir -p .prompts/{system-prompts,development,operations,analysis,templates,archived}

# Download standard prompts
TEMPLATE_BASE="https://raw.githubusercontent.com/username/project-template/main/.prompts"

curl -s "$TEMPLATE_BASE/README.md" > .prompts/README.md
curl -s "$TEMPLATE_BASE/PROMPTS_OVERVIEW.md" > .prompts/PROMPTS_OVERVIEW.md
curl -s "$TEMPLATE_BASE/system-prompts/development-assistant.md" > .prompts/system-prompts/development-assistant.md
curl -s "$TEMPLATE_BASE/development/code-review-checklist.md" > .prompts/development/code-review-checklist.md
curl -s "$TEMPLATE_BASE/templates/prompt-template.md" > .prompts/templates/prompt-template.md

# Create project-specific context
PROJECT_NAME=$(basename "$PWD")
cat > .prompts/system-prompts/project-context.md << EOF
# $PROJECT_NAME Project Context

## Project Overview
[Add project-specific description here]

## Core Purpose
[Define the main purpose and goals]

## Key Components
[List major components and their responsibilities]

## Architecture Principles
[Define architectural guidelines]

## Development Context
[Specify technologies, languages, frameworks]

## Operational Context
[Define deployment and operational considerations]

Use this context when making decisions, writing code, or providing guidance for this project.
EOF

echo ".prompts directory setup complete!"
echo "Please customize .prompts/system-prompts/project-context.md with project-specific information."
```

## Method 4: Organization-wide Standards

### GitHub Organization Template
1. Create organization-level repository templates
2. Set up organization defaults for new repositories
3. Use GitHub Apps to automatically add .prompts to new repos

### VS Code/IDE Integration
```json
// .vscode/settings.json template
{
    "files.associations": {
        ".prompts/**/*.md": "markdown"
    },
    "markdownlint.config": {
        ".prompts/": false
    }
}
```

### Package.json Scripts
```json
{
    "scripts": {
        "setup-prompts": "bash scripts/setup-prompts.sh",
        "validate-prompts": "find .prompts -name '*.md' | xargs markdownlint",
        "update-prompts": "curl -s https://api.github.com/repos/username/project-template/contents/.prompts | jq -r '.[].download_url' | xargs -I {} curl -s {}"
    }
}
```

## Method 5: Automated Solutions

### GitHub Action for New Repositories
```yaml
# .github/workflows/setup-prompts.yml
name: Setup Prompts Directory

on:
  create:
    branches: [main]

jobs:
  setup-prompts:
    if: github.event.ref_type == 'repository'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup .prompts directory
        run: |
          if [ ! -d ".prompts" ]; then
            bash <(curl -s https://raw.githubusercontent.com/username/project-template/main/scripts/setup-prompts.sh)
            git add .prompts/
            git commit -m "Add standard .prompts directory structure"
            git push
          fi
```

### CLI Tool for Project Management
```bash
#!/bin/bash
# homelab-project-cli

case "$1" in
    "new")
        PROJECT_NAME="$2"
        PROJECT_TYPE="$3"
        gh repo create "$PROJECT_NAME" --template username/project-template
        cd "$PROJECT_NAME"
        bash scripts/customize-for-project.sh "$PROJECT_NAME" "$PROJECT_TYPE"
        ;;
    "add-prompts")
        bash <(curl -s https://raw.githubusercontent.com/username/project-template/main/scripts/setup-prompts.sh)
        ;;
    "update-prompts")
        bash <(curl -s https://raw.githubusercontent.com/username/project-template/main/scripts/update-prompts.sh)
        ;;
    *)
        echo "Usage: $0 {new|add-prompts|update-prompts} [args...]"
        ;;
esac
```

## Implementation Recommendation

1. **Start with GitHub Template Repository** - Most straightforward for new projects
2. **Create setup scripts** - For adding to existing projects
3. **Add to development workflow** - Make it part of project creation checklist
4. **Automate where possible** - Use GitHub Actions or hooks for consistency

The template repository approach gives you the most control and easiest adoption path while maintaining consistency across all projects.
