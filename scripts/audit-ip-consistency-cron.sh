#!/bin/bash
#
# IP Consistency Audit - Cron Wrapper
#
# This script wraps the Python audit script for cron execution
# with proper logging and error handling.
#
# Cron entry (add to /opt/gitops container at 192.168.1.136):
# 0 4 * * * /opt/gitops/scripts/audit-ip-consistency-cron.sh
#

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="/opt/gitops/logs"
LOG_FILE="${LOG_DIR}/ip-audit.log"
REPORT_FILE="${REPO_DIR}/docs/IP_AUDIT_REPORT.md"
PYTHON_SCRIPT="${SCRIPT_DIR}/audit-ip-consistency.py"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Timestamp function
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

log() {
    echo "[$(timestamp)] $1" | tee -a "$LOG_FILE"
}

# Start execution
log "=========================================="
log "IP Consistency Audit - Starting"
log "=========================================="

# Check Python script exists
if [[ ! -f "$PYTHON_SCRIPT" ]]; then
    log "ERROR: Python script not found at $PYTHON_SCRIPT"
    exit 1
fi

# Check for required Python modules
if ! python3 -c "import yaml, requests" 2>/dev/null; then
    log "ERROR: Required Python modules (yaml, requests) not installed"
    log "Run: pip3 install pyyaml requests"
    exit 1
fi

# Run the audit
log "Running IP consistency audit..."
cd "$REPO_DIR"

if python3 "$PYTHON_SCRIPT" --output "$REPORT_FILE" 2>&1 | tee -a "$LOG_FILE"; then
    log "Audit completed successfully"

    # Check for issues in the report
    if grep -q "ERRORS.*[1-9]" "$REPORT_FILE" 2>/dev/null; then
        log "WARNING: IP mismatches detected - review report at $REPORT_FILE"
        exit 1
    elif grep -q "WARNINGS.*[1-9]" "$REPORT_FILE" 2>/dev/null; then
        log "INFO: Missing DHCP reservations found - review report"
        exit 0
    else
        log "All systems consistent - no issues found"
        exit 0
    fi
else
    log "ERROR: Audit script failed"
    exit 1
fi
