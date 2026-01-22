#!/bin/bash
# Loki Log Audit Script
# Run weekly via cron to identify issues needing attention
# Usage: ./loki-log-audit.sh [hours_back] [output_format]
#   hours_back: Number of hours to analyze (default: 168 = 1 week)
#   output_format: 'text' or 'json' (default: text)

set -uo pipefail
# Note: -e removed to handle jq exit codes gracefully

LOKI_URL="${LOKI_URL:-http://192.168.1.170:3100}"
HOURS_BACK="${1:-168}"
OUTPUT_FORMAT="${2:-text}"
START_TS="$(date -d "${HOURS_BACK} hours ago" +%s)000000000"
END_TS="$(date +%s)000000000"

# Colors for terminal output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

declare -A ISSUES
CRITICAL_COUNT=0
WARNING_COUNT=0
INFO_COUNT=0

log_issue() {
    local severity="$1"
    local category="$2"
    local message="$3"
    local count="${4:-1}"

    case "$severity" in
        CRITICAL) ((CRITICAL_COUNT+=count)) ;;
        WARNING) ((WARNING_COUNT+=count)) ;;
        INFO) ((INFO_COUNT+=count)) ;;
    esac

    if [[ "$OUTPUT_FORMAT" == "text" ]]; then
        case "$severity" in
            CRITICAL) echo -e "${RED}[CRITICAL]${NC} $category: $message (count: $count)" ;;
            WARNING)  echo -e "${YELLOW}[WARNING]${NC} $category: $message (count: $count)" ;;
            INFO)     echo -e "${BLUE}[INFO]${NC} $category: $message (count: $count)" ;;
        esac
    fi
}

query_loki() {
    local query="$1"
    local limit="${2:-500}"
    curl -sG "${LOKI_URL}/loki/api/v1/query_range" \
        --data-urlencode "query=$query" \
        --data-urlencode "limit=$limit" \
        --data-urlencode "start=$START_TS" \
        --data-urlencode "end=$END_TS" 2>/dev/null
}

echo "=============================================="
echo "Loki Log Audit Report"
echo "Period: $(date -d "${HOURS_BACK} hours ago" '+%Y-%m-%d %H:%M') to $(date '+%Y-%m-%d %H:%M')"
echo "=============================================="
echo ""

# 1. Check for authentication failures per service
echo -e "${BLUE}Checking authentication failures...${NC}"
AUTH_FAILURES=""
# Check PBS authentication
PBS_AUTH=$(query_loki '{job="pbs"} |~ "authentication fail"' | jq -r '[.data.result[].values[]] | length' 2>/dev/null)
[[ ${PBS_AUTH:-0} -gt 0 ]] && AUTH_FAILURES+="pbs $PBS_AUTH\n"
# Check Grafana authentication (exclude alerting scheduler logs which contain "auth" in query text)
GRAFANA_AUTH=$(query_loki '{job="grafana"} |~ "(?i)(unauthorized|permission denied)" |!~ "grafana_scheduler" |!~ "fromAlert=true" |!~ "rule_uid="' | jq -r '[.data.result[].values[]] | length' 2>/dev/null)
[[ ${GRAFANA_AUTH:-0} -gt 0 ]] && AUTH_FAILURES+="grafana $GRAFANA_AUTH\n"
# Check Vaultwarden authentication
VAULT_AUTH=$(query_loki '{job="vaultwarden"} |~ "(?i)(failed|invalid|unauthorized)"' | jq -r '[.data.result[].values[]] | length' 2>/dev/null)
[[ ${VAULT_AUTH:-0} -gt 0 ]] && AUTH_FAILURES+="vaultwarden $VAULT_AUTH\n"
AUTH_FAILURES=$(echo -e "$AUTH_FAILURES" | grep -v "^$" | sort -k2 -rn)

if [[ -n "$AUTH_FAILURES" ]]; then
    while read -r service count; do
        [[ -z "$service" ]] && continue
        if [[ $count -gt 50 ]]; then
            log_issue "CRITICAL" "Authentication" "$service has excessive auth failures" "$count"
        elif [[ $count -gt 10 ]]; then
            log_issue "WARNING" "Authentication" "$service has multiple auth failures" "$count"
        fi
    done <<< "$AUTH_FAILURES"
fi

