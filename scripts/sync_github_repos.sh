#!/bin/bash
set -euo pipefail
# ------------------------------------------------------------------
# GitHub Repository Presence Auditor (No Local Scan)
# Version: 3.0
# Maintainer: festion GitOps
# License: MIT
# ------------------------------------------------------------------

### CONFIGURATION ###
GITHUB_USER="festion"
GITHUB_API_URL="https://api.github.com/users/${GITHUB_USER}/repos?per_page=100"

# Determine if running in dev mode. Default $1 to empty so `set -u` doesn't
# trip when invoked without arguments (prod/cron path).
if [ "${1:-}" = "--dev" ] || [ -f ".dev_mode" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
  HISTORY_DIR="${PROJECT_ROOT}/audit-history"
  echo "📂 Running in development mode. Using ${HISTORY_DIR}"
else
  HISTORY_DIR="/opt/gitops/audit-history"
  echo "📂 Running in production mode. Using ${HISTORY_DIR}"
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
JSON_PATH="${HISTORY_DIR}/${TIMESTAMP}.json"

mkdir -p "$HISTORY_DIR"

### DEP CHECK ###
command -v jq >/dev/null || { echo "❌ jq is required"; exit 1; }
command -v curl >/dev/null || { echo "❌ curl is required"; exit 1; }

### FETCH REPOS ###
echo "🌐 Fetching GitHub repositories for user: $GITHUB_USER..."
mapfile -t remote_repos < <(curl -s "$GITHUB_API_URL" | jq -r '.[].name' | sort)

### JSON STRUCTURE (GitHub presence only) ###
{
  echo "{"
  echo "  \"timestamp\": \"${TIMESTAMP}\","
  echo "  \"health_status\": \"green\","
  echo "  \"summary\": {"
  echo "    \"total\": ${#remote_repos[@]},"
  echo "    \"missing\": 0,"
  echo "    \"extra\": 0,"
  echo "    \"dirty\": 0,"
  echo "    \"clean\": ${#remote_repos[@]}"
  echo "  },"
  echo "  \"repos\": ["

  first=1
  for repo in "${remote_repos[@]}"; do
    [[ $first -eq 0 ]] && echo ","
    echo "    {"
    echo "      \"name\": \"$repo\","
    echo "      \"status\": \"clean\","
    echo "      \"clone_url\": \"https://github.com/$GITHUB_USER/$repo.git\","
    echo "      \"dashboard_link\": \"/audit/$repo?action=view\""
    echo -n "    }"
    first=0
  done

  echo ""
  echo "  ]"
  echo "}"
} > "$JSON_PATH"

ln -sf "$JSON_PATH" "$HISTORY_DIR/latest.json"

### COMPLETE ###
echo -e "✅ Audit complete (remote-only). Report saved to:\n  $JSON_PATH"
echo "🌐 Dashboard link: http://gitopsdashboard.local/audit"
