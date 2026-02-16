# Weekly Monday Morning Summary — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** A single bash script that collects data from 5 sources (Loki, Proxmox, cron logs, GitHub Actions, Vikunja) and generates a Monday morning environment summary delivered via HTML email and committed as markdown.

**Architecture:** Single `scripts/weekly-summary.sh` with isolated collector functions per data source. Each function writes its section to a temp file. An assembler combines sections into markdown, converts to HTML, sends email, and commits the markdown file.

**Tech Stack:** Bash, curl, jq, ssh, gh CLI, GNU mail

---

### Task 1: Create Vikunja API Token

This is a prerequisite — the script needs a Vikunja API token stored in Infisical.

**Step 1: Generate a Vikunja API token**

Go to https://todo.internal.lakehouse.wtf/ → Settings → API Tokens → Create a token named `weekly-summary-readonly`.

Alternatively, use the API directly:
```bash
# Get a JWT first (login with your credentials)
curl -s -X POST http://192.168.1.143:3456/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"<your-user>","password":"<your-pass>"}' | jq -r '.token'

# Then create an API token
curl -s -X POST http://192.168.1.143:3456/api/v1/tokens \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title":"weekly-summary-readonly"}' | jq -r '.token'
```

**Step 2: Store token in Infisical**

```bash
cd /home/dev/workspace
infisical secrets set VIKUNJA_API_TOKEN=<token> --env=prod
```

**Step 3: Verify retrieval**

```bash
cd /home/dev/workspace
TOKEN=$(infisical secrets get VIKUNJA_API_TOKEN --env=prod --plain)
curl -s "http://192.168.1.143:3456/api/v1/tasks/all?page=1&per_page=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.[].title'
```

Expected: List of task titles.

**Step 4: Commit** — nothing to commit yet, this is config.

---

### Task 2: Script Skeleton + CLI Interface

**Files:**
- Create: `scripts/weekly-summary.sh`
- Create: `docs/weekly-summaries/.gitkeep`

**Step 1: Create the output directory**

```bash
mkdir -p /home/dev/workspace/homelab-gitops/docs/weekly-summaries
touch /home/dev/workspace/homelab-gitops/docs/weekly-summaries/.gitkeep
```

**Step 2: Write the script skeleton**

Create `scripts/weekly-summary.sh` with:

```bash
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
    # Placeholder — implemented in Task 3
    echo "## Environment Health" > "${OUTPUT_DIR}/01-health.md"
    echo "_Data collection not yet implemented_" >> "${OUTPUT_DIR}/01-health.md"
}

collect_infrastructure_status() {
    log_info "Collecting infrastructure status from Proxmox..."
    # Placeholder — implemented in Task 4
    echo "## Infrastructure Status" > "${OUTPUT_DIR}/02-infra.md"
    echo "_Data collection not yet implemented_" >> "${OUTPUT_DIR}/02-infra.md"
}

collect_automation_report() {
    log_info "Collecting automation run status..."
    # Placeholder — implemented in Task 5
    echo "## Automation Report" > "${OUTPUT_DIR}/03-automation.md"
    echo "_Data collection not yet implemented_" >> "${OUTPUT_DIR}/03-automation.md"
}

collect_cicd_summary() {
    log_info "Collecting CI/CD summary from GitHub..."
    # Placeholder — implemented in Task 6
    echo "## CI/CD Summary" > "${OUTPUT_DIR}/04-cicd.md"
    echo "_Data collection not yet implemented_" >> "${OUTPUT_DIR}/04-cicd.md"
}

collect_outstanding_tasks() {
    log_info "Collecting outstanding tasks..."
    # Placeholder — implemented in Task 7
    echo "## Outstanding Tasks" > "${OUTPUT_DIR}/05-tasks.md"
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
        # Overall health computed in Task 8
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
    # Placeholder — implemented in Task 8
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
```

**Step 3: Make executable and verify skeleton runs**

```bash
chmod +x /home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh
/home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh --dry-run
```

Expected: Script runs, prints placeholder sections, no errors.

**Step 4: Commit**

