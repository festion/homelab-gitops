#!/bin/bash
# File: scripts/lint-before-commit.sh
# Description: Comprehensive linting script that validates all changes before committing
# Author: Serena (AI Agent)
# Date: 2025-06-05

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}🔍 Starting comprehensive lint check for homelab-gitops-auditor${NC}"
echo "Project root: $PROJECT_ROOT"

# Track any linting failures
LINT_FAILED=0

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to log error
log_error() {
    echo -e "${RED}❌ $1${NC}"
    LINT_FAILED=1
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "\n${BLUE}📋 Checking lint tools availability...${NC}"

# Check for required tools
if ! command_exists node; then
    log_error "Node.js is not installed or not in PATH"
fi

if ! command_exists npm; then
    log_error "npm is not installed or not in PATH"
fi

if ! command_exists shellcheck; then
    log_warning "shellcheck not found. Installing..."
    if command_exists apt-get; then
        sudo apt-get update && sudo apt-get install -y shellcheck
    else
        log_error "Could not install shellcheck. Please install manually."
    fi
fi

# Exit early if basic tools are missing
if [ $LINT_FAILED -eq 1 ]; then
    echo -e "\n${RED}💥 Cannot proceed with linting due to missing tools${NC}"
    exit 1
fi

log_success "All required tools are available"

echo -e "\n${BLUE}🎯 Linting JavaScript/TypeScript files...${NC}"

# Lint API server (Node.js/Express)
if [ -f "$PROJECT_ROOT/api/server.js" ]; then
    echo "Checking API server.js..."
    
    # Check for syntax errors using Node.js
    if node -c "$PROJECT_ROOT/api/server.js" 2>/dev/null; then
        log_success "api/server.js syntax is valid"
    else
        log_error "api/server.js has syntax errors"
        node -c "$PROJECT_ROOT/api/server.js"
    fi
    
    # Check for common issues manually since there's no ESLint config for API
    if grep -q "config.get" "$PROJECT_ROOT/api/server.js" && ! grep -q "require.*config" "$PROJECT_ROOT/api/server.js"; then
        log_error "api/server.js references 'config' but doesn't import/require it"
    fi
fi

# Lint config-loader.js if it exists
if [ -f "$PROJECT_ROOT/api/config-loader.js" ]; then
    echo "Checking API config-loader.js..."
    if node -c "$PROJECT_ROOT/api/config-loader.js" 2>/dev/null; then
        log_success "api/config-loader.js syntax is valid"
    else
        log_error "api/config-loader.js has syntax errors"
        node -c "$PROJECT_ROOT/api/config-loader.js"
    fi
fi

# Lint Dashboard (React/TypeScript)
if [ -d "$PROJECT_ROOT/dashboard" ]; then
    echo "Checking dashboard TypeScript/React files..."
    
    cd "$PROJECT_ROOT/dashboard"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_warning "Installing dashboard dependencies..."
        npm ci
    fi
    
    # Run ESLint
    if npm run lint; then
        log_success "Dashboard ESLint passed"
    else
        log_error "Dashboard ESLint failed"
    fi
    
    # TypeScript compilation check
    if npx tsc -b; then
        log_success "Dashboard TypeScript compilation passed"
    else
        log_error "Dashboard TypeScript compilation failed"
    fi
    
    cd "$PROJECT_ROOT"
fi

echo -e "\n${BLUE}🐚 Linting Shell scripts...${NC}"

# Find all shell scripts and lint them
find "$PROJECT_ROOT/scripts" -name "*.sh" -type f | while read -r script; do
    echo "Checking $(basename "$script")..."
    if shellcheck "$script"; then
        log_success "$(basename "$script") passed shellcheck"
    else
        log_error "$(basename "$script") failed shellcheck"
    fi
done

# Lint the current script too
if shellcheck "$0"; then
    log_success "lint-before-commit.sh passed shellcheck"
else
    log_error "lint-before-commit.sh failed shellcheck"
fi

echo -e "\n${BLUE}📄 Validating JSON files...${NC}"

# Validate JSON files
find "$PROJECT_ROOT" -name "*.json" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.serena/*" \
    -not -path "*/audit-history/*" | while read -r json_file; do
    echo "Checking $(basename "$json_file")..."
    if python3 -m json.tool "$json_file" > /dev/null 2>&1; then
        log_success "$(basename "$json_file") is valid JSON"
    else
        log_error "$(basename "$json_file") is invalid JSON"
    fi
done

echo -e "\n${BLUE}📋 Checking markdown files...${NC}"

# Basic markdown validation (check for common issues)
find "$PROJECT_ROOT" -name "*.md" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.serena/*" | while read -r md_file; do
    echo "Checking $(basename "$md_file")..."
    
    # Check for basic markdown issues
    if grep -q "]()" "$md_file"; then
        log_warning "$(basename "$md_file") contains empty links []() "
    fi
    
    # Check for unmatched brackets
    if ! python3 -c "
import sys
content = open('$md_file', 'r').read()
brackets = 0
for char in content:
    if char == '[':
        brackets += 1
    elif char == ']':
        brackets -= 1
    if brackets < 0:
        sys.exit(1)
sys.exit(0 if brackets == 0 else 1)
" 2>/dev/null; then
        log_error "$(basename "$md_file") has unmatched markdown brackets"
    else
        log_success "$(basename "$md_file") markdown syntax looks good"
    fi
done

echo -e "\n${BLUE}🔒 Security checks...${NC}"

# Check for sensitive file patterns
echo "Checking for sensitive files..."
sensitive_patterns=("*.env*" "*.key" "*.pem" "*password*" "*secret*")
found_sensitive=0

for pattern in "${sensitive_patterns[@]}"; do
    if find "$PROJECT_ROOT" -name "$pattern" -type f \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" | grep -q .; then
        echo -e "${RED}⚠️  Found potentially sensitive files matching: $pattern${NC}"
        find "$PROJECT_ROOT" -name "$pattern" -type f \
            -not -path "*/node_modules/*" \
            -not -path "*/.git/*"
        found_sensitive=1
    fi
done

if [ $found_sensitive -eq 0 ]; then
    log_success "No sensitive files detected"
fi

echo -e "\n${BLUE}📊 Lint Summary${NC}"

if [ $LINT_FAILED -eq 1 ]; then
    echo -e "${RED}💥 Linting failed! Please fix the above issues before committing.${NC}"
    echo -e "${YELLOW}Tip: Run this script again after making fixes: $0${NC}"
    exit 1
else
    log_success "All lint checks passed! Ready to commit."
    echo -e "${GREEN}🎉 Code quality validation complete${NC}"
    exit 0
fi
