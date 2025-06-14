#!/bin/bash

# GitOps Repository Sync Script with GitHub MCP Integration
# 
# Enhanced version of the original sync_github_repos.sh that uses GitHub MCP server
# operations coordinated through Serena orchestration instead of direct git commands.
# 
# Usage: bash scripts/sync_github_repos_mcp.sh [--dev] [--dry-run] [--verbose]
# 
# Version: 1.1.0 (Phase 1 MCP Integration)
# Maintainer: GitOps Auditor Team
# License: MIT

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default configuration (can be overridden by config file or environment)
GITHUB_USER="${GITHUB_USER:-}"
LOCAL_REPOS_DIR=""
OUTPUT_DIR=""
AUDIT_HISTORY_DIR=""
DEV_MODE=false
DRY_RUN=false
VERBOSE=false
MCP_INTEGRATION=true

# MCP Server availability flags
GITHUB_MCP_AVAILABLE=false
SERENA_AVAILABLE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dev)
            DEV_MODE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --no-mcp)
            MCP_INTEGRATION=false
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--dev] [--dry-run] [--verbose] [--no-mcp]"
            echo "  --dev      Use development mode settings"
            echo "  --dry-run  Show what would be done without making changes"
            echo "  --verbose  Enable verbose output"
            echo "  --no-mcp   Disable MCP integration (use legacy git commands)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Environment detection and path configuration
if [[ "$DEV_MODE" == "true" ]] || [[ -f "$PROJECT_ROOT/.dev_mode" ]]; then
    DEV_MODE=true
    LOCAL_REPOS_DIR="$PROJECT_ROOT/repos"
    OUTPUT_DIR="$PROJECT_ROOT/output"
    AUDIT_HISTORY_DIR="$PROJECT_ROOT/audit-history"
    echo "🧪 Development mode enabled"
else
    LOCAL_REPOS_DIR="/opt/gitops/repos"
    OUTPUT_DIR="/opt/gitops/output"
    AUDIT_HISTORY_DIR="/opt/gitops/audit-history"
    echo "🏭 Production mode enabled"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${CYAN}🔍 $1${NC}"
    fi
}

log_section() {
    echo ""
    echo -e "${PURPLE}📂 $1${NC}"
    echo "=================================================="
}

log_mcp() {
    echo -e "${CYAN}🔗 MCP: $1${NC}"
}

# Function to load configuration
load_configuration() {
    log_section "Loading Configuration"
    
    # Try to load from config file
    local config_file="$PROJECT_ROOT/config/gitops-config.json"
    if [[ -f "$config_file" ]]; then
        log_info "Loading configuration from: $config_file"
        # TODO: Parse JSON configuration when config-loader is enhanced
        log_verbose "Configuration file found but JSON parsing pending"
    fi
    
    # Load from environment or use defaults
    if [[ -z "$GITHUB_USER" ]]; then
        GITHUB_USER=$(git config user.name 2>/dev/null || echo "")
        if [[ -z "$GITHUB_USER" ]]; then
            log_error "GITHUB_USER not set and cannot determine from git config"
            log_info "Please set GITHUB_USER environment variable or configure git user.name"
            exit 1
        fi
    fi
    
    log_success "Configuration loaded successfully"
    log_info "GitHub User: $GITHUB_USER"
    log_info "Local Repos: $LOCAL_REPOS_DIR"
    log_info "Output Dir: $OUTPUT_DIR"
    log_info "Development Mode: $DEV_MODE"
    log_info "Dry Run Mode: $DRY_RUN"
    log_info "MCP Integration: $MCP_INTEGRATION"
}

# Function to check MCP server availability
check_mcp_availability() {
    log_section "Checking MCP Server Availability"
    
    if [[ "$MCP_INTEGRATION" == "false" ]]; then
        log_warning "MCP integration disabled by user"
        GITHUB_MCP_AVAILABLE=false
        SERENA_AVAILABLE=false
        return
    fi
    
    # Check Serena orchestrator
    # TODO: Implement actual Serena availability check
    # if command -v serena >/dev/null 2>&1; then
    #     log_success "Serena orchestrator found"
    #     SERENA_AVAILABLE=true
    #     
    #     # Check GitHub MCP server through Serena
    #     if serena check-server github; then
    #         log_success "GitHub MCP server available via Serena"
    #         GITHUB_MCP_AVAILABLE=true
    #     else
    #         log_warning "GitHub MCP server not available"
    #         GITHUB_MCP_AVAILABLE=false
    #     fi
    # else
    #     log_warning "Serena orchestrator not found"
    #     SERENA_AVAILABLE=false
    #     GITHUB_MCP_AVAILABLE=false
    # fi
    
    # For Phase 1, simulate MCP availability check
    SERENA_AVAILABLE=false
    GITHUB_MCP_AVAILABLE=false
    log_warning "Serena and GitHub MCP integration not yet implemented"
    log_info "Using fallback git commands for Phase 1"
}