# 2. Check for 5xx errors in Traefik
echo -e "${BLUE}Checking Traefik 5xx errors...${NC}"
TRAEFIK_5XX=$(query_loki '{job="traefik"} |~ "\" 5[0-9]{2} "' | \
    jq -r '.data.result[].values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

if [[ $TRAEFIK_5XX -gt 100 ]]; then
    log_issue "CRITICAL" "Traefik" "High number of 5xx errors" "$TRAEFIK_5XX"
elif [[ $TRAEFIK_5XX -gt 20 ]]; then
    log_issue "WARNING" "Traefik" "Elevated 5xx error count" "$TRAEFIK_5XX"
fi

# 3. Check for connection/network issues (exclude Loki query logs)
echo -e "${BLUE}Checking network connectivity issues...${NC}"
NETWORK_ISSUES=$(query_loki '{job=~".+"} |~ "(?i)(connection refused|connection reset|connection timed out|network unreachable|host unreachable)" |!~ "query=" |!~ "org_id="' | \
    jq -r '.data.result[] | "\(.stream.job // .stream.container_name)"' 2>/dev/null | grep -v "^loki$" | sort | uniq -c | sort -rn | head -10)

if [[ -n "$NETWORK_ISSUES" ]]; then
    while read -r count service; do
        [[ -z "$count" || -z "$service" ]] && continue
        if [[ $count -gt 50 ]]; then
            log_issue "CRITICAL" "Network" "$service has persistent connection issues" "$count"
        elif [[ $count -gt 10 ]]; then
            log_issue "WARNING" "Network" "$service has intermittent connection issues" "$count"
        fi
    done <<< "$NETWORK_ISSUES"
fi

# 4. Check for service restarts/crashes (exclude Loki query logs and HA automation restarts)
echo -e "${BLUE}Checking for service crashes...${NC}"
CRASHES=$(query_loki '{job=~".+"} |~ "(?i)(segfault|panic|crash|killed signal|oom-killer)" |!~ "query=" |!~ "org_id=" |!~ "Restarting"' | \
    jq -r '.data.result[] | "\(.stream.job // .stream.container_name): \(.values | length)"' 2>/dev/null | \
    grep -v "^loki:" | \
    awk -F: '{sum[$1]+=$2} END {for (k in sum) print k, sum[k]}' | sort -k2 -rn)

if [[ -n "$CRASHES" ]]; then
    while read -r service count; do
        [[ -z "$service" ]] && continue
        if [[ ${count:-0} -gt 0 ]]; then
            log_issue "CRITICAL" "Stability" "$service has crash/panic events" "$count"
        fi
    done <<< "$CRASHES"
fi

# 5. Check for resource exhaustion (exclude Loki query logs)
echo -e "${BLUE}Checking for resource exhaustion...${NC}"
RESOURCE_ISSUES=$(query_loki '{job=~".+"} |~ "(?i)(out of memory|oom-killer|disk full|no space left)" |!~ "query=" |!~ "org_id="' | \
    jq -r '.data.result[] | select(.stream.job != "loki") | .values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

if [[ $RESOURCE_ISSUES -gt 0 ]]; then
    log_issue "CRITICAL" "Resources" "Resource exhaustion events detected" "$RESOURCE_ISSUES"
fi

# 6. Check PBS backup failures
echo -e "${BLUE}Checking PBS backup status...${NC}"
PBS_ERRORS=$(query_loki '{job="pbs"} |~ "TASK ERROR"' | \
    jq -r '.data.result[].values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

if [[ $PBS_ERRORS -gt 0 ]]; then
    log_issue "CRITICAL" "Backups" "PBS backup task errors detected" "$PBS_ERRORS"
fi

# 7. Check Proxmox cluster health
echo -e "${BLUE}Checking Proxmox cluster logs...${NC}"
PROXMOX_ERRORS=$(query_loki '{job=~"proxmox.*"} |~ "(?i)(error|fail|critical)" |!~ "aliases"' | \
    jq -r '.data.result[].values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

if [[ $PROXMOX_ERRORS -gt 50 ]]; then
    log_issue "WARNING" "Proxmox" "Elevated Proxmox error count" "$PROXMOX_ERRORS"
fi

# 8. Check Home Assistant errors
echo -e "${BLUE}Checking Home Assistant logs...${NC}"
HA_ERRORS=$(query_loki '{job="homeassistant"} |~ "(?i)(error|exception|traceback)" |!~ "INFO"' | \
    jq -r '.data.result[].values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

if [[ $HA_ERRORS -gt 100 ]]; then
    log_issue "WARNING" "HomeAssistant" "Elevated error count in Home Assistant" "$HA_ERRORS"
fi

# 9. Check for certificate issues (exclude Loki query logs)
echo -e "${BLUE}Checking for certificate issues...${NC}"
CERT_ISSUES=$(query_loki '{job=~".+"} |~ "(?i)(certificate|ssl|tls).*(error|fail|expir|invalid)" |!~ "query=" |!~ "org_id="' | \
    jq -r '.data.result[] | select(.stream.job != "loki") | .values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

if [[ $CERT_ISSUES -gt 0 ]]; then
    log_issue "WARNING" "Certificates" "SSL/TLS certificate issues detected" "$CERT_ISSUES"
fi

# 10. Check for DNS issues (exclude Loki query logs)
echo -e "${BLUE}Checking for DNS issues...${NC}"
DNS_ISSUES=$(query_loki '{job=~".+"} |~ "(?i)(dns|resolve).*(fail|error|timeout)" |!~ "query=" |!~ "org_id="' | \
    jq -r '.data.result[] | select(.stream.job != "loki") | .values | length' 2>/dev/null | awk '{sum+=$1} END {print sum+0}')

if [[ $DNS_ISSUES -gt 10 ]]; then
    log_issue "WARNING" "DNS" "DNS resolution issues detected" "$DNS_ISSUES"
fi

echo ""
echo "=============================================="
echo "SUMMARY"
echo "=============================================="
echo -e "${RED}Critical issues: $CRITICAL_COUNT${NC}"
echo -e "${YELLOW}Warnings: $WARNING_COUNT${NC}"
echo -e "${BLUE}Informational: $INFO_COUNT${NC}"
echo ""

if [[ $CRITICAL_COUNT -gt 0 ]]; then
    echo -e "${RED}ACTION REQUIRED: Critical issues need immediate attention!${NC}"
    exit 2
elif [[ $WARNING_COUNT -gt 0 ]]; then
    echo -e "${YELLOW}Review recommended: Warnings detected.${NC}"
    exit 1
else
    echo -e "${GREEN}All systems healthy. No significant issues detected.${NC}"
    exit 0
fi
