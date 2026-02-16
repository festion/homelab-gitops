#!/bin/bash
set -euo pipefail
# ------------------------------------------------------------------
# Comprehensive GitHub and Local Repository Auditor
# Version: 4.1 - Enhanced with User-Configurable Settings
# Maintainer: festion GitOps
# License: MIT
# Features: GitHub/Local sync validation, mismatch mitigation
# MCP Integration: Uses Serena to marshall GitHub MCP and code-linter MCP
# ------------------------------------------------------------------

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config/config-loader.sh"
load_config

### CONFIGURATION ###
GITHUB_USER="${GITHUB_USER}"
GITHUB_API_URL="https://api.github.com/users/${GITHUB_USER}/repos?per_page=100"

# Determine if running in dev mode
if [ "${1:-}" = "--dev" ] || [ -f ".dev_mode" ]; then
  PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
  HISTORY_DIR="${PROJECT_ROOT}/audit-history"
  echo "📂 Running in development mode. Using ${HISTORY_DIR}"
  echo "📁 Local Git root: ${LOCAL_GIT_ROOT}"
else
  HISTORY_DIR="${PRODUCTION_BASE_PATH}/audit-history"
  echo "📂 Running in production mode. Using ${HISTORY_DIR}"
  echo "📁 Local Git root: ${LOCAL_GIT_ROOT}"
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
JSON_PATH="${HISTORY_DIR}/${TIMESTAMP}.json"

mkdir -p "$HISTORY_DIR"

### DEP CHECK ###
command -v jq >/dev/null || { echo "❌ jq is required"; exit 1; }
command -v curl >/dev/null || { echo "❌ curl is required"; exit 1; }
command -v git >/dev/null || { echo "❌ git is required"; exit 1; }

### FUNCTIONS ###

# Function to check if directory is a git repository
is_git_repo() {
  local dir="$1"
  [ -d "$dir/.git" ] || git -C "$dir" rev-parse --git-dir >/dev/null 2>&1
}