# Function to initialize directories
initialize_directories() {
    log_section "Initializing Directories"
    
    local dirs=("$LOCAL_REPOS_DIR" "$OUTPUT_DIR" "$AUDIT_HISTORY_DIR")
    
    for dir in "${dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            if [[ "$DRY_RUN" == "true" ]]; then
                log_info "Would create directory: $dir"
            else
                log_info "Creating directory: $dir"
                mkdir -p "$dir"
                log_success "Created: $dir"
            fi
        else
            log_verbose "Directory exists: $dir"
        fi
    done
}

# Function to fetch GitHub repositories using MCP or fallback
fetch_github_repositories() {
    log_section "Fetching GitHub Repositories"
    
    if [[ "$GITHUB_MCP_AVAILABLE" == "true" ]]; then
        fetch_github_repositories_mcp
    else
        fetch_github_repositories_fallback
    fi
}

# Function to fetch repositories using GitHub MCP server
fetch_github_repositories_mcp() {
    log_mcp "Fetching repositories via GitHub MCP server"
    
    # TODO: Use Serena to orchestrate GitHub MCP operations
    # Example MCP operation:
    # GITHUB_REPOS=$(serena github list-repositories \
    #     --user="$GITHUB_USER" \
    #     --format=json \
    #     --include-private=false)
    # 
    # if [[ $? -eq 0 ]]; then
    #     log_success "Successfully fetched repositories via GitHub MCP"
    #     echo "$GITHUB_REPOS" > "$OUTPUT_DIR/github-repos-mcp.json"
    # else
    #     log_error "Failed to fetch repositories via GitHub MCP"
    #     return 1
    # fi
    
    log_warning "GitHub MCP repository fetching not yet implemented"
    log_info "Falling back to GitHub API"
    fetch_github_repositories_fallback
}

# Function to fetch repositories using GitHub API (fallback)
fetch_github_repositories_fallback() {
    log_info "Fetching repositories via GitHub API (fallback)"
    
    local github_api_url="https://api.github.com/users/$GITHUB_USER/repos?per_page=100&sort=updated"
    local github_repos_file="$OUTPUT_DIR/github-repos.json"
    
    log_verbose "GitHub API URL: $github_api_url"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Would fetch repositories from: $github_api_url"
        return 0
    fi
    
    if command -v curl >/dev/null 2>&1; then
        log_info "Fetching repository list from GitHub API..."
        if curl -s -f "$github_api_url" > "$github_repos_file"; then
            local repo_count
            repo_count=$(jq length "$github_repos_file" 2>/dev/null || echo "unknown")
            log_success "Fetched $repo_count repositories from GitHub"
            log_verbose "Repository data saved to: $github_repos_file"
        else
            log_error "Failed to fetch repositories from GitHub API"
            return 1
        fi
    else
        log_error "curl command not found - cannot fetch GitHub repositories"
        return 1
    fi
}

# Function to analyze local repositories
analyze_local_repositories() {
    log_section "Analyzing Local Repositories"
    
    local local_repos=()
    local audit_results=()
    
    # Find all directories in LOCAL_REPOS_DIR that contain .git
    if [[ -d "$LOCAL_REPOS_DIR" ]]; then
        while IFS= read -r -d '' repo_dir; do
            local repo_name
            repo_name=$(basename "$repo_dir")
            local_repos+=("$repo_name")
            log_verbose "Found local repository: $repo_name"
            
            # Analyze repository using MCP or fallback
            if analyze_repository_mcp "$repo_dir" "$repo_name"; then
                log_verbose "Repository analysis completed: $repo_name"
            else
                log_warning "Repository analysis failed: $repo_name"
            fi
        done < <(find "$LOCAL_REPOS_DIR" -maxdepth 1 -type d -name ".git" -exec dirname {} \; | sort | tr '\n' '\0')
    fi
    
    log_info "Found ${#local_repos[@]} local repositories"
    return 0
}

