# 🪟 Windows 11 Setup Guide

This guide provides Windows 11 PowerShell commands for setting up code quality automation in the GitOps Auditor project.

## 🚀 Quick Setup Options

### Option 1: PowerShell Script (Recommended)
```powershell
# Run the automated PowerShell setup script
.\setup-linting.ps1
```

### Option 2: Use WSL2 (If you prefer Linux commands)
```powershell
# Use WSL2 to run the bash script
.\setup-linting.ps1 -UseWSL

# Or run directly in WSL2
wsl bash ./setup-linting.sh
```

### Option 3: Manual PowerShell Setup

## 📋 Manual Setup Steps (PowerShell)

### 1. Install Prerequisites

**Python & pip:**
```powershell
# Check if Python is installed
python --version
pip --version

# If not installed, download from: https://www.python.org/downloads/
# Make sure to check "Add Python to PATH" during installation
```

**Node.js & npm:**
```powershell
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from: https://nodejs.org/
```

### 2. Install Python Dependencies
```powershell
# Install pre-commit
pip install pre-commit

# Install pre-commit hooks
pre-commit install
```

### 3. Install Node.js Dependencies
```powershell
# Create package.json if it doesn't exist
if (-not (Test-Path "package.json")) {
    npm init -y
}

# Install linting dependencies
npm install --save-dev eslint "@typescript-eslint/parser" "@typescript-eslint/eslint-plugin" prettier eslint-config-prettier eslint-plugin-prettier
```

### 4. Create GitHub Actions Workflow
```powershell
# Create directories
New-Item -ItemType Directory -Path ".github" -Force
New-Item -ItemType Directory -Path ".github\workflows" -Force

# The workflow file content is in setup-linting.ps1
# Or copy from the bash version
```

## 🧪 Testing Your Setup

### Run quality checks locally:
```powershell
# Run all pre-commit checks
pre-commit run --all-files

# Run specific tools
npx eslint .
npx prettier --check .

# Check TypeScript compilation (if tsconfig.json exists)
npx tsc --noEmit
```

### Auto-fix formatting issues:
```powershell
# Fix code formatting
npx prettier --write .

# Fix some ESLint issues automatically
npx eslint . --fix

# Fix Python formatting (if you have Python files)
pip install black
black *.py
```

## 🐧 WSL2 Alternative

If you prefer using Linux commands, you can use WSL2:

```powershell
# Run the bash setup script in WSL2
wsl bash ./setup-linting.sh

# Or enter WSL2 and run commands there
wsl
# Now you're in Ubuntu - use the bash commands from the main documentation
```

## 🛠️ PowerShell Specific Commands

### Check what's installed:
```powershell
# Check Python tools
Get-Command python, pip, pre-commit -ErrorAction SilentlyContinue

# Check Node.js tools  
Get-Command node, npm, npx -ErrorAction SilentlyContinue

# List installed packages
pip list | Select-String "pre-commit"
npm list --depth=0
```

### Troubleshooting:
```powershell
# Fix execution policy if needed
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Reinstall pre-commit hooks
pre-commit clean
pre-commit install --install-hooks

# Clear npm cache if needed
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 📁 File Structure

After setup, your project will have:

```
homelab-gitops-auditor/
├── .github/
│   └── workflows/
│       └── code-quality.yml      # GitHub Actions workflow
├── .pre-commit-config.yaml       # Pre-commit configuration
├── .eslintrc.js                  # ESLint rules
├── .prettierrc                   # Prettier formatting
├── setup-linting.ps1             # PowerShell setup script
├── setup-linting.sh              # Bash setup script
└── docs/
    ├── CODE_QUALITY.md           # Main documentation
    └── WINDOWS_SETUP.md          # This file
```

## 🎯 Integration with Your Workflow

The quality checks will:

✅ **Run automatically** on every commit to GitHub  
✅ **Save reports** to `output\CodeQualityReport.md`  
✅ **Integrate** with your existing GitOps dashboard  
✅ **Comment on PRs** with quality feedback  
✅ **Enforce standards** by failing builds on critical issues  

## 💡 Pro Tips for Windows Users

1. **Use Windows Terminal** for better PowerShell experience
2. **Install Git for Windows** if you haven't already
3. **Consider WSL2** for the best of both worlds
4. **Use VS Code** with PowerShell and WSL extensions

## 🔧 VS Code Integration

Add these to your VS Code settings for better integration:

```json
{
    "eslint.enable": true,
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "python.formatting.provider": "black",
    "terminal.integrated.defaultProfile.windows": "PowerShell"
}
```

---

**🎉 You're all set! Your code will now be automatically linted and formatted on every commit to GitHub.**
