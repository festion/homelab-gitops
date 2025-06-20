#!/bin/bash
# GitOps Auditor v1.1.0 - Automated Deployment Script
# Deploys v1.1.0 features to production server
# Usage: ./deploy-v1.1.0.sh [--dry-run] [--backup-only]

set -euo pipefail

# Configuration
PRODUCTION_HOST="${GITOPS_PROD_HOST:-192.168.1.58}"
PRODUCTION_USER="${GITOPS_PROD_USER:-root}"
PRODUCTION_PATH="/opt/gitops"
BACKUP_DIR="/opt/gitops-backups"
VERSION="1.1.0"

# Local paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}🚀 $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Parse arguments
DRY_RUN=false
BACKUP_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --backup-only)
            BACKUP_ONLY=true
            shift
            ;;
        --help|-h)
            echo "GitOps Auditor v1.1.0 Deployment Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run       Show what would be deployed without making changes"
            echo "  --backup-only   Only create backup, don't deploy"
            echo "  --help, -h      Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  GITOPS_PROD_HOST    Production server IP (default: 192.168.1.58)"
            echo "  GITOPS_PROD_USER    Production server user (default: root)"
            echo ""
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to execute remote commands
remote_exec() {
    local command="$1"
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would execute on $PRODUCTION_HOST: $command"
    else
        ssh "$PRODUCTION_USER@$PRODUCTION_HOST" "$command"
    fi
}

