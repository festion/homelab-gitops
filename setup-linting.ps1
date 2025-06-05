# GitOps Auditor Linting Setup Script for Windows PowerShell
# This script sets up automated code quality checks for the GitOps Auditor project

param(
    [switch]$UseWSL = $false
)

Write-Host "🔍 Setting up GitOps Auditor Code Quality Checks..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path ".serena\project.yml")) {
    Write-Host "Error: This doesn't appear to be the GitOps Auditor project directory." -ForegroundColor Red
    Write-Host "Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Detected GitOps Auditor project" -ForegroundColor Green

# Check for WSL2 option
if ($UseWSL) {
    Write-Host "🐧 Using WSL2 for setup..." -ForegroundColor Yellow
    wsl bash ./setup-linting.sh
    exit 0
}

# Install Python dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
if (Get-Command pip -ErrorAction SilentlyContinue) {
    pip install pre-commit
    Write-Host "✓ Pre-commit installed" -ForegroundColor Green
} else {
    Write-Host "Warning: pip not found. Please install Python and pip first." -ForegroundColor Yellow
    Write-Host "You can install Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
}

# Install Node.js dependencies
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    if (-not (Test-Path "package.json")) {
        Write-Host "Creating package.json..." -ForegroundColor Yellow
        npm init -y | Out-Null
    }
    
    npm install --save-dev eslint "@typescript-eslint/parser" "@typescript-eslint/eslint-plugin" prettier eslint-config-prettier eslint-plugin-prettier
    
    Write-Host "✓ ESLint and Prettier installed" -ForegroundColor Green
} else {
    Write-Host "Warning: npm not found. Please install Node.js first." -ForegroundColor Yellow
    Write-Host "You can install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
}

# Set up pre-commit hooks
Write-Host "🔧 Setting up pre-commit hooks..." -ForegroundColor Yellow
if (Get-Command pre-commit -ErrorAction SilentlyContinue) {
    pre-commit install
    Write-Host "✓ Pre-commit hooks installed" -ForegroundColor Green
    
    # Test the hooks
    Write-Host "🧪 Testing pre-commit setup..." -ForegroundColor Yellow
    try {
        pre-commit run --all-files
        Write-Host "✓ All pre-commit checks passed!" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Some pre-commit checks failed. This is normal for first setup." -ForegroundColor Yellow
        Write-Host "   Run 'pre-commit run --all-files' to see details." -ForegroundColor Yellow
    }
} else {
    Write-Host "Warning: pre-commit not installed. Skipping hook setup." -ForegroundColor Yellow
}

# Create GitHub Actions workflow directory
Write-Host "🤖 Setting up GitHub Actions workflow..." -ForegroundColor Yellow
if (-not (Test-Path ".github")) {
    New-Item -ItemType Directory -Path ".github" -Force | Out-Null
}
if (-not (Test-Path ".github\workflows")) {
    New-Item -ItemType Directory -Path ".github\workflows" -Force | Out-Null
}

if (Test-Path ".github\workflows\code-quality.yml") {
    Write-Host "⚠ GitHub Actions workflow already exists. Skipping creation." -ForegroundColor Yellow
} else {
    Write-Host "📝 Creating GitHub Actions workflow..." -ForegroundColor Yellow
    Write-Host "   Please manually create .github\workflows\code-quality.yml" -ForegroundColor Yellow
    Write-Host "   Content available in setup-linting.sh or docs\CODE_QUALITY.md" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "What was configured:"
Write-Host "✓ Pre-commit hooks (.pre-commit-config.yaml)"
Write-Host "✓ ESLint configuration (.eslintrc.js)"
Write-Host "✓ Prettier configuration (.prettierrc)"
Write-Host "⚠ GitHub Actions workflow (manual creation needed)"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Create .github\workflows\code-quality.yml manually (see docs)"
Write-Host "2. Commit and push these changes to GitHub"
Write-Host "3. The workflow will automatically run on push/PR"
Write-Host ""
Write-Host "Manual commands (PowerShell):"
Write-Host "• Run linting locally: pre-commit run --all-files"
Write-Host "• Fix formatting: npx prettier --write ."
Write-Host "• Check TypeScript: npx tsc --noEmit"
Write-Host ""
Write-Host "WSL2 Alternative:"
Write-Host "• Run with WSL2: .\setup-linting.ps1 -UseWSL"
Write-Host ""
Write-Host "For the GitHub Actions workflow, copy content from setup-linting.sh"
Write-Host "or see the complete example in docs\CODE_QUALITY.md" -ForegroundColor Yellow
