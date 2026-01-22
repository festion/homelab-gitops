#!/bin/bash
# Cron wrapper for Loki log audit with Pushover notifications
#
# Setup:
#   1. Copy to target container: /opt/loki-audit/
#   2. Set environment variables in /opt/loki-audit/.env:
#      PUSHOVER_USER_KEY=your_user_key
#      PUSHOVER_API_TOKEN=your_api_token
#   3. Add cron job: 0 8 * * 1 /opt/loki-audit/loki-audit-cron.sh
#
# Crontab entry (runs every Monday at 8 AM):
#   0 8 * * 1 /opt/loki-audit/loki-audit-cron.sh >> /var/log/loki-audit/cron.log 2>&1

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${LOG_DIR:-/var/log/loki-audit}"
HOURS_BACK="${1:-168}"  # Default: 1 week

# Load environment variables
[[ -f "$SCRIPT_DIR/.env" ]] && source "$SCRIPT_DIR/.env"
[[ -f "/opt/loki-audit/.env" ]] && source "/opt/loki-audit/.env"

# Pushover settings
PUSHOVER_USER_KEY="${PUSHOVER_USER_KEY:-}"
PUSHOVER_API_TOKEN="${PUSHOVER_API_TOKEN:-}"

mkdir -p "$LOG_DIR"

REPORT_FILE="$LOG_DIR/audit-$(date +%Y%m%d-%H%M%S).log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

echo "[$TIMESTAMP] Starting Loki log audit..."

# Run audit and capture output
"$SCRIPT_DIR/loki-log-audit.sh" "$HOURS_BACK" > "$REPORT_FILE" 2>&1
EXIT_CODE=$?

echo "[$TIMESTAMP] Audit completed with exit code: $EXIT_CODE"

# Clean up old reports (keep last 12 weeks)
ls -t "$LOG_DIR"/audit-*.log 2>/dev/null | tail -n +13 | xargs -r rm -f

# Send Pushover notification
send_pushover() {
    local title="$1"
    local message="$2"
    local priority="${3:-0}"  # -2 to 2, default normal
    local sound="${4:-pushover}"

    if [[ -z "$PUSHOVER_USER_KEY" || -z "$PUSHOVER_API_TOKEN" ]]; then
        echo "Warning: Pushover credentials not configured, skipping notification"
        return 1
    fi

    curl -s \
        --form-string "token=$PUSHOVER_API_TOKEN" \
        --form-string "user=$PUSHOVER_USER_KEY" \
        --form-string "title=$title" \
        --form-string "message=$message" \
        --form-string "priority=$priority" \
        --form-string "sound=$sound" \
        --form-string "html=1" \
        https://api.pushover.net/1/messages.json > /dev/null

    echo "[$TIMESTAMP] Pushover notification sent"
}

# Extract summary from report
CRITICAL_COUNT=$(grep -oP 'Critical issues: \K[0-9]+' "$REPORT_FILE" || echo "0")
WARNING_COUNT=$(grep -oP 'Warnings: \K[0-9]+' "$REPORT_FILE" || echo "0")

# Build notification message
if [[ $EXIT_CODE -eq 2 ]]; then
    # Critical issues found
    TITLE="🚨 Loki Audit: Critical Issues"
    PRIORITY=1
    SOUND="siren"

    # Get critical issues from report
    ISSUES=$(grep -E "^\[CRITICAL\]" "$REPORT_FILE" | sed 's/\x1b\[[0-9;]*m//g' | head -5)
    MESSAGE="<b>Critical: $CRITICAL_COUNT | Warnings: $WARNING_COUNT</b>

$ISSUES

<i>Full report: $REPORT_FILE</i>"

    send_pushover "$TITLE" "$MESSAGE" "$PRIORITY" "$SOUND"

elif [[ $EXIT_CODE -eq 1 ]]; then
    # Warnings found
    TITLE="⚠️ Loki Audit: Warnings Found"
    PRIORITY=0
    SOUND="pushover"

    ISSUES=$(grep -E "^\[WARNING\]" "$REPORT_FILE" | sed 's/\x1b\[[0-9;]*m//g' | head -5)
    MESSAGE="<b>Warnings: $WARNING_COUNT</b>

$ISSUES

<i>Full report: $REPORT_FILE</i>"

    send_pushover "$TITLE" "$MESSAGE" "$PRIORITY" "$SOUND"

else
    # All healthy - optional notification (comment out if not wanted)
    TITLE="✅ Loki Audit: All Healthy"
    PRIORITY=-1
    SOUND="none"
    MESSAGE="Weekly log audit completed.
No critical issues or warnings detected.

Period: Last $HOURS_BACK hours"

    # Uncomment to receive "all healthy" notifications:
    # send_pushover "$TITLE" "$MESSAGE" "$PRIORITY" "$SOUND"
    echo "[$TIMESTAMP] All systems healthy, no notification sent"
fi

echo "[$TIMESTAMP] Done"
exit $EXIT_CODE
