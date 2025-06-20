# 🔍 Code Quality & Linting Setup

This document explains how the automated code quality system works in the GitOps Auditor project.

## Overview

The project uses **GitHub Actions** for automated linting and code quality checks on every commit and pull request. **No local Serena MCP server is required** - everything runs in GitHub's cloud infrastructure.

## What's Been Configured

### ✅ Files Already Added:

- `.pre-commit-config.yaml` - Pre-commit hooks configuration
- `.eslintrc.js` - ESLint configuration for TypeScript/JavaScript
- `.prettierrc` - Prettier formatting configuration
- `setup-linting.sh` - Automated setup script

### 🔧 Quick Setup

Run the setup script to configure everything:

```bash
chmod +x setup-linting.sh
./setup-linting.sh
```

This will:

1. Install pre-commit hooks
2. Install ESLint/Prettier dependencies
3. Create the GitHub Actions workflow
4. Test the configuration

### 📋 Manual Setup (Alternative)

If you prefer manual setup:

1. **Install dependencies:**

   ```bash
   # Python dependencies
   pip install pre-commit
   pre-commit install

   # Node.js dependencies
   npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier eslint-plugin-prettier
   ```

2. **Create GitHub Actions workflow:**
   ```bash
   mkdir -p .github/workflows
   # Copy workflow content from setup-linting.sh or the documentation below
   ```

## How It Works

### 🤖 GitHub Actions Workflow

The workflow automatically runs on:

- **Push** to `main` or `develop` branches
- **Pull requests** to `main` or `develop`
- **Manual trigger** via GitHub UI

### 🔍 Checks Performed

1. **Shell Scripts** - ShellCheck linting
2. **Python Code** - Flake8, Black formatting
3. **TypeScript/JavaScript** - ESLint, Prettier
4. **General** - Trailing whitespace, file endings, merge conflicts
5. **Security** - Secret detection, npm audit

### 📊 Integration with GitOps Dashboard

Quality reports are saved to `output/CodeQualityReport.md` and `output/CodeQualityReport.json`, integrating seamlessly with your existing audit system.

## Local Development

### Run checks locally:

```bash
# Run all pre-commit checks
pre-commit run --all-files

# Run specific tools
npx eslint .
npx prettier --check .
shellcheck *.sh
```

### Auto-fix issues:

```bash
# Auto-fix formatting
npx prettier --write .
black *.py

# Auto-fix some ESLint issues
npx eslint . --fix
```

## Workflow Details

The GitHub Actions workflow:

1. **Installs tools** (ShellCheck, pre-commit, Node.js packages)
2. **Runs quality checks** on all files
3. **Generates reports** in Markdown and JSON formats
4. **Comments on PRs** with results
5. **Commits reports** back to the main branch
6. **Fails the build** if critical issues are found

## Benefits

✅ **No local dependencies** - Everything runs on GitHub
✅ **Automatic enforcement** - Quality gates on every commit
✅ **PR feedback** - Immediate feedback on pull requests
✅ **Dashboard integration** - Reports saved to `output/` directory
✅ **Consistent formatting** - Automatic code formatting
✅ **Security scanning** - Detects secrets and vulnerabilities

## Configuration Files

### `.pre-commit-config.yaml`

Defines which tools run automatically:

- ShellCheck for shell scripts
- Black/Flake8 for Python
- ESLint/Prettier for JS/TS
- General file checks

### `.eslintrc.js`

ESLint rules for TypeScript/JavaScript:

- TypeScript-specific rules
- Prettier integration
- Project-specific ignores

### `.prettierrc`

Code formatting standards:

- 2-space indentation
- Single quotes
- Semicolons
- 80-character line limit

## Troubleshooting

### Workflow not running?

- Check repository permissions for GitHub Actions
- Ensure `GITHUB_TOKEN` has workflow permissions

### Pre-commit issues?

```bash
# Reset pre-commit
pre-commit clean
pre-commit install --install-hooks
```

### Dependency issues?

```bash
# Reinstall Node dependencies
rm -rf node_modules package-lock.json
npm install
```

## Advanced Configuration

### Customize rules:

- Edit `.eslintrc.js` for linting rules
- Edit `.prettierrc` for formatting preferences
- Edit `.pre-commit-config.yaml` for hook configuration

### Skip checks:

```bash
# Skip pre-commit hooks for emergency commits
git commit --no-verify -m "Emergency fix"
```

### Add new tools:

Add entries to `.pre-commit-config.yaml` and update the GitHub Actions workflow accordingly.

---

**🏠 This system integrates perfectly with your existing GitOps Auditor dashboard and automation!**
