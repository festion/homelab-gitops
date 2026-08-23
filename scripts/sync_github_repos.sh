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

# Argument parsing. Default $1 to empty so `set -u` doesn't trip when invoked
# without arguments (prod/cron path).
#
# ⚠ This used to be `[ "${1:-}" = "--dev" ]` with an `else` that selected
# PRODUCTION. Any unrecognised flag therefore FAILED OPEN to production —
# measured 2026-08-22: CI calls this with `--dry-run`, which was never a
# supported flag, so the "dry-run validation" step in lint-and-test.yml was
# silently running the FULL PRODUCTION PATH: mkdir -p /opt/gitops/audit-history,
# writing a real timestamped audit JSON, and repointing the latest.json symlink.
# It passed only because /opt happens to be writable on GitHub-hosted runners;
# on a runner where it is not, it died with
# `mkdir: cannot create directory '/opt/gitops': Permission denied`.
# The permission error was the symptom; selecting production from an unknown
# argument was the defect. Unknown flags now FAIL CLOSED.
DRY_RUN=0
MODE="prod"
case "${1:-}" in
  "")        MODE="prod" ;;
  --dev)     MODE="dev" ;;
  --dry-run) MODE="dev"; DRY_RUN=1 ;;
  *)
    echo "❌ Unknown argument: $1" >&2
    echo "Usage: $(basename "$0") [--dev|--dry-run]" >&2
    exit 2
    ;;
esac

# .dev_mode marker still forces dev, but only when no explicit flag was given.
if [ "$MODE" = "prod" ] && [ -f ".dev_mode" ]; then
  MODE="dev"
fi

if [ "$MODE" = "dev" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
  HISTORY_DIR="${PROJECT_ROOT}/audit-history"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "📂 Running in DRY-RUN mode. Would use ${HISTORY_DIR} (no files written)"
  else
    echo "📂 Running in development mode. Using ${HISTORY_DIR}"
  fi
else
  HISTORY_DIR="/opt/gitops/audit-history"
  echo "📂 Running in production mode. Using ${HISTORY_DIR}"
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
JSON_PATH="${HISTORY_DIR}/${TIMESTAMP}.json"

# Dry-run still EXERCISES the generator (that is the point of the CI check) but
# sends the document to /dev/null instead of creating or mutating any artefact.
if [ "$DRY_RUN" -eq 1 ]; then
  OUTPUT_TARGET="/dev/null"
else
  OUTPUT_TARGET="$JSON_PATH"
fi

if [ "$DRY_RUN" -eq 0 ]; then
  mkdir -p "$HISTORY_DIR"
fi

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
} > "$OUTPUT_TARGET"

if [ "$DRY_RUN" -eq 0 ]; then
  ln -sf "$JSON_PATH" "$HISTORY_DIR/latest.json"
fi

### COMPLETE ###
echo -e "✅ Audit complete (remote-only). Report saved to:\n  $JSON_PATH"
echo "🌐 Dashboard link: http://gitopsdashboard.local/audit"
