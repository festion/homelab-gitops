#!/bin/bash
# Weekly Environment Summary Generator
# Runs Monday 6 AM via cron on CT 128 (dev container)
# Collects data from Loki, Proxmox, GitHub Actions, Vikunja, and cron logs
# Outputs: HTML email + markdown committed to docs/weekly-summaries/

set -uo pipefail

# === Configuration ===
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOKI_URL="${LOKI_URL:-http://192.168.1.170:3100}"
PROXMOX_HOST="${PROXMOX_HOST:-192.168.1.137}"
PROXMOX2_HOST="${PROXMOX2_HOST:-192.168.1.125}"
VIKUNJA_URL="${VIKUNJA_URL:-http://192.168.1.143:3456}"
VIKUNJA_TOKEN="${VIKUNJA_TOKEN:-}"
EMAIL_TO="${GITOPS_TO_EMAIL:-jeremy.ames@outlook.com}"
GITHUB_OWNER="${GITHUB_OWNER:-festion}"
DRY_RUN=false

# Date range: previous Monday through Sunday
REPORT_DATE="$(date +%Y-%m-%d)"
WEEK_END="$(date -d 'last sunday' +%Y-%m-%d 2>/dev/null || date +%Y-%m-%d)"
WEEK_START="$(date -d "${WEEK_END} - 6 days" +%Y-%m-%d)"
LOKI_START_TS="$(date -d "${WEEK_START}" +%s)000000000"
LOKI_END_TS="$(date -d "${WEEK_END} + 1 day" +%s)000000000"

OUTPUT_DIR="$(mktemp -d)"
MARKDOWN_FILE="${PROJECT_ROOT}/docs/weekly-summaries/${REPORT_DATE}.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# Loki query helper (reused from loki-log-audit.sh pattern)
query_loki() {
    local query="$1"
    local limit="${2:-500}"
    curl -sG "${LOKI_URL}/loki/api/v1/query_range" \
        --data-urlencode "query=${query}" \
        --data-urlencode "limit=${limit}" \
        --data-urlencode "start=${LOKI_START_TS}" \
        --data-urlencode "end=${LOKI_END_TS}" \
        --max-time 30 2>/dev/null
}

# Count results from a Loki query
loki_count() {
    local query="$1"
    query_loki "$query" | jq -r '[.data.result[].values[]] | length' 2>/dev/null || echo "0"
}

# === Collector Functions (one per data source) ===

collect_environment_health() {
    log_info "Collecting environment health from Loki..."
    echo "## Environment Health" > "${OUTPUT_DIR}/01-health.md"
    echo "" >> "${OUTPUT_DIR}/01-health.md"
    echo "_Data collection not yet implemented_" >> "${OUTPUT_DIR}/01-health.md"
}

collect_infrastructure_status() {
    log_info "Collecting infrastructure status from Proxmox..."
    echo "## Infrastructure Status" > "${OUTPUT_DIR}/02-infra.md"
    echo "" >> "${OUTPUT_DIR}/02-infra.md"
    echo "_Data collection not yet implemented_" >> "${OUTPUT_DIR}/02-infra.md"
}

collect_automation_report() {
    log_info "Collecting automation run status..."
    echo "## Automation Report" > "${OUTPUT_DIR}/03-automation.md"
    echo "" >> "${OUTPUT_DIR}/03-automation.md"
    echo "_Data collection not yet implemented_" >> "${OUTPUT_DIR}/03-automation.md"
}

collect_cicd_summary() {
    log_info "Collecting CI/CD summary from GitHub..."
    echo "## CI/CD Summary" > "${OUTPUT_DIR}/04-cicd.md"
    echo "" >> "${OUTPUT_DIR}/04-cicd.md"
    echo "_Data collection not yet implemented_" >> "${OUTPUT_DIR}/04-cicd.md"
}

collect_outstanding_tasks() {
    log_info "Collecting outstanding tasks..."
    echo "## Outstanding Tasks" > "${OUTPUT_DIR}/05-tasks.md"
    echo "" >> "${OUTPUT_DIR}/05-tasks.md"
    echo "_Data collection not yet implemented_" >> "${OUTPUT_DIR}/05-tasks.md"
}

# === Assembly ===