```bash
cd /home/dev/workspace/homelab-gitops
git add scripts/weekly-summary.sh docs/weekly-summaries/.gitkeep
git commit -m "feat: add weekly-summary script skeleton with CLI interface"
```

---

### Task 3: Environment Health Collector (Loki)

**Files:**
- Modify: `scripts/weekly-summary.sh` — replace `collect_environment_health()` placeholder

**Step 1: Implement the collector function**

Replace the `collect_environment_health()` function body with:

```bash
collect_environment_health() {
    log_info "Collecting environment health from Loki..."
    local out="${OUTPUT_DIR}/01-health.md"
    local critical=0 warning=0 info=0
    local details=""

    # Auth failures
    local pbs_auth grafana_auth vault_auth
    pbs_auth=$(loki_count '{job="pbs"} |~ "authentication fail"')
    grafana_auth=$(loki_count '{job="grafana"} |~ "(?i)(unauthorized|permission denied)" |!~ "grafana_scheduler" |!~ "fromAlert=true" |!~ "rule_uid="')
    vault_auth=$(loki_count '{job="vaultwarden"} |~ "(?i)(failed|invalid|unauthorized)"')
    local total_auth=$(( pbs_auth + grafana_auth + vault_auth ))
    if [[ $total_auth -gt 50 ]]; then
        ((critical++))
        details+="- **CRITICAL** Authentication failures: PBS=${pbs_auth}, Grafana=${grafana_auth}, Vaultwarden=${vault_auth}\n"
    elif [[ $total_auth -gt 10 ]]; then
        ((warning++))
        details+="- **WARNING** Authentication failures: PBS=${pbs_auth}, Grafana=${grafana_auth}, Vaultwarden=${vault_auth}\n"
    elif [[ $total_auth -gt 0 ]]; then
        ((info++))
        details+="- Auth failures: PBS=${pbs_auth}, Grafana=${grafana_auth}, Vaultwarden=${vault_auth}\n"
    fi

    # Traefik 5xx errors
    local traefik_5xx
    traefik_5xx=$(query_loki '{job="traefik"} |~ "\" 5[0-9]{2} "' | \
        jq -r '.data.result[].values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    if [[ $traefik_5xx -gt 100 ]]; then
        ((critical++))
        details+="- **CRITICAL** Traefik 5xx errors: ${traefik_5xx}\n"
    elif [[ $traefik_5xx -gt 20 ]]; then
        ((warning++))
        details+="- **WARNING** Traefik 5xx errors: ${traefik_5xx}\n"
    elif [[ $traefik_5xx -gt 0 ]]; then
        ((info++))
        details+="- Traefik 5xx errors: ${traefik_5xx}\n"
    fi

    # Service crashes
    local crashes
    crashes=$(loki_count '{job=~".+"} |~ "(?i)(segfault|panic|crash|killed signal|oom-killer)" |!~ "query=" |!~ "org_id=" |!~ "Restarting"')
    if [[ $crashes -gt 0 ]]; then
        ((critical++))
        details+="- **CRITICAL** Service crash/panic events: ${crashes}\n"
    fi

    # Resource exhaustion
    local resource_issues
    resource_issues=$(loki_count '{job=~".+"} |~ "(?i)(out of memory|oom-killer|disk full|no space left)" |!~ "query=" |!~ "org_id="')
    if [[ $resource_issues -gt 0 ]]; then
        ((critical++))
        details+="- **CRITICAL** Resource exhaustion events: ${resource_issues}\n"
    fi

    # PBS backup failures
    local pbs_errors
    pbs_errors=$(loki_count '{job="pbs"} |~ "TASK ERROR"')
    if [[ $pbs_errors -gt 0 ]]; then
        ((critical++))
        details+="- **CRITICAL** PBS backup task errors: ${pbs_errors}\n"
    fi

    # Certificate issues
    local cert_issues
    cert_issues=$(loki_count '{job=~".+"} |~ "(?i)(certificate|ssl|tls).*(error|fail|expir|invalid)" |!~ "query=" |!~ "org_id="')
    if [[ $cert_issues -gt 0 ]]; then
        ((warning++))
        details+="- **WARNING** SSL/TLS certificate issues: ${cert_issues}\n"
    fi

    # DNS issues
    local dns_issues
    dns_issues=$(loki_count '{job=~".+"} |~ "(?i)(dns|resolve).*(fail|error|timeout)" |!~ "query=" |!~ "org_id="')
    if [[ $dns_issues -gt 10 ]]; then
        ((warning++))
        details+="- **WARNING** DNS resolution issues: ${dns_issues}\n"
    fi

    # Determine overall health
    local health="GREEN"
    [[ $warning -gt 0 ]] && health="YELLOW"
    [[ $critical -gt 0 ]] && health="RED"

    # Store health for overall report header
    echo "$health" > "${OUTPUT_DIR}/health-status.txt"

    {
        echo "## Environment Health"
        echo ""
        echo "**Status:** ${health} | Critical: ${critical} | Warnings: ${warning} | Info: ${info}"
        echo ""
        if [[ -n "$details" ]]; then
            echo -e "$details"
        else
            echo "All systems healthy. No significant issues detected."
        fi
    } > "$out"
    log_success "Environment health: ${health} (C:${critical} W:${warning} I:${info})"
}
```