# Function to analyze a single repository using MCP or fallback
analyze_repository_mcp() {
    local repo_dir="$1"
    local repo_name="$2"
    
    log_verbose "Analyzing repository: $repo_name"
    
    if [[ "$GITHUB_MCP_AVAILABLE" == "true" ]]; then
        # TODO: Use GitHub MCP for repository analysis
        # serena github analyze-repository \
        #     --path="$repo_dir" \
        #     --check-status \
        #     --check-remote \
        #     --check-commits
        log_verbose "MCP repository analysis placeholder for: $repo_name"
        return 0
    else
        # Fallback analysis using direct git commands
        analyze_repository_fallback "$repo_dir" "$repo_name"
    fi
}

# Function to analyze repository using direct git commands (fallback)
analyze_repository_fallback() {
    local repo_dir="$1"
    local repo_name="$2"
    
    if [[ ! -d "$repo_dir/.git" ]]; then
        log_warning "Not a git repository: $repo_dir"
        return 1
    fi
    
    cd "$repo_dir"
    
    # Check for uncommitted changes
    local has_uncommitted=false
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        has_uncommitted=true
        log_verbose "Repository has uncommitted changes: $repo_name"
    fi
    
    # Check remote URL
    local remote_url=""
    if remote_url=$(git remote get-url origin 2>/dev/null); then
        log_verbose "Remote URL for $repo_name: $remote_url"
    else
        log_verbose "No remote configured for: $repo_name"
    fi
    
    # Get current branch
    local current_branch=""
    if current_branch=$(git branch --show-current 2>/dev/null); then
        log_verbose "Current branch for $repo_name: $current_branch"
    fi
    
    return 0
}

# Function to synchronize repositories using MCP or fallback
synchronize_repositories() {
    log_section "Synchronizing Repositories"
    
    if [[ "$GITHUB_MCP_AVAILABLE" == "true" ]]; then
        synchronize_repositories_mcp
    else
        synchronize_repositories_fallback
    fi
}

# Function to synchronize using GitHub MCP server
synchronize_repositories_mcp() {
    log_mcp "Synchronizing repositories via GitHub MCP server"
    
    # TODO: Use Serena to orchestrate GitHub MCP synchronization
    # Example MCP operations:
    # 1. Compare local vs GitHub repositories
    # 2. Clone missing repositories
    # 3. Update existing repositories
    # 4. Create issues for audit findings
    # 
    # serena github sync-repositories \
    #     --local-path="$LOCAL_REPOS_DIR" \
    #     --user="$GITHUB_USER" \
    #     --dry-run="$DRY_RUN" \
    #     --create-issues=true
    
    log_warning "GitHub MCP synchronization not yet implemented"
    log_info "Falling back to manual synchronization"
    synchronize_repositories_fallback
}

# Function to synchronize using fallback methods
synchronize_repositories_fallback() {
    log_info "Synchronizing repositories using fallback methods"
    
    local github_repos_file="$OUTPUT_DIR/github-repos.json"
    
    if [[ ! -f "$github_repos_file" ]]; then
        log_error "GitHub repositories file not found: $github_repos_file"
        return 1
    fi
    
    log_info "Processing GitHub repositories for synchronization..."
    
    # Parse GitHub repositories and check against local
    if command -v jq >/dev/null 2>&1; then
        local sync_count=0
        while IFS= read -r repo_info; do
            local repo_name clone_url
            repo_name=$(echo "$repo_info" | jq -r '.name')
            clone_url=$(echo "$repo_info" | jq -r '.clone_url')
            
            local local_repo_path="$LOCAL_REPOS_DIR/$repo_name"
            
            if [[ ! -d "$local_repo_path" ]]; then
                log_info "Repository missing locally: $repo_name"
                
                if [[ "$DRY_RUN" == "true" ]]; then
                    log_info "Would clone: $clone_url -> $local_repo_path"
                else
                    log_info "Cloning: $repo_name"
                    if git clone "$clone_url" "$local_repo_path"; then
                        log_success "Cloned: $repo_name"
                        ((sync_count++))
                    else
                        log_error "Failed to clone: $repo_name"
                    fi
                fi
            else
                log_verbose "Repository exists locally: $repo_name"
            fi
        done < <(jq -c '.[]' "$github_repos_file")
        
        log_success "Synchronization completed. Repositories synchronized: $sync_count"
    else
        log_error "jq command not found - cannot parse GitHub repositories"
        return 1
    fi
}