assemble_markdown() {
    log_info "Assembling markdown report..."
    {
        echo "# Weekly Environment Summary — ${REPORT_DATE}"
        echo ""
        echo "**Period:** ${WEEK_START} to ${WEEK_END}"
        echo "**Generated:** $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        echo "---"
        echo ""
        # Concatenate all section files in order
        for section_file in "${OUTPUT_DIR}"/0*.md; do
            [[ -f "$section_file" ]] && cat "$section_file"
            echo ""
        done
    } > "${MARKDOWN_FILE}"
    log_success "Markdown report written to ${MARKDOWN_FILE}"
}

generate_html_email() {
    log_info "Generating HTML email..."
    echo "<html><body><pre>$(cat "${MARKDOWN_FILE}")</pre></body></html>"
}

send_email() {
    if [[ "$DRY_RUN" == true ]]; then
        log_info "[DRY RUN] Would send email to ${EMAIL_TO}"
        return 0
    fi
    local html_body
    html_body="$(generate_html_email)"
    echo "$html_body" | mail -s "Weekly Environment Summary — ${REPORT_DATE}" \
        -a "Content-Type: text/html" \
        "${EMAIL_TO}" 2>/dev/null
    if [[ $? -eq 0 ]]; then
        log_success "Email sent to ${EMAIL_TO}"
    else
        log_error "Failed to send email"
    fi
}

commit_report() {
    if [[ "$DRY_RUN" == true ]]; then
        log_info "[DRY RUN] Would commit and push report"
        return 0
    fi
    cd "${PROJECT_ROOT}" || return 1
    git add "docs/weekly-summaries/${REPORT_DATE}.md"
    git commit -m "docs: weekly summary ${REPORT_DATE}" 2>/dev/null
    git pushx 2>/dev/null || git push 2>/dev/null
    log_success "Report committed and pushed"
}

cleanup() {
    rm -rf "${OUTPUT_DIR}"
}
trap cleanup EXIT

# === Main ===

main() {
    log_info "=== Weekly Environment Summary ==="
    log_info "Period: ${WEEK_START} to ${WEEK_END}"
    log_info "Report date: ${REPORT_DATE}"

    # Load Vikunja token from Infisical if not set
    if [[ -z "$VIKUNJA_TOKEN" ]]; then
        VIKUNJA_TOKEN=$(cd "${PROJECT_ROOT}" && infisical secrets get VIKUNJA_API_TOKEN --env=prod --plain 2>/dev/null || echo "")
        [[ -z "$VIKUNJA_TOKEN" ]] && log_warning "Vikunja token not available — task section will be limited"
    fi

    # Collect data from all sources (each handles its own errors)
    collect_environment_health
    collect_infrastructure_status
    collect_automation_report
    collect_cicd_summary
    collect_outstanding_tasks

    # Assemble report
    assemble_markdown

    if [[ "$DRY_RUN" == true ]]; then
        echo ""
        echo "=== DRY RUN OUTPUT ==="
        cat "${MARKDOWN_FILE}"
        return 0
    fi

    # Deliver
    send_email
    commit_report

    log_success "=== Weekly summary complete ==="
}

# === CLI ===

case "${1:-}" in
    --help|-h)
        echo "Weekly Environment Summary Generator"
        echo "Usage: $0 [--dry-run] [--help]"
        echo ""
        echo "Options:"
        echo "  --dry-run    Generate report to stdout, skip email and git commit"
        echo "  --help       Show this help"
        echo ""
        echo "Environment Variables:"
        echo "  GITOPS_TO_EMAIL    Recipient email (default: jeremy.ames@outlook.com)"
        echo "  LOKI_URL           Loki endpoint (default: http://192.168.1.170:3100)"
        echo "  PROXMOX_HOST       Proxmox node 1 (default: 192.168.1.137)"
        echo "  PROXMOX2_HOST      Proxmox node 2 (default: 192.168.1.125)"
        echo "  VIKUNJA_URL        Vikunja API (default: http://192.168.1.143:3456)"
        echo "  VIKUNJA_TOKEN      Vikunja API token (or loaded from Infisical)"
        exit 0
        ;;
    --dry-run)
        DRY_RUN=true
        main
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1. Use --help for usage."
        exit 1
        ;;
esac