**Step 2: Test the collector**

```bash
/home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh --dry-run 2>&1 | head -30
```

Expected: Environment Health section shows real data from Loki.

**Step 3: Commit**

```bash
cd /home/dev/workspace/homelab-gitops
git add scripts/weekly-summary.sh
git commit -m "feat(weekly-summary): implement Loki environment health collector"
```

---

### Task 4: Infrastructure Status Collector (Proxmox)

**Files:**
- Modify: `scripts/weekly-summary.sh` — replace `collect_infrastructure_status()` placeholder

**Step 1: Implement the collector function**

Replace `collect_infrastructure_status()` with:

```bash
collect_infrastructure_status() {
    log_info "Collecting infrastructure status from Proxmox..."
    local out="${OUTPUT_DIR}/02-infra.md"

    {
        echo "## Infrastructure Status"
        echo ""

        # Container status from both nodes
        local node1_cts node2_cts
        node1_cts=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "root@${PROXMOX_HOST}" \
            "pvesh get /cluster/resources --type vm --output-format json" 2>/dev/null)
        node2_cts="" # proxmox2 data is included in cluster resources from node1

        if [[ -n "$node1_cts" ]]; then
            local running stopped total
            running=$(echo "$node1_cts" | jq '[.[] | select(.status=="running")] | length')
            stopped=$(echo "$node1_cts" | jq '[.[] | select(.status=="stopped")] | length')
            total=$(echo "$node1_cts" | jq 'length')
            echo "### Containers & VMs"
            echo ""
            echo "- **Total:** ${total} | **Running:** ${running} | **Stopped:** ${stopped}"
            echo ""

            # List stopped containers (these need attention)
            local stopped_list
            stopped_list=$(echo "$node1_cts" | jq -r '.[] | select(.status=="stopped") | "- \(.name // "VMID \(.vmid)") (VMID \(.vmid), \(.node))"')
            if [[ -n "$stopped_list" ]]; then
                echo "**Stopped:**"
                echo "$stopped_list"
                echo ""
            fi
        else
            echo "### Containers & VMs"
            echo ""
            echo "_Data unavailable — could not reach Proxmox API_"
            echo ""
        fi

        # Storage pool health
        local pools
        pools=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "root@${PROXMOX_HOST}" \
            "pvesh get /storage --output-format json" 2>/dev/null)

        if [[ -n "$pools" ]]; then
            echo "### Storage"
            echo ""
            # Get usage from node status
            local storage_status
            storage_status=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "root@${PROXMOX_HOST}" \
                "pvesh get /nodes/proxmox/storage --output-format json" 2>/dev/null)
            if [[ -n "$storage_status" ]]; then
                echo "| Storage | Used | Total | % Used |"
                echo "|---------|------|-------|--------|"
                echo "$storage_status" | jq -r '.[] | select(.total > 0) |
                    "| \(.storage) | \((.used / 1073741824 * 10 | floor) / 10)G | \((.total / 1073741824 * 10 | floor) / 10)G | \((.used * 100 / .total) | floor)% |"' 2>/dev/null
                echo ""
            fi
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
```

