#!/bin/bash
# GitOps Auditor v1.1.0 - Nightly Email Summary Script
# Sends automated email summaries of audit reports
# Usage: Run via cron for automated notifications

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AUDIT_API_URL="${GITOPS_API_URL:-http://localhost:3070}"
DEFAULT_EMAIL="${GITOPS_TO_EMAIL:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}📧 $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Check if email is configured
if [[ -z "$DEFAULT_EMAIL" ]]; then
    log_warning "No default email configured"
    log_info "Set GITOPS_TO_EMAIL environment variable to enable automated email summaries"
    log_info "Example: export GITOPS_TO_EMAIL='admin@lakehouse.wtf'"
    exit 0
fi

# Function to check if API is running
check_api_health() {
    if curl -s --max-time 5 "${AUDIT_API_URL}/audit" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to send email summary
send_email_summary() {
    local email_address="$1"
    
    log_info "Sending nightly audit summary to: $email_address"
    
    # Use curl to call the email API endpoint
    local response
    if response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email_address\"}" \
        "${AUDIT_API_URL}/audit/email-summary" 2>&1); then
        
        # Check if response contains success indicator
        if echo "$response" | grep -q "Email sent successfully"; then
            log_success "Email summary sent successfully"
            return 0
        else
            log_error "API returned error: $response"
            return 1
        fi
    else
        log_error "Failed to call email API: $response"
        return 1
    fi
}

# Function to generate fallback text summary (if email fails)
generate_text_summary() {
    local audit_file="$PROJECT_ROOT/audit-history/GitRepoReport.json"
    
    if [[ ! -f "$audit_file" ]]; then
        log_error "No audit data found at: $audit_file"
        return 1
    fi
    
    log_info "Generating text summary from: $audit_file"
    
    # Extract key metrics using jq (if available) or basic parsing
    if command -v jq >/dev/null 2>&1; then
        local timestamp health_status total_repos clean_repos dirty_repos missing_repos
        timestamp=$(jq -r '.timestamp' "$audit_file")
        health_status=$(jq -r '.health_status' "$audit_file")
        total_repos=$(jq -r '.summary.total' "$audit_file")
        clean_repos=$(jq -r '.summary.clean' "$audit_file")
        dirty_repos=$(jq -r '.summary.dirty' "$audit_file")
        missing_repos=$(jq -r '.summary.missing' "$audit_file")
        
        echo "🏠 GitOps Audit Summary - $(date)"
        echo "Timestamp: $timestamp"
        echo "Health Status: $health_status"
        echo "Total Repositories: $total_repos"
        echo "  Clean: $clean_repos"
        echo "  Dirty: $dirty_repos"
        echo "  Missing: $missing_repos"
        echo ""
        
        # List dirty repositories if any
        if [[ "$dirty_repos" -gt 0 ]]; then
            echo "🔄 Repositories with Uncommitted Changes:"
            jq -r '.repos[] | select(.status == "dirty" or .uncommittedChanges == true) | "  - " + .name' "$audit_file"
            echo ""
        fi
        
        # List missing repositories if any  
        if [[ "$missing_repos" -gt 0 ]]; then
            echo "❌ Missing Repositories:"
            jq -r '.repos[] | select(.status == "missing") | "  - " + .name' "$audit_file"
            echo ""
        fi
        
        echo "🌐 Dashboard: https://gitops.internal.lakehouse.wtf/"
        
    else
        log_warning "jq not available, using basic text summary"
        echo "🏠 GitOps Audit Summary - $(date)"
        echo "Audit data available at: $audit_file"
        echo "🌐 Dashboard: https://gitops.internal.lakehouse.wtf/"
    fi
}

# Main execution
main() {
    log_info "Starting nightly GitOps audit email summary"
    log_info "API URL: $AUDIT_API_URL"
    log_info "Default Email: $DEFAULT_EMAIL"
    
    # Check if API is running
    if ! check_api_health; then
        log_error "GitOps Audit API is not responding at: $AUDIT_API_URL"
        log_info "Attempting to generate fallback summary..."
        
        # Generate text summary and log it
        if summary_text=$(generate_text_summary); then
            echo "$summary_text"
            
            # Try to send via system mail if available
            if command -v mail >/dev/null 2>&1; then
                echo "$summary_text" | mail -s "[GitOps Audit] Nightly Summary (API Offline)" "$DEFAULT_EMAIL"
                log_success "Fallback text summary sent via system mail"
            else
                log_warning "System mail not available, summary logged only"
            fi
        else
            log_error "Failed to generate fallback summary"
        fi
        exit 1
    fi
    
    # Send email summary via API
    if send_email_summary "$DEFAULT_EMAIL"; then
        log_success "Nightly email summary completed successfully"
    else
        log_error "Failed to send email summary"
        
        # Try fallback method
        log_info "Attempting fallback text summary..."
        if summary_text=$(generate_text_summary); then
            echo "$summary_text"
        fi
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "GitOps Auditor v1.1.0 - Nightly Email Summary"
        echo "Usage: $0 [email_address]"
        echo ""
        echo "Options:"
        echo "  --help, -h    Show this help message"
        echo "  --test        Send test email to default address"
        echo ""
        echo "Environment Variables:"
        echo "  GITOPS_TO_EMAIL    Default recipient email address"
        echo "  GITOPS_API_URL     API server URL (default: http://localhost:3070)"
        echo ""
        echo "Examples:"
        echo "  $0                                    # Send to default email"
        echo "  $0 admin@example.com                 # Send to specific email"
        echo "  $0 --test                            # Send test email"
        echo ""
        exit 0
        ;;
    --test)
        log_info "Sending test email summary"
        if [[ -z "$DEFAULT_EMAIL" ]]; then
            log_error "No default email configured for testing"
            exit 1
        fi
        send_email_summary "$DEFAULT_EMAIL"
        exit $?
        ;;
    "")
        # No arguments - use default email
        main
        ;;
    *)
        # Email address provided as argument
        DEFAULT_EMAIL="$1"
        log_info "Using provided email address: $DEFAULT_EMAIL"
        main
        ;;
esac
