#!/bin/bash

# GitOps Auditor Production Deployment Script
# Version: 1.1.0 (Phase 1 MCP Integration)
# Usage: curl -fsSL https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/scripts/deploy.sh | bash

set -euo pipefail

# Configuration
INSTALL_DIR="/opt/gitops"
BACKUP_DIR="/opt/gitops-backups"
SERVICE_NAME="gitops-audit-api"
GITHUB_REPO="festion/homelab-gitops-auditor"
BRANCH="main"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Parse arguments
BACKUP_CURRENT=false
ENABLE_MCP=false
VERSION="main"

while [[ $# -gt 0 ]]; do
    case $1 in
        --backup-current)
            BACKUP_CURRENT=true
            shift
            ;;
        --enable-mcp-integration)
            ENABLE_MCP=true
            shift
            ;;
        --version=*)
            VERSION="${1#*=}"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

log_info "GitOps Auditor Production Deployment"
log_info "Version: $VERSION"
log_info "MCP Integration: $ENABLE_MCP"
log_info "Backup Current: $BACKUP_CURRENT"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root"
    exit 1
fi

# Create backup if requested
if [[ "$BACKUP_CURRENT" == "true" && -d "$INSTALL_DIR" ]]; then
    BACKUP_NAME="$BACKUP_DIR/gitops-$(date +%Y%m%d_%H%M%S)"
    log_info "Creating backup: $BACKUP_NAME"
    mkdir -p "$BACKUP_DIR"
    cp -r "$INSTALL_DIR" "$BACKUP_NAME"
    log_success "Backup created: $BACKUP_NAME"
fi

# Download and extract
log_info "Downloading GitOps Auditor..."
cd /tmp
wget -q "https://github.com/$GITHUB_REPO/archive/refs/heads/$BRANCH.zip" -O gitops-update.zip

if [[ ! -f "gitops-update.zip" ]]; then
    log_error "Failed to download repository"
    exit 1
fi

unzip -q -o gitops-update.zip
EXTRACT_DIR="homelab-gitops-auditor-$BRANCH"

# Install/Update
log_info "Installing to $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"

# Clean existing node_modules to prevent conflicts
if [[ -d "$INSTALL_DIR/api/node_modules" ]]; then
    log_info "Cleaning existing API node_modules..."
    rm -rf "$INSTALL_DIR/api/node_modules"
fi
if [[ -d "$INSTALL_DIR/dashboard/node_modules" ]]; then
    log_info "Cleaning existing dashboard node_modules..."
    rm -rf "$INSTALL_DIR/dashboard/node_modules"
fi

cp -r "$EXTRACT_DIR"/* "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR"/scripts/*.sh

# Install dependencies
log_info "Installing API dependencies..."
cd "$INSTALL_DIR/api" && npm install --production --silent

log_info "Building dashboard..."
cd "$INSTALL_DIR/dashboard" && npm install --silent && npm run build

# Configure MCP integration
if [[ "$ENABLE_MCP" == "true" ]]; then
    log_info "Enabling MCP integration..."
    # Copy MCP-enabled server if available
    if [[ -f "$INSTALL_DIR/api/server-v2.js" ]]; then
        cp "$INSTALL_DIR/api/server-v2.js" "$INSTALL_DIR/api/server.js"
        log_success "MCP-integrated server enabled"
    fi
fi

# Restart services
log_info "Restarting services..."
if systemctl is-active --quiet "$SERVICE_NAME"; then
    systemctl restart "$SERVICE_NAME"
    log_success "Restarted $SERVICE_NAME"
else
    log_warning "$SERVICE_NAME service not found or not running"
fi

if systemctl is-active --quiet nginx; then
    systemctl reload nginx
    log_success "Reloaded nginx"
fi

# Cleanup
cd /tmp && rm -rf gitops-update.zip "$EXTRACT_DIR"

# Verify installation
log_info "Verifying installation..."
if [[ -f "$INSTALL_DIR/api/server.js" && -f "$INSTALL_DIR/dashboard/dist/index.html" ]]; then
    log_success "GitOps Auditor deployment completed successfully!"
    log_info "API: http://localhost:3070"
    log_info "Dashboard: http://localhost (if nginx configured)"

    if [[ "$ENABLE_MCP" == "true" ]]; then
        log_success "Phase 1 MCP Integration is active!"
        log_info "GitHub MCP: Ready for integration"
        log_info "Code-linter MCP: Ready for integration"
        log_info "Serena Orchestration: Framework ready"
    fi
else
    log_error "Installation verification failed"
    exit 1
fi

log_success "🚀 Deployment complete!"