**Step 2: Test**

```bash
/home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh --dry-run 2>&1 | grep -A 20 "Infrastructure Status"
```

Expected: Container counts, storage table, backup stats from Proxmox.

**Step 3: Commit**

```bash
cd /home/dev/workspace/homelab-gitops
git add scripts/weekly-summary.sh
git commit -m "feat(weekly-summary): implement Proxmox infrastructure status collector"
```

---

### Task 5: Automation Report Collector (Loki + Cron)

**Files:**
- Modify: `scripts/weekly-summary.sh` — replace `collect_automation_report()` placeholder

**Step 1: Implement the collector function**

Replace `collect_automation_report()` with:

```bash
collect_automation_report() {
    log_info "Collecting automation run status..."
    local out="${OUTPUT_DIR}/03-automation.md"

    {
        echo "## Automation Report"
        echo ""
        echo "| Job | Status | Notes |"
        echo "|-----|--------|-------|"

        # Check each known automation via Loki logs
        # DNS Sync (runs daily at 3 AM)
        local dns_sync_count
        dns_sync_count=$(loki_count '{job=~".*"} |~ "gitops_dns_sync"')
        if [[ $dns_sync_count -gt 0 ]]; then
            echo "| DNS Sync | OK | ${dns_sync_count} log entries this week |"
        else
            echo "| DNS Sync | UNKNOWN | No log entries found |"
        fi

        # Loki Audit (weekly)
        local loki_audit_count
        loki_audit_count=$(loki_count '{job=~".*"} |~ "loki-log-audit\\|loki-audit"')
        if [[ $loki_audit_count -gt 0 ]]; then
            echo "| Loki Log Audit | OK | ${loki_audit_count} log entries this week |"
        else
            echo "| Loki Log Audit | UNKNOWN | No log entries found |"
        fi

        # Fluent Bit agents — check if agents are reporting
        local fluent_bit_jobs
        fluent_bit_jobs=$(curl -sG "${LOKI_URL}/loki/api/v1/label/job/values" \
            --data-urlencode "start=${LOKI_START_TS}" \
            --data-urlencode "end=${LOKI_END_TS}" \
            --max-time 10 2>/dev/null | jq -r '.data | length' 2>/dev/null || echo "0")
        echo "| Fluent Bit Agents | OK | ${fluent_bit_jobs} jobs reporting to Loki |"

        # Cron service health (check if cron is running on this host)
        if systemctl is-active --quiet cron 2>/dev/null; then
            echo "| Cron Service (CT 128) | OK | Running |"
        else
            echo "| Cron Service (CT 128) | FAILED | Not running |"
        fi

        echo ""
    } > "$out"
    log_success "Automation report collected"
}
```

**Step 2: Test**

```bash
/home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh --dry-run 2>&1 | grep -A 15 "Automation Report"
```

Expected: Table with job statuses.

**Step 3: Commit**

```bash
cd /home/dev/workspace/homelab-gitops
git add scripts/weekly-summary.sh
git commit -m "feat(weekly-summary): implement automation report collector"
```

---

### Task 6: CI/CD Summary Collector (GitHub)

**Files:**
- Modify: `scripts/weekly-summary.sh` — replace `collect_cicd_summary()` placeholder

**Step 1: Implement the collector function**

Replace `collect_cicd_summary()` with:

```bash
collect_cicd_summary() {
    log_info "Collecting CI/CD summary from GitHub..."
    local out="${OUTPUT_DIR}/04-cicd.md"

    {
        echo "## CI/CD Summary"
        echo ""

        if ! command -v gh &>/dev/null; then
            echo "_GitHub CLI not available_"
            return
        fi

        # Get workflow runs from the past week
        local runs
        runs=$(gh run list --repo "${GITHUB_OWNER}/homelab-gitops" \
            --limit 100 \
            --json name,status,conclusion,createdAt 2>/dev/null)

        if [[ -z "$runs" || "$runs" == "[]" ]]; then
            echo "No workflow runs found this week."
            return
        fi

        # Filter to this week and aggregate by workflow name
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

        # Show recent failures with details
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

    } > "$out"
    log_success "CI/CD summary collected"
}
```

