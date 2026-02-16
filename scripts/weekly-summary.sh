#!/bin/bash
# Weekly Environment Summary Generator
# Runs Monday 6 AM via cron on CT 128 (dev container)
# Collects data from Loki, Proxmox, GitHub Actions, Vikunja, and cron logs
# Outputs: HTML email + markdown committed to docs/weekly-summaries/

set -uo pipefail

# === Configuration ===
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Source .env file for secrets (VIKUNJA_API_TOKEN, etc.)
[[ -f "${PROJECT_ROOT}/.env" ]] && source "${PROJECT_ROOT}/.env"

LOKI_URL="${LOKI_URL:-http://192.168.1.170:3100}"
PROXMOX_HOST="${PROXMOX_HOST:-192.168.1.137}"
PROXMOX2_HOST="${PROXMOX2_HOST:-192.168.1.125}"
VIKUNJA_URL="${VIKUNJA_URL:-http://192.168.1.143:3456}"
VIKUNJA_TOKEN="${VIKUNJA_TOKEN:-${VIKUNJA_API_TOKEN:-}}"
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

    local critical=0 warnings=0 info=0
    local issues=()

    # --- Auth failures (PBS, Grafana, Vaultwarden) ---
    log_info "  Checking authentication failures..."
    local pbs_auth grafana_auth vault_auth auth_total
    pbs_auth=$(loki_count '{job="pbs"} |~ "authentication fail"')
    grafana_auth=$(loki_count '{job="grafana"} |~ "(?i)(unauthorized|permission denied)" |!~ "grafana_scheduler" |!~ "fromAlert=true" |!~ "rule_uid="')
    vault_auth=$(loki_count '{job="vaultwarden"} |~ "(?i)(failed|invalid|unauthorized)"')
    auth_total=$(( ${pbs_auth:-0} + ${grafana_auth:-0} + ${vault_auth:-0} ))

    if [[ $auth_total -gt 50 ]]; then
        issues+=("- **CRITICAL** Authentication failures: ${auth_total} (PBS: ${pbs_auth}, Grafana: ${grafana_auth}, Vaultwarden: ${vault_auth})")
        ((critical++))
    elif [[ $auth_total -gt 10 ]]; then
        issues+=("- **WARNING** Authentication failures: ${auth_total} (PBS: ${pbs_auth}, Grafana: ${grafana_auth}, Vaultwarden: ${vault_auth})")
        ((warnings++))
    elif [[ $auth_total -gt 0 ]]; then
        issues+=("- **INFO** Authentication failures: ${auth_total} (PBS: ${pbs_auth}, Grafana: ${grafana_auth}, Vaultwarden: ${vault_auth})")
        ((info++))
    fi

    # --- Traefik 5xx errors ---
    log_info "  Checking Traefik 5xx errors..."
    local traefik_5xx
    traefik_5xx=$(query_loki '{job="traefik"} |~ "\" 5[0-9]{2} "' | \
        jq -r '.data.result[].values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    traefik_5xx=${traefik_5xx:-0}

    if [[ $traefik_5xx -gt 100 ]]; then
        issues+=("- **CRITICAL** Traefik 5xx errors: ${traefik_5xx}")
        ((critical++))
    elif [[ $traefik_5xx -gt 20 ]]; then
        issues+=("- **WARNING** Traefik 5xx errors: ${traefik_5xx}")
        ((warnings++))
    elif [[ $traefik_5xx -gt 0 ]]; then
        issues+=("- **INFO** Traefik 5xx errors: ${traefik_5xx}")
        ((info++))
    fi

    # --- Service crashes ---
    log_info "  Checking service crashes..."
    local crash_count
    crash_count=$(loki_count '{job=~".+"} |~ "(?i)(segfault|panic|crash|killed signal|oom-killer)" |!~ "query=" |!~ "org_id=" |!~ "Restarting"')
    crash_count=${crash_count:-0}

    if [[ $crash_count -gt 0 ]]; then
        issues+=("- **CRITICAL** Service crash/panic events: ${crash_count}")
        ((critical++))
    fi

    # --- Resource exhaustion ---
    log_info "  Checking resource exhaustion..."
    local resource_count
    resource_count=$(query_loki '{job=~".+"} |~ "(?i)(out of memory|oom-killer|disk full|no space left)" |!~ "query=" |!~ "org_id="' | \
        jq -r '.data.result[] | select(.stream.job != "loki") | .values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    resource_count=${resource_count:-0}

    if [[ $resource_count -gt 0 ]]; then
        issues+=("- **CRITICAL** Resource exhaustion events: ${resource_count}")
        ((critical++))
    fi

    # --- PBS backup failures ---
    log_info "  Checking PBS backup status..."
    local pbs_errors
    pbs_errors=$(query_loki '{job="pbs"} |~ "TASK ERROR"' | \
        jq -r '.data.result[].values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    pbs_errors=${pbs_errors:-0}

    if [[ $pbs_errors -gt 0 ]]; then
        issues+=("- **CRITICAL** PBS backup task errors: ${pbs_errors}")
        ((critical++))
    fi

    # --- Certificate issues ---
    log_info "  Checking certificate issues..."
    local cert_count
    cert_count=$(query_loki '{job=~".+"} |~ "(?i)(certificate|ssl|tls).*(error|fail|expir|invalid)" |!~ "query=" |!~ "org_id="' | \
        jq -r '.data.result[] | select(.stream.job != "loki") | .values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    cert_count=${cert_count:-0}

    if [[ $cert_count -gt 0 ]]; then
        issues+=("- **WARNING** Certificate/TLS issues: ${cert_count}")
        ((warnings++))
    fi

    # --- DNS issues ---
    log_info "  Checking DNS issues..."
    local dns_count
    dns_count=$(query_loki '{job=~".+"} |~ "(?i)(dns|resolve).*(fail|error|timeout)" |!~ "query=" |!~ "org_id="' | \
        jq -r '.data.result[] | select(.stream.job != "loki") | .values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    dns_count=${dns_count:-0}

    if [[ $dns_count -gt 10 ]]; then
        issues+=("- **WARNING** DNS resolution issues: ${dns_count}")
        ((warnings++))
    fi

    # --- Determine overall health status ---
    local status="GREEN"
    if [[ $critical -gt 0 ]]; then
        status="RED"
    elif [[ $warnings -gt 0 ]]; then
        status="YELLOW"
    fi

    # Write health-status.txt for the HTML email generator
    echo "${status}" > "${OUTPUT_DIR}/health-status.txt"

    # Write the markdown section
    {
        echo "## Environment Health"
        echo ""
        echo "**Status:** ${status} | Critical: ${critical} | Warnings: ${warnings} | Info: ${info}"
        echo ""
        if [[ ${#issues[@]} -gt 0 ]]; then
            printf '%s\n' "${issues[@]}"
        else
            echo "All systems healthy. No significant issues detected."
        fi
    } > "${OUTPUT_DIR}/01-health.md"

    log_success "Environment health: ${status} (Critical: ${critical}, Warnings: ${warnings}, Info: ${info})"
}

collect_infrastructure_status() {
    log_info "Collecting infrastructure status from Proxmox..."
    local out="${OUTPUT_DIR}/02-infra.md"

    {
        echo "## Infrastructure Status"
        echo ""

        # Container/VM status from cluster resources (includes both nodes)
        local cluster_resources
        cluster_resources=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "root@${PROXMOX_HOST}" \
            "pvesh get /cluster/resources --type vm --output-format json" 2>/dev/null)

        if [[ -n "$cluster_resources" ]]; then
            local running stopped total
            running=$(echo "$cluster_resources" | jq '[.[] | select(.status=="running")] | length')
            stopped=$(echo "$cluster_resources" | jq '[.[] | select(.status=="stopped")] | length')
            total=$(echo "$cluster_resources" | jq 'length')
            echo "### Containers & VMs"
            echo ""
            echo "- **Total:** ${total} | **Running:** ${running} | **Stopped:** ${stopped}"
            echo ""

            # List stopped containers
            local stopped_list
            stopped_list=$(echo "$cluster_resources" | jq -r '.[] | select(.status=="stopped") | "- \(.name // "VMID \(.vmid)") (VMID \(.vmid), \(.node))"')
            if [[ -n "$stopped_list" ]]; then
                echo "**Stopped:**"
                echo "$stopped_list"
                echo ""
            fi
        else
            echo "### Containers & VMs"
            echo ""
            echo "_Could not reach Proxmox API_"
            echo ""
        fi

        # Storage usage from node
        local storage_status
        storage_status=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "root@${PROXMOX_HOST}" \
            "pvesh get /nodes/proxmox/storage --output-format json" 2>/dev/null)

        if [[ -n "$storage_status" ]]; then
            echo "### Storage"
            echo ""
            echo "| Storage | Used | Total | % Used |"
            echo "|---------|------|-------|--------|"
            echo "$storage_status" | jq -r '.[] | select(.total > 0) |
                "| \(.storage) | \((.used / 1073741824 * 10 | floor) / 10)G | \((.total / 1073741824 * 10 | floor) / 10)G | \((.used * 100 / .total) | floor)% |"' 2>/dev/null
            echo ""
        fi

        # Recent backup status (last 7 days)
        local backup_tasks
        backup_tasks=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "root@${PROXMOX_HOST}" \
            "pvesh get /nodes/proxmox/tasks --typefilter vzdump --limit 50 --output-format json" 2>/dev/null)

        if [[ -n "$backup_tasks" ]]; then
            local week_ago_ts
            week_ago_ts=$(date -d "${WEEK_START}" +%s)
            local backup_ok backup_fail
            backup_ok=$(echo "$backup_tasks" | jq "[.[] | select(.starttime >= ${week_ago_ts} and .status == \"OK\")] | length")
            backup_fail=$(echo "$backup_tasks" | jq "[.[] | select(.starttime >= ${week_ago_ts} and .status != \"OK\")] | length")
            echo "### Backups (past 7 days)"
            echo ""
            echo "- **Completed:** ${backup_ok} | **Failed:** ${backup_fail}"
            if [[ ${backup_fail:-0} -gt 0 ]]; then
                echo ""
                echo "**Failed backups:**"
                echo "$backup_tasks" | jq -r ".[] | select(.starttime >= ${week_ago_ts} and .status != \"OK\") |
                    \"- VMID \(.id // \"unknown\") on \(.node) — \(.status)\"" 2>/dev/null
            fi
            echo ""
        fi

    } > "$out"
    log_success "Infrastructure status collected"
}

collect_automation_report() {
    log_info "Collecting automation run status..."
    local out="${OUTPUT_DIR}/03-automation.md"

    {
        echo "## Automation Report"
        echo ""
        echo "| Job | Status | Notes |"
        echo "|-----|--------|-------|"

        # DNS Sync (runs daily at 3 AM)
        local dns_sync_count
        dns_sync_count=$(loki_count '{job=~".*"} |~ "gitops_dns_sync"')
        if [[ ${dns_sync_count:-0} -gt 0 ]]; then
            echo "| DNS Sync | OK | ${dns_sync_count} log entries this week |"
        else
            echo "| DNS Sync | UNKNOWN | No log entries found |"
        fi

        # Loki Audit (weekly)
        local loki_audit_count
        loki_audit_count=$(loki_count '{job=~".*"} |~ "loki-log-audit|loki-audit"')
        if [[ ${loki_audit_count:-0} -gt 0 ]]; then
            echo "| Loki Log Audit | OK | ${loki_audit_count} log entries this week |"
        else
            echo "| Loki Log Audit | UNKNOWN | No log entries found |"
        fi

        # Fluent Bit agents — count active jobs reporting to Loki
        local fluent_bit_jobs
        fluent_bit_jobs=$(curl -sG "${LOKI_URL}/loki/api/v1/label/job/values" \
            --data-urlencode "start=${LOKI_START_TS}" \
            --data-urlencode "end=${LOKI_END_TS}" \
            --max-time 10 2>/dev/null | jq -r '.data | length' 2>/dev/null || echo "0")
        echo "| Fluent Bit Agents | OK | ${fluent_bit_jobs} jobs reporting to Loki |"

        # Cron service health on this host
        if systemctl is-active --quiet cron 2>/dev/null; then
            echo "| Cron Service (CT 128) | OK | Running |"
        else
            echo "| Cron Service (CT 128) | FAILED | Not running |"
        fi

        echo ""
    } > "$out"
    log_success "Automation report collected"
}

collect_cicd_summary() {
    log_info "Collecting CI/CD summary from GitHub..."
    local out="${OUTPUT_DIR}/04-cicd.md"

    {
        echo "## CI/CD Summary"
        echo ""

        if ! command -v gh &>/dev/null; then
            echo "_GitHub CLI not available_"
        else
            local runs
            runs=$(gh run list --repo "${GITHUB_OWNER}/homelab-gitops" \
                --limit 100 \
                --json name,status,conclusion,createdAt 2>/dev/null)

            if [[ -z "$runs" || "$runs" == "[]" ]]; then
                echo "No workflow runs found this week."
            else
                local week_start_iso="${WEEK_START}T00:00:00Z"
                echo "| Workflow | Runs | Passed | Failed | Skipped |"
                echo "|----------|------|--------|--------|---------|"

                echo "$runs" | jq -r --arg since "$week_start_iso" '
                    [.[] | select(.createdAt >= $since)]
                    | group_by(.name)
                    | .[]
                    | {
                        name: .[0].name,
                        total: length,
                        success: [.[] | select(.conclusion == "success")] | length,
                        failure: [.[] | select(.conclusion == "failure")] | length,
                        skipped: [.[] | select(.conclusion == "skipped" or .conclusion == "cancelled")] | length
                      }
                    | "| \(.name) | \(.total) | \(.success) | \(.failure) | \(.skipped) |"
                ' 2>/dev/null

                echo ""

                # Show recent failures
                local failures
                failures=$(echo "$runs" | jq -r --arg since "$week_start_iso" '
                    [.[] | select(.createdAt >= $since and .conclusion == "failure")]
                    | sort_by(.createdAt) | reverse
                    | .[:5]
                    | .[]
                    | "- **\(.name)** — \(.createdAt | split("T")[0])"
                ' 2>/dev/null)

                if [[ -n "$failures" ]]; then
                    echo "**Recent Failures:**"
                    echo "$failures"
                    echo ""
                fi
            fi
        fi
    } > "$out"
    log_success "CI/CD summary collected"
}

collect_outstanding_tasks() {
    log_info "Collecting outstanding tasks..."
    local out="${OUTPUT_DIR}/05-tasks.md"

    {
        echo "## Outstanding Tasks"
        echo ""

        # GitHub Issues across homelab repos
        echo "### GitHub Issues"
        echo ""
        if command -v gh &>/dev/null; then
            local issues
            issues=$(gh search issues --owner "${GITHUB_OWNER}" --state open \
                --json repository,title,number,updatedAt \
                --limit 50 2>/dev/null)

            if [[ -n "$issues" && "$issues" != "[]" ]]; then
                local issue_count
                issue_count=$(echo "$issues" | jq 'length')
                echo "**${issue_count} open issues**"
                echo ""
                echo "$issues" | jq -r '
                    sort_by(.updatedAt) | reverse
                    | .[:20]
                    | .[]
                    | "- **\(.repository.name)#\(.number):** \(.title)"
                ' 2>/dev/null
            else
                echo "No open issues found."
            fi
        else
            echo "_GitHub CLI not available_"
        fi

        echo ""

        # Vikunja tasks (v1.0.0 API: /api/v1/tasks)
        echo "### Vikunja Tasks"
        echo ""
        if [[ -n "$VIKUNJA_TOKEN" ]]; then
            local tasks
            tasks=$(curl -s --max-time 10 \
                "${VIKUNJA_URL}/api/v1/tasks?per_page=50&sort_by=due_date&order_by=asc" \
                -H "Authorization: Bearer ${VIKUNJA_TOKEN}" 2>/dev/null)

            if [[ -n "$tasks" ]] && echo "$tasks" | jq -e '.[0]' &>/dev/null; then
                # Filter to undone tasks
                local open_tasks
                open_tasks=$(echo "$tasks" | jq '[.[] | select(.done == false)]')
                local task_count
                task_count=$(echo "$open_tasks" | jq 'length' 2>/dev/null || echo "0")
                echo "**${task_count} open tasks**"
                echo ""
                echo "$open_tasks" | jq -r '
                    .[:20]
                    | .[]
                    | "- \(.title)" + (if .due_date and .due_date != "0001-01-01T00:00:00Z" then " (due: \(.due_date | split("T")[0]))" else "" end)
                ' 2>/dev/null
            else
                echo "No open tasks found (or API error)."
            fi
        else
            echo "_Vikunja token not configured — set VIKUNJA_API_TOKEN in .env_"
        fi

        echo ""
    } > "$out"
    log_success "Outstanding tasks collected"
}

# === Assembly ===

assemble_markdown() {
    log_info "Assembling markdown report..."
    {
        # Read health status from collector
        local health="GREEN"
        [[ -f "${OUTPUT_DIR}/health-status.txt" ]] && health=$(cat "${OUTPUT_DIR}/health-status.txt")

        echo "# Weekly Environment Summary — ${REPORT_DATE}"
        echo ""
        echo "**Period:** ${WEEK_START} to ${WEEK_END}"
        echo "**Generated:** $(date '+%Y-%m-%d %H:%M:%S')"
        echo "**Overall Health:** ${health}"
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
    local health="GREEN"
    [[ -f "${OUTPUT_DIR}/health-status.txt" ]] && health=$(cat "${OUTPUT_DIR}/health-status.txt")

    local health_color="#22c55e"
    local health_label="HEALTHY"
    case "$health" in
        YELLOW) health_color="#eab308"; health_label="WARNINGS" ;;
        RED)    health_color="#ef4444"; health_label="CRITICAL" ;;
    esac

    # Convert markdown to simple HTML
    local body_html
    body_html=$(sed \
        -e 's/^# \(.*\)/<h1 style="font-size:22px;margin:0;">\1<\/h1>/' \
        -e 's/^## \(.*\)/<h2 style="font-size:18px;margin:20px 0 8px 0;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">\1<\/h2>/' \
        -e 's/^### \(.*\)/<h3 style="font-size:15px;margin:16px 0 6px 0;">\1<\/h3>/' \
        -e 's/^- \(.*\)/<li style="margin:2px 0;">\1<\/li>/' \
        -e 's/\*\*\([^*]*\)\*\*/<strong>\1<\/strong>/g' \
        -e 's/^---$/<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">/' \
        -e '/^$/s/^$/<br>/' \
        "${MARKDOWN_FILE}" | \
        sed '/^|/{ s/^| /<tr><td style="padding:4px 8px;border:1px solid #e5e7eb;">/; s/ | /<\/td><td style="padding:4px 8px;border:1px solid #e5e7eb;">/g; s/ |$/<\/td><\/tr>/; }')

    cat <<HTMLEOF
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:700px;margin:0 auto;padding:20px;color:#1a1a1a;background:#f8f9fa;">
  <div style="background:white;border-radius:8px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:22px;">Weekly Environment Summary</h1>
      <p style="color:#666;margin:4px 0;">${WEEK_START} to ${WEEK_END}</p>
      <div style="display:inline-block;background:${health_color};color:white;padding:6px 16px;border-radius:20px;font-weight:bold;font-size:14px;margin-top:8px;">
        ${health_label}
      </div>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
    <div style="font-size:14px;line-height:1.6;">
${body_html}
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
    <div style="text-align:center;font-size:12px;color:#999;">
      <a href="https://gitops.internal.lakehouse.wtf/" style="color:#3b82f6;">GitOps Dashboard</a> |
      <a href="https://grafana.internal.lakehouse.wtf/" style="color:#3b82f6;">Grafana</a> |
      <a href="https://todo.internal.lakehouse.wtf/" style="color:#3b82f6;">Vikunja</a>
    </div>
  </div>
</body>
</html>
HTMLEOF
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

    # Check Vikunja token (loaded from .env at script start)
    [[ -z "$VIKUNJA_TOKEN" ]] && log_warning "Vikunja token not available — set VIKUNJA_API_TOKEN in .env"

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
        echo "  VIKUNJA_TOKEN      Vikunja API token (or VIKUNJA_API_TOKEN from .env)"
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