# Function to get git repository status
get_repo_status() {
  local repo_path="$1"
  if ! is_git_repo "$repo_path"; then
    echo "not_git"
    return
  fi
  
  cd "$repo_path" || return
  
  # Check for uncommitted changes
  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "dirty"
    return
  fi
  
  # Check for untracked files
  if [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo "dirty"
    return
  fi
  
  echo "clean"
}

# Function to get remote origin URL
get_remote_origin() {
  local repo_path="$1"
  if ! is_git_repo "$repo_path"; then
    echo ""
    return
  fi
  
  cd "$repo_path" || return
  git remote get-url origin 2>/dev/null || echo ""
}

# Function to extract GitHub repo name from URL
extract_github_repo_name() {
  local url="$1"
  if [[ "$url" =~ github\.com[:/]([^/]+)/([^/\.]+) ]]; then
    echo "${BASH_REMATCH[2]}"
  else
    echo ""
  fi
}

# Function to check for missing key files
check_missing_files() {
  local repo_path="$1"
  local missing_files=()
  
  # Key files to check for
  local key_files=("README.md" "README.rst" "README.txt" ".gitignore")
  
  for file in "${key_files[@]}"; do
    if [ ! -f "$repo_path/$file" ]; then
      missing_files+=("$file")
    fi
  done
  
  if [ ${#missing_files[@]} -eq ${#key_files[@]} ]; then
    echo "missing_readme"
  elif [ ${#missing_files[@]} -gt 0 ]; then
    echo "missing_files"
  else
    echo "complete"
  fi
}

### FETCH REMOTE REPOS ###
echo "🌐 Fetching GitHub repositories for user: $GITHUB_USER..."
mapfile -t remote_repos < <(curl -s "$GITHUB_API_URL" | jq -r '.[].name' | sort)

if [ ${#remote_repos[@]} -eq 0 ]; then
  echo "⚠️  No repositories found on GitHub for user: $GITHUB_USER"
fi

### SCAN LOCAL REPOS ###
echo "📁 Scanning local repositories in: $LOCAL_GIT_ROOT"
declare -A local_repos
declare -A local_repo_status
declare -A local_repo_remote
declare -A local_repo_files

if [ -d "$LOCAL_GIT_ROOT" ]; then
  for dir in "$LOCAL_GIT_ROOT"/*; do
    if [ -d "$dir" ]; then
      repo_name=$(basename "$dir")
      
      # Skip hidden directories and common non-repo directories
      if [[ "$repo_name" =~ ^\. ]] || [[ "$repo_name" =~ ^(temp|tmp|cache|logs|output)$ ]]; then
        continue
      fi
      
      local_repos["$repo_name"]="$dir"
      local_repo_status["$repo_name"]=$(get_repo_status "$dir")
      local_repo_remote["$repo_name"]=$(get_remote_origin "$dir")
      local_repo_files["$repo_name"]=$(check_missing_files "$dir")
      
      echo "  📦 Found: $repo_name (${local_repo_status[$repo_name]})"
    fi
  done
else
  echo "⚠️  Local Git root directory not found: $LOCAL_GIT_ROOT"
fi

### ANALYZE MISMATCHES ###
declare -A github_repos
for repo in "${remote_repos[@]}"; do
  github_repos["$repo"]=1
done

# Arrays for categorization
missing_repos=()      # On GitHub but not local
extra_repos=()        # Local but not on GitHub  
dirty_repos=()        # Local with uncommitted changes
clean_repos=()        # Local and clean
mismatch_repos=()     # Local repo with different GitHub remote

echo ""
echo "🔍 Analyzing repository mismatches..."

# Check each GitHub repo
for repo in "${remote_repos[@]}"; do
  if [[ -v local_repos["$repo"] ]]; then
    # Repo exists locally, check status
    status="${local_repo_status[$repo]}"
    remote_url="${local_repo_remote[$repo]}"
    github_repo_name=$(extract_github_repo_name "$remote_url")
    
    if [ "$status" = "dirty" ]; then
      dirty_repos+=("$repo")
      echo "  ⚠️  $repo: LOCAL DIRTY (uncommitted changes)"
    elif [ "$status" = "not_git" ]; then
      extra_repos+=("$repo")
      echo "  ❌ $repo: NOT A GIT REPOSITORY"
    elif [ -n "$github_repo_name" ] && [ "$github_repo_name" != "$repo" ]; then
      mismatch_repos+=("$repo")
      echo "  🔄 $repo: REMOTE MISMATCH (points to $github_repo_name)"
    else
      clean_repos+=("$repo")
      echo "  ✅ $repo: CLEAN AND SYNCED"
    fi
  else
    missing_repos+=("$repo")
    echo "  📥 $repo: MISSING LOCALLY"
  fi
done

# Check for extra local repos not on GitHub
for repo_name in "${!local_repos[@]}"; do
  if [[ ! -v github_repos["$repo_name"] ]]; then
    # Check if this repo points to a different GitHub repo
    remote_url="${local_repo_remote[$repo_name]}"
    github_repo_name=$(extract_github_repo_name "$remote_url")
    
    if [ -n "$github_repo_name" ] && [[ -v github_repos["$github_repo_name"] ]]; then
      mismatch_repos+=("$repo_name")
      echo "  🔄 $repo_name: NAME MISMATCH (GitHub repo: $github_repo_name)"
    else
      extra_repos+=("$repo_name")
      echo "  ➕ $repo_name: EXTRA LOCAL REPO"
    fi
  fi
done

### CALCULATE HEALTH STATUS ###
total_repos=$((${#remote_repos[@]} + ${#extra_repos[@]}))
health_status="green"

if [ ${#missing_repos[@]} -gt 0 ]; then
  health_status="red"
elif [ ${#dirty_repos[@]} -gt 0 ] || [ ${#extra_repos[@]} -gt 0 ] || [ ${#mismatch_repos[@]} -gt 0 ]; then
  health_status="yellow"
fi

echo ""
echo "📊 Summary:"
echo "  Total repositories: $total_repos"
echo "  Missing (GitHub → Local): ${#missing_repos[@]}"
echo "  Extra (Local only): ${#extra_repos[@]}"
echo "  Dirty (Uncommitted): ${#dirty_repos[@]}"
echo "  Mismatched (Remote conflicts): ${#mismatch_repos[@]}"
echo "  Clean: ${#clean_repos[@]}"
echo "  Health Status: $health_status"

### GENERATE JSON REPORT ###
{
  echo "{"
  echo "  \"timestamp\": \"${TIMESTAMP}\","
  echo "  \"health_status\": \"${health_status}\","
  echo "  \"local_git_root\": \"${LOCAL_GIT_ROOT}\","
  echo "  \"github_user\": \"${GITHUB_USER}\","
  echo "  \"summary\": {"
  echo "    \"total\": ${total_repos},"
  echo "    \"missing\": ${#missing_repos[@]},"
  echo "    \"extra\": ${#extra_repos[@]},"
  echo "    \"dirty\": ${#dirty_repos[@]},"
  echo "    \"mismatched\": ${#mismatch_repos[@]},"
  echo "    \"clean\": ${#clean_repos[@]}"
  echo "  },"
  echo "  \"repos\": ["

  first=1

  # Missing repositories (GitHub but not local)
  for repo in "${missing_repos[@]}"; do
    [[ $first -eq 0 ]] && echo ","
    echo "    {"
    echo "      \"name\": \"$repo\","
    echo "      \"status\": \"missing\","
    echo "      \"clone_url\": \"https://github.com/$GITHUB_USER/$repo.git\","
    echo "      \"dashboard_link\": \"/audit/$repo?action=clone\","
    echo "      \"mitigation\": \"clone_missing\""
    echo -n "    }"
    first=0
  done

  # Extra repositories (local but not on GitHub)
  for repo in "${extra_repos[@]}"; do
    [[ $first -eq 0 ]] && echo ","
    repo_path="${local_repos[$repo]}"
    remote_url="${local_repo_remote[$repo]}"
    echo "    {"
    echo "      \"name\": \"$repo\","
    echo "      \"status\": \"extra\","
    echo "      \"local_path\": \"$repo_path\","
    echo "      \"remote_url\": \"$remote_url\","
    echo "      \"dashboard_link\": \"/audit/$repo?action=review\","
    echo "      \"mitigation\": \"review_or_delete\""
    echo -n "    }"
    first=0
  done

  # Dirty repositories (local with uncommitted changes)
  for repo in "${dirty_repos[@]}"; do
    [[ $first -eq 0 ]] && echo ","
    repo_path="${local_repos[$repo]}"
    echo "    {"
    echo "      \"name\": \"$repo\","
    echo "      \"status\": \"dirty\","
    echo "      \"local_path\": \"$repo_path\","
    echo "      \"clone_url\": \"https://github.com/$GITHUB_USER/$repo.git\","
    echo "      \"dashboard_link\": \"/audit/$repo?action=commit\","
    echo "      \"mitigation\": \"commit_or_discard\""
    echo -n "    }"
    first=0
  done

  # Mismatched repositories (remote URL conflicts)
  for repo in "${mismatch_repos[@]}"; do
    [[ $first -eq 0 ]] && echo ","
    repo_path="${local_repos[$repo]}"
    remote_url="${local_repo_remote[$repo]}"
    echo "    {"
    echo "      \"name\": \"$repo\","
    echo "      \"status\": \"mismatched\","
    echo "      \"local_path\": \"$repo_path\","
    echo "      \"remote_url\": \"$remote_url\","
    echo "      \"expected_url\": \"https://github.com/$GITHUB_USER/$repo.git\","
    echo "      \"dashboard_link\": \"/audit/$repo?action=fix_remote\","
    echo "      \"mitigation\": \"fix_remote_or_rename\""
    echo -n "    }"
    first=0
  done

  # Clean repositories
  for repo in "${clean_repos[@]}"; do
    [[ $first -eq 0 ]] && echo ","
    repo_path="${local_repos[$repo]}"
    file_status="${local_repo_files[$repo]}"
    echo "    {"
    echo "      \"name\": \"$repo\","
    echo "      \"status\": \"clean\","
    echo "      \"local_path\": \"$repo_path\","
    echo "      \"clone_url\": \"https://github.com/$GITHUB_USER/$repo.git\","
    echo "      \"file_status\": \"$file_status\","
    echo "      \"dashboard_link\": \"/audit/$repo?action=view\""
    echo -n "    }"
    first=0
  done

  echo ""
  echo "  ],"
  echo "  \"mitigation_actions\": {"
  echo "    \"clone_missing\": \"Clone missing repositories from GitHub\","
  echo "    \"review_or_delete\": \"Review extra local repositories and decide to keep or delete\","
  echo "    \"commit_or_discard\": \"Commit uncommitted changes or discard them\","
  echo "    \"fix_remote_or_rename\": \"Fix remote URL or rename repository to match GitHub\""
  echo "  }"
  echo "}"
} > "$JSON_PATH"

ln -sf "$JSON_PATH" "$HISTORY_DIR/latest.json"

### MITIGATION SUGGESTIONS ###
if [ ${#missing_repos[@]} -gt 0 ] || [ ${#extra_repos[@]} -gt 0 ] || [ ${#dirty_repos[@]} -gt 0 ] || [ ${#mismatch_repos[@]} -gt 0 ]; then
  echo ""
  echo "🔧 Suggested Mitigation Actions:"
  
  if [ ${#missing_repos[@]} -gt 0 ]; then
    echo "  📥 Clone missing repositories:"
    for repo in "${missing_repos[@]}"; do
      echo "    git clone https://github.com/$GITHUB_USER/$repo.git $LOCAL_GIT_ROOT/$repo"
    done
  fi
  
  if [ ${#mismatch_repos[@]} -gt 0 ]; then
    echo "  🔄 Fix remote URL mismatches:"
    for repo in "${mismatch_repos[@]}"; do
      echo "    cd $LOCAL_GIT_ROOT/$repo && git remote set-url origin https://github.com/$GITHUB_USER/$repo.git"
    done
  fi
  
  if [ ${#dirty_repos[@]} -gt 0 ]; then
    echo "  ⚠️  Review and commit dirty repositories:"
    for repo in "${dirty_repos[@]}"; do
      echo "    cd $LOCAL_GIT_ROOT/$repo && git status  # Review changes first"
    done
  fi
  
  if [ ${#extra_repos[@]} -gt 0 ]; then
    echo "  ➕ Review extra local repositories:"
    for repo in "${extra_repos[@]}"; do
      echo "    # Review: $LOCAL_GIT_ROOT/$repo"
    done
  fi
fi

### COMPLETE ###
echo ""
echo "✅ Comprehensive audit complete. Report saved to:"
echo "  $JSON_PATH"
echo "🌐 Production Dashboard: http://$PRODUCTION_SERVER_IP/audit"
echo "🌐 Local Dashboard: http://localhost:$DEVELOPMENT_DASHBOARD_PORT/audit"
echo ""
echo "📋 Next steps:"
echo "  1. Review mismatches in the dashboard"
echo "  2. Use suggested mitigation actions above"
echo "  3. Consider using GitHub MCP server for repository operations"
echo "  4. Ensure all scripts pass code-linter MCP validation"