**Step 2: Test**

```bash
/home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh --dry-run 2>&1 | grep -A 20 "CI/CD Summary"
```

Expected: Table of workflow runs with pass/fail counts.

**Step 3: Commit**

```bash
cd /home/dev/workspace/homelab-gitops
git add scripts/weekly-summary.sh
git commit -m "feat(weekly-summary): implement GitHub CI/CD summary collector"
```

---

### Task 7: Outstanding Tasks Collector (GitHub Issues + Vikunja)

**Files:**
- Modify: `scripts/weekly-summary.sh` — replace `collect_outstanding_tasks()` placeholder

**Step 1: Implement the collector function**

Replace `collect_outstanding_tasks()` with:

```bash
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

        # Vikunja tasks
        echo "### Vikunja Tasks"
        echo ""

        if [[ -n "$VIKUNJA_TOKEN" ]]; then
            local tasks
            tasks=$(curl -s --max-time 10 \
                "${VIKUNJA_URL}/api/v1/tasks/all?page=1&per_page=50&filter=done%20%3D%20false&sort_by=due_date&order_by=asc" \
                -H "Authorization: Bearer ${VIKUNJA_TOKEN}" 2>/dev/null)

            if [[ -n "$tasks" && "$tasks" != "[]" && "$tasks" != *"message"* ]]; then
                local task_count
                task_count=$(echo "$tasks" | jq 'length' 2>/dev/null || echo "0")
                echo "**${task_count} open tasks**"
                echo ""
                echo "$tasks" | jq -r '
                    .[:20]
                    | .[]
                    | "- \(.title)" + (if .due_date and .due_date != "0001-01-01T00:00:00Z" then " (due: \(.due_date | split("T")[0]))" else "" end)
                ' 2>/dev/null
            else
                echo "No open tasks found (or API error)."
            fi
        else
            echo "_Vikunja token not configured — skipping_"
        fi

        echo ""
    } > "$out"
    log_success "Outstanding tasks collected"
}
```

**Step 2: Test**

```bash
/home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh --dry-run 2>&1 | grep -A 30 "Outstanding Tasks"
```

Expected: GitHub issues list + Vikunja tasks (or "token not configured" if Task 1 not done yet).

**Step 3: Commit**

```bash
cd /home/dev/workspace/homelab-gitops
git add scripts/weekly-summary.sh
git commit -m "feat(weekly-summary): implement GitHub issues + Vikunja tasks collector"
```

---

### Task 8: HTML Email Generation + Overall Health Badge

**Files:**
- Modify: `scripts/weekly-summary.sh` — implement `generate_html_email()` and update `assemble_markdown()` for health badge

**Step 1: Update `assemble_markdown()` to include overall health**

In the `assemble_markdown()` function, after the "Generated" line, add:

```bash
        # Read health status from collector
        local health="GREEN"
        [[ -f "${OUTPUT_DIR}/health-status.txt" ]] && health=$(cat "${OUTPUT_DIR}/health-status.txt")
        echo "**Overall Health:** ${health}"
```

**Step 2: Implement `generate_html_email()`**

Replace the placeholder `generate_html_email()` with:

