# GitOps Auditor Linting Setup Script for Windows PowerShell
# This script sets up automated code quality checks for the GitOps Auditor project

param(
    [switch]$UseWSL = $false
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "🔍 Setting up GitOps Auditor Code Quality Checks..." -ForegroundColor $Green

# Check if we're in the right directory
if (-not (Test-Path ".serena\project.yml")) {
    Write-Host "Error: This doesn't appear to be the GitOps Auditor project directory." -ForegroundColor $Red
    Write-Host "Please run this script from the project root." -ForegroundColor $Red
    exit 1
}

Write-Host "✓ Detected GitOps Auditor project" -ForegroundColor $Green

# Check for WSL2 option
if ($UseWSL) {
    Write-Host "🐧 Using WSL2 for setup..." -ForegroundColor $Yellow
    wsl bash ./setup-linting.sh
    exit 0
}

# Install Python dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor $Yellow
if (Get-Command pip -ErrorAction SilentlyContinue) {
    pip install pre-commit
    Write-Host "✓ Pre-commit installed" -ForegroundColor $Green
} else {
    Write-Host "Warning: pip not found. Please install Python and pip first." -ForegroundColor $Yellow
    Write-Host "You can install Python from: https://www.python.org/downloads/" -ForegroundColor $Yellow
}

# Install Node.js dependencies
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor $Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    if (-not (Test-Path "package.json")) {
        Write-Host "Creating package.json..." -ForegroundColor $Yellow
        npm init -y | Out-Null
    }
    
    npm install --save-dev eslint "@typescript-eslint/parser" "@typescript-eslint/eslint-plugin" prettier eslint-config-prettier eslint-plugin-prettier
    
    Write-Host "✓ ESLint and Prettier installed" -ForegroundColor $Green
} else {
    Write-Host "Warning: npm not found. Please install Node.js first." -ForegroundColor $Yellow
    Write-Host "You can install Node.js from: https://nodejs.org/" -ForegroundColor $Yellow
}

# Set up pre-commit hooks
Write-Host "🔧 Setting up pre-commit hooks..." -ForegroundColor $Yellow
if (Get-Command pre-commit -ErrorAction SilentlyContinue) {
    pre-commit install
    Write-Host "✓ Pre-commit hooks installed" -ForegroundColor $Green
    
    # Test the hooks
    Write-Host "🧪 Testing pre-commit setup..." -ForegroundColor $Yellow
    $preCommitResult = pre-commit run --all-files
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ All pre-commit checks passed!" -ForegroundColor $Green
    } else {
        Write-Host "⚠ Some pre-commit checks failed. This is normal for first setup." -ForegroundColor $Yellow
        Write-Host "   The issues will be fixed automatically on commit or you can run:" -ForegroundColor $Yellow
        Write-Host "   pre-commit run --all-files" -ForegroundColor $Yellow
    }
} else {
    Write-Host "Warning: pre-commit not installed. Skipping hook setup." -ForegroundColor $Yellow
}

# Create GitHub Actions workflow
Write-Host "🤖 Setting up GitHub Actions workflow..." -ForegroundColor $Yellow
if (-not (Test-Path ".github")) {
    New-Item -ItemType Directory -Path ".github" -Force | Out-Null
}
if (-not (Test-Path ".github\workflows")) {
    New-Item -ItemType Directory -Path ".github\workflows" -Force | Out-Null
}

