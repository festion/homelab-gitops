#!/bin/bash
set -euo pipefail

# ------------------------------------------------------------------
# Phase 2 Deployment Readiness Validation Script
# Validates all deployment components before production deployment
# ------------------------------------------------------------------

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
VALIDATION_LOG="/tmp/phase2-readiness-$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$VALIDATION_LOG"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$VALIDATION_LOG"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$VALIDATION_LOG"
}

test_header() {
    echo -e "${PURPLE}[$(date '+%Y-%m-%d %H:%M:%S')] VALIDATE:${NC} $1" | tee -a "$VALIDATION_LOG"
}

# Test function
validate() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    test_header "$test_name"
    
    if eval "$test_command" >> "$VALIDATION_LOG" 2>&1; then
        success "✅ $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        error "❌ $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "🔍 Phase 2 Deployment Readiness Validation"
echo "==========================================="
log "Starting deployment readiness validation"
log "Validation log: $VALIDATION_LOG"

cd "$PROJECT_ROOT"

# Core Requirements
echo ""
echo "📋 Core Requirements"
validate "Project structure" "test -f package.json && test -d api && test -d scripts"
validate "Git repository" "git rev-parse --git-dir > /dev/null"
validate "Node.js available" "command -v node"
validate "npm available" "command -v npm"
validate "PostgreSQL client" "command -v psql"

# Phase 2 Scripts
echo ""
echo "📜 Phase 2 Scripts"
REQUIRED_SCRIPTS=(
    "scripts/phase2/migrate-phase2.sh"
    "scripts/phase2/deploy-phase2-production.sh"
    "scripts/phase2/rollback-deployment.sh"
    "scripts/phase2/validate-phase2-deployment.sh"
    "scripts/phase2/setup-phase2-monitoring.sh"
    "scripts/phase2/orchestrate-phase2-deployment.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    validate "Script: $(basename $script)" "test -x $script"
done

# Script Syntax
echo ""
echo "✅ Script Syntax"
for script in "${REQUIRED_SCRIPTS[@]}"; do
    validate "Syntax: $(basename $script)" "bash -n $script"
done

# Documentation
echo ""
echo "📚 Documentation"
validate "Deployment guide" "test -f PHASE2-PRODUCTION-DEPLOYMENT.md"
validate "Pre-deployment checklist" "test -f scripts/phase2/pre-deployment-checklist.md"

# Dependencies
echo ""
echo "📦 Dependencies"
if [[ -f "api/package.json" ]]; then
    validate "API dependencies" "cd api && npm ls --depth=0 > /dev/null || npm install --dry-run"
fi

# Phase 2 Features
echo ""
echo "🚀 Phase 2 Features"
validate "Pipeline management code" "find api -name '*.js' -exec grep -l 'pipeline' {} \\; | head -1"
validate "WebSocket implementation" "find api -name '*.js' -exec grep -l 'socket.io\\|websocket' {} \\; | head -1"
validate "Compliance tracking" "find api -name '*.js' -exec grep -l 'compliance' {} \\; | head -1"

# Security
echo ""
echo "🔒 Security Validation"
validate "No hardcoded secrets" "! grep -r 'password.*=' scripts/phase2/ | grep -v 'test-.*-diagnostic'"
validate "Proper script permissions" "find scripts/phase2 -name '*.sh' -perm 755 | wc -l | grep -v '^0$'"

# Database Migration
echo ""
echo "🗄️ Database Migration"
validate "Migration script content" "grep -q 'CREATE TABLE' scripts/phase2/migrate-phase2.sh"
validate "Backup functionality" "grep -q 'pg_dump' scripts/phase2/migrate-phase2.sh"

# Monitoring
echo ""
echo "📊 Monitoring Setup"
validate "Prometheus configuration" "grep -q 'prometheus' scripts/phase2/setup-phase2-monitoring.sh"
validate "Alerting rules" "grep -q 'alert' scripts/phase2/setup-phase2-monitoring.sh"

# Dry Run Test
echo ""
echo "🏃 Dry Run Test"
validate "Orchestration dry run" "$SCRIPT_DIR/orchestrate-phase2-deployment.sh --dry-run"

# Summary
echo ""
echo "🎯 Validation Summary"
echo "===================="
echo "Total Checks: $TESTS_TOTAL"
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
echo "Success Rate: $(( TESTS_PASSED * 100 / TESTS_TOTAL ))%"
echo ""

if (( TESTS_FAILED == 0 )); then
    success "🎉 READY FOR PRODUCTION DEPLOYMENT!"
    echo ""
    echo "✅ All validation checks passed"
    echo "🚀 You can proceed with Phase 2 deployment:"
    echo "   ./scripts/phase2/orchestrate-phase2-deployment.sh"
    echo ""
    echo "📋 Pre-deployment checklist: scripts/phase2/pre-deployment-checklist.md"
    echo "📚 Full documentation: PHASE2-PRODUCTION-DEPLOYMENT.md"
    exit_code=0
elif (( TESTS_FAILED <= 2 )); then
    echo "⚠️  Minor issues detected - proceed with caution"
    echo ""
    echo "🔍 Review validation log: $VALIDATION_LOG"
    echo "🛠️  Address minor issues before deployment"
    exit_code=1
else
    error "❌ DEPLOYMENT NOT READY"
    echo ""
    echo "🚨 Critical issues detected"
    echo "🔧 Fix all issues before attempting deployment"
    echo "📋 Review validation log: $VALIDATION_LOG"
    exit_code=2
fi

echo ""
echo "📋 Validation Log: $VALIDATION_LOG"

exit $exit_code