```bash
generate_html_email() {
    local health="GREEN"
    [[ -f "${OUTPUT_DIR}/health-status.txt" ]] && health=$(cat "${OUTPUT_DIR}/health-status.txt")

    local health_color="#22c55e"
    local health_label="HEALTHY"
    case "$health" in
        YELLOW) health_color="#eab308"; health_label="WARNINGS" ;;
        RED)    health_color="#ef4444"; health_label="CRITICAL" ;;
    esac

    # Convert markdown to simple HTML (tables, headers, lists)
    local body_html
    body_html=$(sed \
        -e 's/^# \(.*\)/<h1>\1<\/h1>/' \
        -e 's/^## \(.*\)/<h2>\1<\/h2>/' \
        -e 's/^### \(.*\)/<h3>\1<\/h3>/' \
        -e 's/^\*\*\(.*\)\*\*$/<strong>\1<\/strong>/' \
        -e 's/^- \(.*\)/<li>\1<\/li>/' \
        -e 's/\*\*\([^*]*\)\*\*/<strong>\1<\/strong>/g' \
        -e '/^|/!b' \
        -e 's/^| /<tr><td>/; s/ | /<\/td><td>/g; s/ |$/<\/td><\/tr>/' \
        "${MARKDOWN_FILE}")

    cat <<HTMLEOF
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #1a1a1a; background: #f8f9fa;">
  <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="margin: 0; font-size: 22px;">Weekly Environment Summary</h1>
      <p style="color: #666; margin: 4px 0;">${WEEK_START} to ${WEEK_END}</p>
      <div style="display: inline-block; background: ${health_color}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-top: 8px;">
        ${health_label}
      </div>
    </div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <div style="font-size: 14px; line-height: 1.6;">
      ${body_html}
    </div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <div style="text-align: center; font-size: 12px; color: #999;">
      <a href="https://gitops.internal.lakehouse.wtf/" style="color: #3b82f6;">GitOps Dashboard</a> |
      <a href="https://grafana.internal.lakehouse.wtf/" style="color: #3b82f6;">Grafana</a> |
      <a href="https://todo.internal.lakehouse.wtf/" style="color: #3b82f6;">Vikunja</a>
    </div>
  </div>
</body>
</html>
HTMLEOF
}
```

**Step 3: Test full dry run**

```bash
/home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh --dry-run 2>&1
```

Expected: Full markdown report with all sections, health badge, and real data.

**Step 4: Commit**

```bash
cd /home/dev/workspace/homelab-gitops
git add scripts/weekly-summary.sh
git commit -m "feat(weekly-summary): implement HTML email generation and overall health badge"
```

---

### Task 9: Cron Setup + End-to-End Test

**Step 1: Test email sending manually**

```bash
echo "<html><body><h1>Test</h1><p>Weekly summary email test</p></body></html>" | \
    mail -s "Weekly Summary Test" -a "Content-Type: text/html" jeremy.ames@outlook.com
```

Check inbox. If email doesn't arrive, investigate mail setup (may need msmtp configured).

**Step 2: Run full script (not dry-run)**

```bash
/home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh
```

Expected: Email arrives, `docs/weekly-summaries/YYYY-MM-DD.md` committed and pushed.

**Step 3: Install cron entry**

```bash
(crontab -l 2>/dev/null; echo "0 6 * * 1 /home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh >> /var/log/weekly-summary.log 2>&1") | crontab -
```

**Step 4: Verify cron entry**

```bash
crontab -l | grep weekly-summary
```

Expected: `0 6 * * 1 /home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh >> /var/log/weekly-summary.log 2>&1`

**Step 5: Add cron schedule to repo documentation**

Update `cron/gitops-schedule` to include the new entry:

Add this line:
```
# Weekly environment summary (Monday 6 AM)
0 6 * * 1 /home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh >> /var/log/weekly-summary.log 2>&1
```

**Step 6: Commit**

```bash
cd /home/dev/workspace/homelab-gitops
git add cron/gitops-schedule
git commit -m "feat(weekly-summary): add cron schedule for Monday 6 AM"
```

---

### Task 10: Final Verification + Design Doc Update

**Step 1: Run full dry-run and verify all sections have data**

```bash
/home/dev/workspace/homelab-gitops/scripts/weekly-summary.sh --dry-run 2>&1
```

Verify each section:
- [ ] Environment Health shows Loki data
- [ ] Infrastructure Status shows container counts + storage
- [ ] Automation Report shows job statuses
- [ ] CI/CD Summary shows workflow runs
- [ ] Outstanding Tasks shows GitHub issues (Vikunja if token configured)

**Step 2: Update design doc status**

Edit `docs/plans/2026-02-16-weekly-summary-design.md`: change `**Status:** Approved` to `**Status:** Implemented`.

**Step 3: Final commit**

```bash
cd /home/dev/workspace/homelab-gitops
git add docs/plans/2026-02-16-weekly-summary-design.md
git commit -m "docs: mark weekly summary design as implemented"
```