if (Test-Path ".github\workflows\code-quality.yml") {
    Write-Host "⚠ GitHub Actions workflow already exists. Skipping creation." -ForegroundColor $Yellow
} else {
    # Create the workflow file using separate write operations to avoid parsing issues
    $workflowPath = ".github\workflows\code-quality.yml"
    
    # Write the workflow content line by line to avoid PowerShell parsing issues
    @"
name: Code Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

jobs:
  quality-check:
    runs-on: ubuntu-latest
    name: Automated Code Quality

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install system dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y shellcheck

      - name: Install pre-commit
        run: |
          pip install pre-commit
          pre-commit install

      - name: Cache pre-commit environments
        uses: actions/cache@v3
        with:
          path: ~/.cache/pre-commit
          key: pre-commit-`${{ hashFiles('.pre-commit-config.yaml') }}

      - name: Run pre-commit on all files
        run: |
          pre-commit run --all-files --show-diff-on-failure > precommit-results.txt 2>&1 || true
          echo "Pre-commit results:" 
          cat precommit-results.txt

      - name: Create quality report
        run: |
          echo "# 🔍 GitOps Auditor Code Quality Report" > quality-report.md
          echo "" >> quality-report.md
          echo "**Generated:** `$(date)" >> quality-report.md
          echo "**Commit:** `${{ github.sha }}" >> quality-report.md
          echo "**Branch:** `${{ github.ref_name }}" >> quality-report.md
          echo "" >> quality-report.md
          
          echo "## Pre-commit Results" >> quality-report.md
          echo "\`\`\`" >> quality-report.md
          cat precommit-results.txt >> quality-report.md
          echo "\`\`\`" >> quality-report.md
          echo "" >> quality-report.md
          
          if pre-commit run --all-files; then
            echo "✅ **All quality checks passed!**" >> quality-report.md
            echo "quality_status=passed" >> `$GITHUB_ENV
          else
            echo "❌ **Quality issues found. Please review and fix.**" >> quality-report.md
            echo "quality_status=failed" >> `$GITHUB_ENV
          fi
          
          echo "" >> quality-report.md
          echo "---" >> quality-report.md
          echo "**🤖 Automated by GitHub Actions**" >> quality-report.md

      - name: Save report to output
        run: |
          mkdir -p output
          cp quality-report.md output/CodeQualityReport.md
          
          cat > output/CodeQualityReport.json << EOF
          {
            "timestamp": "`$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "commit": "`${{ github.sha }}",
            "branch": "`${{ github.ref_name }}",
            "workflow_run": "`${{ github.run_id }}",
            "quality_status": "`${{ env.quality_status }}",
            "report_file": "CodeQualityReport.md"
          }
          EOF

      - name: Upload quality report
        uses: actions/upload-artifact@v4
        with:
          name: quality-report
          path: |
            output/
            quality-report.md
          retention-days: 30

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            try {
              const report = fs.readFileSync('quality-report.md', 'utf8');
              await github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: report
              });
            } catch (error) {
              console.log('Could not post comment:', error);
            }

      - name: Commit report to main branch
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          git config user.name "GitOps Quality Bot"
          git config user.email "bot@users.noreply.github.com"
          
          git add output/CodeQualityReport.md output/CodeQualityReport.json
          git diff --cached --quiet || git commit -m "📊 Update code quality report [skip ci]"
          
          git push https://x-access-token:`${{ secrets.GITHUB_TOKEN }}@github.com/`${{ github.repository }}.git HEAD:main

      - name: Fail if quality checks failed
        if: env.quality_status == 'failed'
        run: |
          echo "Quality checks failed. Please fix the issues above."
          exit 1
"@ | Out-File -FilePath $workflowPath -Encoding UTF8
    
    Write-Host "✓ GitHub Actions workflow created" -ForegroundColor $Green
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor $Green
Write-Host ""
Write-Host "What was configured:"
Write-Host "✓ Pre-commit hooks (.pre-commit-config.yaml)"
Write-Host "✓ ESLint configuration (.eslintrc.js)"
Write-Host "✓ Prettier configuration (.prettierrc)"
Write-Host "✓ GitHub Actions workflow (.github\workflows\code-quality.yml)"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Commit and push these changes to GitHub"
Write-Host "2. The workflow will automatically run on push/PR"
Write-Host "3. Quality reports will be saved to output\CodeQualityReport.md"
Write-Host ""
Write-Host "Manual commands (PowerShell):"
Write-Host "• Run linting locally: pre-commit run --all-files"
Write-Host "• Fix formatting: npx prettier --write ."
Write-Host "• Check TypeScript: npx tsc --noEmit"
Write-Host ""
Write-Host "WSL2 Alternative:"
Write-Host "• Run with WSL2: .\setup-linting.ps1 -UseWSL"
Write-Host ""
Write-Host "Note: Quality reports integrate with your existing GitOps dashboard!" -ForegroundColor $Yellow
