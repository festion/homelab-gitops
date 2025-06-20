#!/bin/bash
# GitOps Auditor v1.1.0 - Feature Validation Script
# Tests all v1.1.0 features to ensure proper deployment
# Usage: ./validate-v1.1.0.sh [--production] [--local]

set -euo pipefail

# Configuration
API_URL="${GITOPS_API_URL:-http://localhost:3070}"
DASHBOARD_URL="${GITOPS_DASHBOARD_URL:-http://localhost:8080}"
PRODUCTION_HOST="${GITOPS_PROD_HOST:-192.168.1.58}"

# Parse arguments
TARGET="local"
if [[ "${1:-}" == "--production" ]]; then
    TARGET="production"
    API_URL="http://$PRODUCTION_HOST:3070"
    DASHBOARD_URL="http://$PRODUCTION_HOST:8080"
elif [[ "${1:-}" == "--local" ]]; then
    TARGET="local"
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}🧪 $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    ((TESTS_TOTAL++))
    log_info "Testing: $test_name"
    
    if response=$(eval "$test_command" 2>&1); then
        if echo "$response" | grep -q "$expected_pattern"; then
            log_success "PASS: $test_name"
            ((TESTS_PASSED++))
            return 0
        else
            log_error "FAIL: $test_name (unexpected response)"
            echo "Expected pattern: $expected_pattern"
            echo "Got: ${response:0:200}..."
            ((TESTS_FAILED++))
            return 1
        fi
    else
        log_error "FAIL: $test_name (command failed)"
        echo "Error: $response"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to test API endpoints
test_api_endpoints() {
    log_info "Testing API endpoints on $API_URL"
    
    # Test 1: Basic audit endpoint
    run_test "Basic audit endpoint" \
        "curl -s --max-time 10 '$API_URL/audit'" \
        '"health_status"'
    
    # Test 2: CSV export endpoint  
    run_test "CSV export endpoint" \
        "curl -s -I --max-time 10 '$API_URL/audit/export/csv'" \
        "Content-Type: text/csv"
    
    # Test 3: Email summary endpoint (structure test)
    run_test "Email summary endpoint structure" \
        "curl -s -X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\"}' --max-time 10 '$API_URL/audit/email-summary'" \
        "email"
        
    # Test 4: Diff endpoint
    run_test "Diff endpoint availability" \
        "curl -s -I --max-time 10 '$API_URL/audit/diff/test-repo'" \
        "HTTP"
}

# Function to test dashboard features
test_dashboard_features() {
    log_info "Testing dashboard features on $DASHBOARD_URL"
    
    # Test 1: Dashboard loads
    run_test "Dashboard loads successfully" \
        "curl -s --max-time 10 '$DASHBOARD_URL'" \
        "Vite.*React"
    
    # Test 2: Enhanced diff viewer component (check for React component)
    run_test "Enhanced diff component available" \
        "curl -s --max-time 10 '$DASHBOARD_URL/assets/index-' 2>/dev/null | head -1000" \
        "DiffViewer\|Enhanced.*Diff"
        
    # Test 3: CSV export functionality (check for download attributes)
    run_test "CSV export UI elements" \
        "curl -s --max-time 10 '$DASHBOARD_URL' | grep -A5 -B5 'export\|csv'" \
        "export\|csv"
}

