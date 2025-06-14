#!/bin/bash

# Pre-commit hook for GitOps Auditor
# Uses code-linter MCP server for validation via Serena orchestration
# Version: 1.0.0 (Phase 1 MCP Integration)

set -euo pipefail

echo "🔍 GitOps Auditor - Pre-commit validation (MCP Integration)"
echo "=================================================="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MCP_LINTER_AVAILABLE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Function to check MCP linter availability
check_mcp_linter() {
    log_info "Checking code-linter MCP server availability..."
    
    # TODO: Integrate with Serena to check code-linter MCP server availability
    # This will be implemented when Serena orchestration is fully configured
    # Example:
    # if serena check-mcp code-linter; then
    #     MCP_LINTER_AVAILABLE=true
    #     log_success "Code-linter MCP server is available"
    # else
    #     MCP_LINTER_AVAILABLE=false
    #     log_warning "Code-linter MCP server not available, using fallback linting"
    # fi
    
    # For now, use fallback validation
    MCP_LINTER_AVAILABLE=false
    log_warning "Code-linter MCP integration not yet implemented, using fallback validation"
}

# Function to validate files using code-linter MCP server
validate_with_mcp() {
    local file_path="$1"
    local file_type="$2"
    
    log_info "Validating $file_path with code-linter MCP..."
    
    if [[ "$MCP_LINTER_AVAILABLE" == "true" ]]; then
        # TODO: Use Serena to orchestrate code-linter MCP validation
        # Example MCP operation:
        # serena code-linter validate --file="$file_path" --type="$file_type"
        # if serena code-linter validate "$file_path"; then
        #     log_success "MCP validation passed for $file_path"
        #     return 0
        # else
        #     log_error "MCP validation failed for $file_path"
        #     return 1
        # fi
        
        log_warning "MCP validation not yet implemented for $file_path"
        return 0
    else
        # Fallback validation
        return validate_with_fallback "$file_path" "$file_type"
    fi
}

# Function to validate files using fallback linters
validate_with_fallback() {
    local file_path="$1"
    local file_type="$2"
    
    log_info "Using fallback validation for $file_path ($file_type)"
    
    case "$file_type" in
        "javascript"|"typescript")
            if command -v npx >/dev/null 2>&1; then
                if [[ -f "$PROJECT_ROOT/dashboard/package.json" ]]; then
                    cd "$PROJECT_ROOT/dashboard"
                    if npx eslint --quiet "$file_path" 2>/dev/null; then
                        log_success "ESLint validation passed for $file_path"
                        return 0
                    else
                        log_error "ESLint validation failed for $file_path"
                        return 1
                    fi
                fi
            fi
            log_warning "ESLint not available, skipping JS/TS validation"
            return 0
            ;;
            
        "shell")
            if command -v shellcheck >/dev/null 2>&1; then
                if shellcheck "$file_path"; then
                    log_success "ShellCheck validation passed for $file_path"
                    return 0
                else
                    log_error "ShellCheck validation failed for $file_path"
                    return 1
                fi
            else
                log_warning "ShellCheck not available, skipping shell script validation"
                return 0
            fi
            ;;
            
        "python")
            if command -v python3 >/dev/null 2>&1; then
                if python3 -m py_compile "$file_path" 2>/dev/null; then
                    log_success "Python syntax validation passed for $file_path"
                    return 0
                else
                    log_error "Python syntax validation failed for $file_path"
                    return 1
                fi
            else
                log_warning "Python not available, skipping Python validation"
                return 0
            fi
            ;;
            
        "json")
            if command -v jq >/dev/null 2>&1; then
                if jq empty "$file_path" 2>/dev/null; then
                    log_success "JSON validation passed for $file_path"
                    return 0
                else
                    log_error "JSON validation failed for $file_path"
                    return 1
                fi
            elif command -v python3 >/dev/null 2>&1; then
                if python3 -m json.tool "$file_path" >/dev/null 2>&1; then
                    log_success "JSON validation passed for $file_path"
                    return 0
                else
                    log_error "JSON validation failed for $file_path"
                    return 1
                fi
            else
                log_warning "No JSON validator available, skipping JSON validation"
                return 0
            fi
            ;;
            
        *)
            log_info "No specific validation for file type: $file_type"
            return 0
            ;;
    esac
}

# Function to determine file type
get_file_type() {
    local file_path="$1"
    local extension="${file_path##*.}"
    
    case "$extension" in
        "js"|"jsx")
            echo "javascript"
            ;;
        "ts"|"tsx")
            echo "typescript"
            ;;
        "sh"|"bash")
            echo "shell"
            ;;
        "py")
            echo "python"
            ;;
        "json")
            echo "json"
            ;;
        "yml"|"yaml")
            echo "yaml"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Main validation function
main() {
    log_info "Starting pre-commit validation with MCP integration"
    
    # Check MCP linter availability
    check_mcp_linter
    
    # Get list of staged files
    local staged_files
    staged_files=$(git diff --cached --name-only --diff-filter=ACM)
    
    if [[ -z "$staged_files" ]]; then
        log_info "No staged files to validate"
        return 0
    fi
    
    local validation_failed=false
    local files_validated=0
    
    # Validate each staged file
    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            local file_type
            file_type=$(get_file_type "$file")
            
            log_info "Validating: $file (type: $file_type)"
            
            if validate_with_mcp "$file" "$file_type"; then
                ((files_validated++))
            else
                validation_failed=true
                log_error "Validation failed for: $file"
            fi
        fi
    done <<< "$staged_files"
    
    # Summary
    echo ""
    echo "=================================================="
    if [[ "$validation_failed" == "true" ]]; then
        log_error "Pre-commit validation FAILED"
        log_error "Please fix the validation errors before committing"
        log_info "Files validated: $files_validated"
        log_info "MCP Linter: ${MCP_LINTER_AVAILABLE}"
        return 1
    else
        log_success "Pre-commit validation PASSED"
        log_success "All files passed validation checks"
        log_info "Files validated: $files_validated"
        log_info "MCP Linter: ${MCP_LINTER_AVAILABLE}"
        return 0
    fi
}

# Run main function
main "$@"