# Function to copy files to production
remote_copy() {
    local local_path="$1"
    local remote_path="$2"
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would copy: $local_path -> $PRODUCTION_HOST:$remote_path"
    else
        scp -r "$local_path" "$PRODUCTION_USER@$PRODUCTION_HOST:$remote_path"
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Check if we can connect to production server
    if ! ssh -o ConnectTimeout=5 "$PRODUCTION_USER@$PRODUCTION_HOST" "echo 'Connection successful'" >/dev/null 2>&1; then
        log_error "Cannot connect to production server: $PRODUCTION_HOST"
        log_error "Please check your SSH configuration and server availability"
        exit 1
    fi
    
    # Check if required files exist locally
    local required_files=(
        "api/csv-export.js"
        "api/email-notifications.js"
        "dashboard/src/components/DiffViewer.tsx"
        "scripts/nightly-email-summary.sh"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$PROJECT_ROOT/$file" ]]; then
            log_error "Required file missing: $file"
            exit 1
        fi
    done
    
    log_success "Prerequisites check passed"
}

# Function to create backup
create_backup() {
    log_info "Creating backup of current production deployment..."
    
    local backup_name="gitops-backup-v${VERSION}-$(date +%Y%m%d_%H%M%S)"
    
    remote_exec "mkdir -p $BACKUP_DIR"
    remote_exec "cp -r $PRODUCTION_PATH $BACKUP_DIR/$backup_name"
    
    log_success "Backup created: $BACKUP_DIR/$backup_name"
    
    if [[ "$BACKUP_ONLY" == "true" ]]; then
        log_info "Backup-only mode complete"
        exit 0
    fi
}

# Function to deploy API changes
deploy_api() {
    log_info "Deploying API v1.1.0 features..."
    
    # Copy new API modules
    remote_copy "$PROJECT_ROOT/api/csv-export.js" "$PRODUCTION_PATH/api/"
    remote_copy "$PROJECT_ROOT/api/email-notifications.js" "$PRODUCTION_PATH/api/"
    
    # Update main server.js with new endpoints
    log_info "Updating server.js with v1.1.0 endpoints..."
    
    # Create updated server.js content
    local server_update="
// v1.1.0 Feature imports
const { handleCSVExport } = require('./csv-export');
const { handleEmailSummary } = require('./email-notifications');
"
    
    # Add endpoints after existing routes
    local endpoint_update="
// v1.1.0 - CSV Export endpoint
app.get('/audit/export/csv', (req, res) => {
  handleCSVExport(req, res, HISTORY_DIR);
});

// v1.1.0 - Email Summary endpoint  
app.post('/audit/email-summary', (req, res) => {
  handleEmailSummary(req, res, HISTORY_DIR);
});
"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        # Update server.js with new imports and endpoints
        remote_exec "sed -i '8a\\${server_update}' $PRODUCTION_PATH/api/server.js"
        remote_exec "sed -i '110a\\${endpoint_update}' $PRODUCTION_PATH/api/server.js"
    fi
    
    log_success "API deployment completed"
}

# Function to deploy dashboard changes
deploy_dashboard() {
    log_info "Deploying dashboard v1.1.0 features..."
    
    # Copy enhanced components
    remote_copy "$PROJECT_ROOT/dashboard/src/components/DiffViewer.tsx" "$PRODUCTION_PATH/dashboard/src/components/"
    
    # Copy updated pages
    remote_copy "$PROJECT_ROOT/dashboard/src/pages/audit-v1.1.0.tsx" "$PRODUCTION_PATH/dashboard/src/pages/audit.tsx"
    remote_copy "$PROJECT_ROOT/dashboard/src/pages/roadmap-v1.1.0.tsx" "$PRODUCTION_PATH/dashboard/src/pages/roadmap.tsx"
    
    # Build and deploy dashboard
    log_info "Building dashboard with v1.1.0 features..."
    
    remote_exec "cd $PRODUCTION_PATH/dashboard && npm install"
    remote_exec "cd $PRODUCTION_PATH/dashboard && npm run build"
    remote_exec "cp -r $PRODUCTION_PATH/dashboard/dist/* /var/www/gitops-dashboard/"
    
    log_success "Dashboard deployment completed"
}

# Function to deploy scripts
deploy_scripts() {
    log_info "Deploying v1.1.0 scripts..."
    
    remote_copy "$PROJECT_ROOT/scripts/nightly-email-summary.sh" "$PRODUCTION_PATH/scripts/"
    remote_exec "chmod +x $PRODUCTION_PATH/scripts/nightly-email-summary.sh"
    
    log_success "Scripts deployment completed"
}

# Function to restart services
restart_services() {
    log_info "Restarting production services..."
    
    remote_exec "systemctl restart gitops-audit-api"
    remote_exec "systemctl status gitops-audit-api --no-pager"
    
    log_success "Services restarted successfully"
}

# Function to verify deployment
verify_deployment() {
    log_info "Verifying v1.1.0 deployment..."
    
    # Test API endpoints
    local api_tests=(
        "curl -s http://localhost:3070/audit | jq -r '.summary.total'"
        "curl -I http://localhost:3070/audit/export/csv | grep 'Content-Type: text/csv'"
        "curl -X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\"}' http://localhost:3070/audit/email-summary | grep -q 'email'"
    )
    
    for test in "${api_tests[@]}"; do
        if [[ "$DRY_RUN" == "false" ]]; then
            if remote_exec "$test" >/dev/null 2>&1; then
                log_success "API test passed: ${test:0:50}..."
            else
                log_warning "API test failed: ${test:0:50}..."
            fi
        else
            echo "[DRY RUN] Would test: $test"
        fi
    done
    
    # Test dashboard
    if [[ "$DRY_RUN" == "false" ]]; then
        if remote_exec "curl -s http://localhost:8080 | grep -q 'Enhanced Diff'" >/dev/null 2>&1; then
            log_success "Dashboard v1.1.0 features detected"
        else
            log_warning "Dashboard v1.1.0 features not fully deployed"
        fi
    fi
    
    log_success "Deployment verification completed"
}

# Function to show post-deployment instructions
show_completion_message() {
    log_success "🎉 GitOps Auditor v1.1.0 deployment completed!"
    echo ""
    log_info "New features available at: https://gitops.internal.lakehouse.wtf/"
    echo ""
    echo "📊 CSV Export: Click 'Export CSV' button in dashboard"
    echo "📧 Email Summary: Enter email address and click 'Email Summary'"
    echo "🔍 Enhanced Diff: Click 'Enhanced Diff' for repositories with changes"
    echo ""
    log_info "Optional: Configure email notifications"
    echo "  export GITOPS_TO_EMAIL='admin@lakehouse.wtf'"
    echo "  echo '0 3 * * * $PRODUCTION_PATH/scripts/nightly-email-summary.sh' | crontab -"
    echo ""
    log_info "Logs: journalctl -u gitops-audit-api -f"
    echo ""
    log_success "Deployment successful! 🚀"
}

# Main deployment flow
main() {
    log_info "Starting GitOps Auditor v1.1.0 deployment"
    log_info "Target: $PRODUCTION_USER@$PRODUCTION_HOST"
    log_info "Mode: $([ "$DRY_RUN" == "true" ] && echo "DRY RUN" || echo "LIVE DEPLOYMENT")"
    echo ""
    
    check_prerequisites
    create_backup
    
    if [[ "$DRY_RUN" == "false" ]]; then
        read -p "Continue with live deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled by user"
            exit 0
        fi
    fi
    
    deploy_api
    deploy_dashboard
    deploy_scripts
    restart_services
    verify_deployment
    show_completion_message
}

# Execute main function
main "$@"