# Function to generate audit report
generate_audit_report() {
    log_section "Generating Audit Report"
    
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local audit_file="$AUDIT_HISTORY_DIR/audit-$timestamp.json"
    local latest_file="$AUDIT_HISTORY_DIR/latest.json"
    
    log_info "Generating comprehensive audit report..."
    
    # Create audit report structure
    local audit_report
    audit_report=$(cat <<EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "version": "1.1.0-mcp",
    "mcp_integration": {
        "serena_available": $SERENA_AVAILABLE,
        "github_mcp_available": $GITHUB_MCP_AVAILABLE,
        "fallback_mode": $([ "$GITHUB_MCP_AVAILABLE" = false ] && echo true || echo false)
    },
    "configuration": {
        "github_user": "$GITHUB_USER",
        "local_repos_dir": "$LOCAL_REPOS_DIR",
        "dev_mode": $DEV_MODE,
        "dry_run": $DRY_RUN
    },
    "summary": {
        "total_github_repos": 0,
        "total_local_repos": 0,
        "missing_repos": 0,
        "extra_repos": 0,
        "dirty_repos": 0,
        "clean_repos": 0
    },
    "repos": []
}
EOF
    )
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Would generate audit report: $audit_file"
        echo "$audit_report" | jq .
    else
        echo "$audit_report" > "$audit_file"
        cp "$audit_file" "$latest_file"
        log_success "Audit report generated: $audit_file"
        log_success "Latest report updated: $latest_file"
    fi
}

# Function to create GitHub issues for audit findings (MCP integration)
create_audit_issues() {
    log_section "Creating GitHub Issues for Audit Findings"
    
    if [[ "$GITHUB_MCP_AVAILABLE" == "true" ]]; then
        log_mcp "Creating issues via GitHub MCP server"
        
        # TODO: Use Serena to orchestrate GitHub MCP issue creation
        # serena github create-audit-issues \
        #     --from-report="$AUDIT_HISTORY_DIR/latest.json" \
        #     --labels="audit,automated,mcp-integration" \
        #     --dry-run="$DRY_RUN"
        
        log_warning "GitHub MCP issue creation not yet implemented"
    else
        log_info "GitHub MCP not available - skipping automated issue creation"
        log_info "Manual review of audit findings recommended"
    fi
}

# Main execution function
main() {
    echo -e "${CYAN}🚀 GitOps Repository Sync with MCP Integration${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo "Version: 1.1.0 (Phase 1 MCP Integration)"
    echo "Timestamp: $(date)"
    echo ""
    
    # Load configuration
    load_configuration
    
    # Check MCP availability
    check_mcp_availability
    
    # Initialize directories
    initialize_directories
    
    # Main workflow
    log_section "Starting Repository Synchronization Workflow"
    
    # Step 1: Fetch GitHub repositories
    if fetch_github_repositories; then
        log_success "GitHub repository fetch completed"
    else
        log_error "GitHub repository fetch failed"
        exit 1
    fi
    
    # Step 2: Analyze local repositories
    if analyze_local_repositories; then
        log_success "Local repository analysis completed"
    else
        log_error "Local repository analysis failed"
        exit 1
    fi
    
    # Step 3: Synchronize repositories
    if synchronize_repositories; then
        log_success "Repository synchronization completed"
    else
        log_error "Repository synchronization failed"
        exit 1
    fi
    
    # Step 4: Generate audit report
    if generate_audit_report; then
        log_success "Audit report generation completed"
    else
        log_error "Audit report generation failed"
        exit 1
    fi
    
    # Step 5: Create GitHub issues for findings
    if create_audit_issues; then
        log_success "GitHub issue creation completed"
    else
        log_warning "GitHub issue creation skipped or failed"
    fi
    
    # Final summary
    log_section "Synchronization Summary"
    log_success "GitOps repository synchronization completed successfully"
    log_info "Mode: $([ "$DEV_MODE" = true ] && echo "Development" || echo "Production")"
    log_info "MCP Integration: $([ "$GITHUB_MCP_AVAILABLE" = true ] && echo "Active" || echo "Fallback")"
    log_info "Dry Run: $DRY_RUN"
    log_info "Output Directory: $OUTPUT_DIR"
    log_info "Audit History: $AUDIT_HISTORY_DIR"
    
    echo ""
    echo -e "${GREEN}🎯 Repository sync workflow completed successfully!${NC}"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
