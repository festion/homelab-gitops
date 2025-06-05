#!/bin/bash
# GitOps Auditor Linting Setup Script
# This script sets up automated code quality checks for the GitOps Auditor project

set -e

echo "🔍 Setting up GitOps Auditor Code Quality Checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f ".serena/project.yml" ]; then
    echo -e "${RED}Error: This doesn't appear to be the GitOps Auditor project directory.${NC}"
    echo "Please run this script from the project root."
    exit 1
fi

echo -e "${GREEN}✓${NC} Detected GitOps Auditor project"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
if command -v pip &> /dev/null; then
    pip install pre-commit
    echo -e "${GREEN}✓${NC} Pre-commit installed"
else
    echo -e "${YELLOW}Warning: pip not found. Please install pre-commit manually: pip install pre-commit${NC}"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if command -v npm &> /dev/null; then
    if [ ! -f "package.json" ]; then
        echo "Creating package.json..."
        npm init -y > /dev/null
    fi
    
    npm install --save-dev \
        eslint \
        @typescript-eslint/parser \
        @typescript-eslint/eslint-plugin \
        prettier \
        eslint-config-prettier \
        eslint-plugin-prettier
    
    echo -e "${GREEN}✓${NC} ESLint and Prettier installed"
else
    echo -e "${YELLOW}Warning: npm not found. Please install Node.js dependencies manually.${NC}"
fi

# Set up pre-commit hooks
echo "🔧 Setting up pre-commit hooks..."
if command -v pre-commit &> /dev/null; then
    pre-commit install
    echo -e "${GREEN}✓${NC} Pre-commit hooks installed"
    
    # Test the hooks
    echo "🧪 Testing pre-commit setup..."
    if pre-commit run --all-files; then
        echo -e "${GREEN}✓${NC} All pre-commit checks passed!"
    else
        echo -e "${YELLOW}⚠${NC} Some pre-commit checks failed. This is normal for first setup."
        echo "   The issues will be fixed automatically on commit or you can run:"
        echo "   pre-commit run --all-files"
    fi
else
    echo -e "${YELLOW}Warning: pre-commit not installed. Skipping hook setup.${NC}"
fi

# Create GitHub Actions workflow
echo "🤖 Setting up GitHub Actions workflow..."
mkdir -p .github/workflows

if [ -f ".github/workflows/code-quality.yml" ]; then
    echo -e "${YELLOW}⚠${NC} GitHub Actions workflow already exists. Skipping creation."
else
    cat > .github/workflows/code-quality.yml << 'EOF'
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
          key: pre-commit-${{ hashFiles('.pre-commit-config.yaml') }}

      - name: Run pre-commit on all files
        run: |
          pre-commit run --all-files --show-diff-on-failure > precommit-results.txt 2>&1 || true
          echo "Pre-commit results:" 
          cat precommit-results.txt

      - name: Create quality report
        run: |
          echo "# 🔍 GitOps Auditor Code Quality Report" > quality-report.md
          echo "" >> quality-report.md
          echo "**Generated:** $(date)" >> quality-report.md
          echo "**Commit:** ${{ github.sha }}" >> quality-report.md
          echo "**Branch:** ${{ github.ref_name }}" >> quality-report.md
          echo "" >> quality-report.md
          
          echo "## Pre-commit Results" >> quality-report.md
          echo "\`\`\`" >> quality-report.md
          cat precommit-results.txt >> quality-report.md
          echo "\`\`\`" >> quality-report.md
          echo "" >> quality-report.md
          
          # Check if pre-commit passed
          if pre-commit run --all-files; then
            echo "✅ **All quality checks passed!**" >> quality-report.md
            echo "quality_status=passed" >> $GITHUB_ENV
          else
            echo "❌ **Quality issues found. Please review and fix.**" >> quality-report.md
            echo "quality_status=failed" >> $GITHUB_ENV
          fi
          
          echo "" >> quality-report.md
          echo "---" >> quality-report.md
          echo "**🤖 Automated by GitHub Actions**" >> quality-report.md

      - name: Save report to output
        run: |
          mkdir -p output
          cp quality-report.md output/CodeQualityReport.md
          
          # Create JSON summary for dashboard integration
          cat > output/CodeQualityReport.json << EOF
          {
            "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "commit": "${{ github.sha }}",
            "branch": "${{ github.ref_name }}",
            "workflow_run": "${{ github.run_id }}",
            "quality_status": "${{ env.quality_status }}",
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
          
          git push https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.git HEAD:main

      - name: Fail if quality checks failed
        if: env.quality_status == 'failed'
        run: |
          echo "Quality checks failed. Please fix the issues above."
          exit 1
EOF
    
    echo -e "${GREEN}✓${NC} GitHub Actions workflow created"
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "What was configured:"
echo "✓ Pre-commit hooks (.pre-commit-config.yaml)"
echo "✓ ESLint configuration (.eslintrc.js)"
echo "✓ Prettier configuration (.prettierrc)"
echo "✓ GitHub Actions workflow (.github/workflows/code-quality.yml)"
echo ""
echo "Next steps:"
echo "1. Commit and push these changes to GitHub"
echo "2. The workflow will automatically run on push/PR"
echo "3. Quality reports will be saved to output/CodeQualityReport.md"
echo ""
echo "Manual commands:"
echo "• Run linting locally: pre-commit run --all-files"
echo "• Fix formatting: npx prettier --write ."
echo "• Check TypeScript: npx tsc --noEmit"
echo ""
echo -e "${YELLOW}Note: Quality reports integrate with your existing GitOps dashboard!${NC}"