# Function to test local files
test_local_files() {
    log_info "Testing local v1.1.0 files"
    
    local required_files=(
        "api/csv-export.js"
        "api/email-notifications.js"
        "dashboard/src/components/DiffViewer.tsx"
        "scripts/nightly-email-summary.sh"
        "DEPLOYMENT-v1.1.0.md"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_success "File exists: $file"
            ((TESTS_PASSED++))
        else
            log_error "File missing: $file"
            ((TESTS_FAILED++))
        fi
        ((TESTS_TOTAL++))
    done
    
    # Test file contents
    run_test "CSV export module contains required functions" \
        "grep -q 'generateAuditCSV\|handleCSVExport' api/csv-export.js" \
        ""
        
    run_test "Email module contains required functions" \
        "grep -q 'sendAuditSummary\|generateEmailHTML' api/email-notifications.js" \
        ""
        
    run_test "DiffViewer component is TypeScript React component" \
        "grep -q 'interface.*Props\|React\.FC' dashboard/src/components/DiffViewer.tsx" \
        ""
        
    run_test "Nightly email script is executable" \
        "test -x scripts/nightly-email-summary.sh" \
        ""
}

# Function to test email functionality (optional)
test_email_functionality() {
    log_info "Testing email functionality (optional)"
    
    # Only test if email is configured
    if [[ -n "${GITOPS_TO_EMAIL:-}" ]]; then
        log_info "Email configured for: $GITOPS_TO_EMAIL"
        
        # Test email script
        if ./scripts/nightly-email-summary.sh --test 2>&1 | grep -q "Email sent successfully\|summary"; then
            log_success "Email test completed"
            ((TESTS_PASSED++))
        else
            log_warning "Email test failed (this is optional)"
            ((TESTS_FAILED++))
        fi
        ((TESTS_TOTAL++))
    else
        log_info "Email not configured (GITOPS_TO_EMAIL not set) - skipping email tests"
    fi
}

# Function to check service status (production only)
test_service_status() {
    if [[ "$TARGET" == "production" ]]; then
        log_info "Testing production service status"
        
        run_test "GitOps API service is running" \
            "ssh root@$PRODUCTION_HOST 'systemctl is-active gitops-audit-api'" \
            "active"
            
        run_test "GitOps Dashboard service is running" \
            "ssh root@$PRODUCTION_HOST 'systemctl is-active gitops-dashboard'" \
            "active"
    fi
}

# Function to generate validation report
generate_report() {
    echo ""
    log_info "=== GitOps Auditor v1.1.0 Validation Report ==="
    echo ""
    echo "Target Environment: $TARGET"
    echo "API URL: $API_URL"
    echo "Dashboard URL: $DASHBOARD_URL"
    echo ""
    echo "Test Results:"
    echo "  Total Tests: $TESTS_TOTAL"
    echo "  Passed: $TESTS_PASSED"
    echo "  Failed: $TESTS_FAILED"
    echo "  Success Rate: $(( TESTS_PASSED * 100 / TESTS_TOTAL ))%"
    echo ""
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        log_success "🎉 All tests passed! v1.1.0 is ready for use."
        echo ""
        echo "✨ v1.1.0 Features Available:"
        echo "  📊 CSV Export: Click 'Export CSV' in dashboard"
        echo "  📧 Email Summaries: Enter email and click 'Email Summary'"
        echo "  🔍 Enhanced Diff Viewer: Click 'Enhanced Diff' for dirty repos"
        echo ""
        echo "🌐 Access your dashboard: https://gitops.internal.lakehouse.wtf/"
        return 0
    else
        log_error "❌ Some tests failed. Please review and fix issues before using v1.1.0."
        echo ""
        echo "Common fixes:"
        echo "  - Restart services: systemctl restart gitops-audit-api"
        echo "  - Check file permissions: ls -la api/ scripts/"
        echo "  - Verify API connectivity: curl $API_URL/audit"
        echo "  - Rebuild dashboard: cd dashboard && npm run build"
        return 1
    fi
}

# Main execution
main() {
    echo "🧪 GitOps Auditor v1.1.0 Feature Validation"
    echo "Target: $TARGET"
    echo "====================================="
    echo ""
    
    test_local_files
    test_api_endpoints  
    test_dashboard_features
    test_service_status
    test_email_functionality
    
    generate_report
}

# Help message
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    echo "GitOps Auditor v1.1.0 Feature Validation Script"
    echo ""
    echo "Usage: $0 [TARGET]"
    echo ""
    echo "Targets:"
    echo "  --local       Test local development environment (default)"
    echo "  --production  Test production environment at $PRODUCTION_HOST"
    echo ""
    echo "Environment Variables:"
    echo "  GITOPS_API_URL         Override API URL"
    echo "  GITOPS_DASHBOARD_URL   Override dashboard URL"
    echo "  GITOPS_PROD_HOST       Production server IP"
    echo "  GITOPS_TO_EMAIL        Email for testing email functionality"
    echo ""
    echo "Examples:"
    echo "  $0                    # Test local environment"
    echo "  $0 --production       # Test production environment"
    echo "  GITOPS_TO_EMAIL=admin@example.com $0  # Test with email"
    echo ""
    exit 0
fi

# Execute main function
main "$@"
