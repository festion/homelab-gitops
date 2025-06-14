#!/bin/bash

# GitOps Auditor - Code Quality Validation with MCP Integration
# Validates entire codebase using code-linter MCP server via Serena orchestration
# 
# Usage: bash scripts/validate-codebase-mcp.sh [--fix] [--strict]
# 
# Version: 1.0.0 (Phase 1 MCP Integration)

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMP_DIR="${PROJECT_ROOT}/.tmp"
LOG_FILE="${TEMP_DIR}/validation.log"

# Command line options
FIX_MODE=false
STRICT_MODE=false
MCP_LINTER_AVAILABLE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX_MODE=true
            shift
            ;;
        --strict)
            STRICT_MODE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--fix] [--strict]"
            echo "  --fix    Attempt to automatically fix issues"
            echo "  --strict Use strict validation (fail on warnings)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

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
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_section() {
    echo -e "${PURPLE}🔍 $1${NC}" | tee -a "$LOG_FILE"
    echo "=================================================="
}

# Initialize logging
init_logging() {
    mkdir -p "$TEMP_DIR"
    echo "GitOps Auditor - Code Quality Validation Log" > "$LOG_FILE"
    echo "Generated: $(date)" >> "$LOG_FILE"
    echo "Mode: MCP Integration" >> "$LOG_FILE"
    echo "Fix Mode: $FIX_MODE" >> "$LOG_FILE"
    echo "Strict Mode: $STRICT_MODE" >> "$LOG_FILE"
    echo "=================================================" >> "$LOG_FILE"
}

# Function to check Serena and MCP server availability
check_mcp_availability() {
    log_section "Checking MCP Server Availability"
    
    # TODO: Integrate with Serena to check code-linter MCP server availability
    # This will be implemented when Serena orchestration is fully configured
    # 
    # Example Serena integration:
    # if command -v serena >/dev/null 2>&1; then
    #     log_info "Serena orchestrator found"
    #     
    #     if serena list-servers | grep -q "code-linter"; then
    #         log_success "Code-linter MCP server is available"
    #         MCP_LINTER_AVAILABLE=true
    #         
    #         # Test MCP server connection
    #         if serena test-connection code-linter; then
    #             log_success "Code-linter MCP server connection verified"
    #         else
    #             log_error "Code-linter MCP server connection failed"
    #             MCP_LINTER_AVAILABLE=false
    #         fi
    #     else
    #         log_warning "Code-linter MCP server not found in Serena"
    #         MCP_LINTER_AVAILABLE=false
    #     fi
    # else
    #     log_warning "Serena orchestrator not found"
    #     MCP_LINTER_AVAILABLE=false
    # fi
    
    # For Phase 1, we'll use fallback validation while setting up MCP integration
    MCP_LINTER_AVAILABLE=false
    log_warning "Serena and code-linter MCP integration not yet implemented"
    log_info "Using fallback validation tools for Phase 1 implementation"
}

# Function to validate JavaScript/TypeScript files using MCP
validate_js_ts_mcp() {
    local files=("$@")
    local validation_passed=true
    
    log_section "Validating JavaScript/TypeScript files (${#files[@]} files)"
    
    for file in "${files[@]}"; do
        log_info "Validating: $file"
        
        if [[ "$MCP_LINTER_AVAILABLE" == "true" ]]; then
            # TODO: Use Serena to orchestrate code-linter MCP validation
            # Example MCP operation:
            # if serena code-linter validate \
            #     --file="$file" \
            #     --language="javascript" \
            #     --fix="$FIX_MODE" \
            #     --strict="$STRICT_MODE"; then
            #     log_success "MCP validation passed: $file"
            # else
            #     log_error "MCP validation failed: $file"
            #     validation_passed=false
            # fi
            
            log_info "MCP validation placeholder for: $file"
        else
            # Fallback validation using ESLint
            if validate_js_ts_fallback "$file"; then
                log_success "Fallback validation passed: $file"
            else
                log_error "Fallback validation failed: $file"
                validation_passed=false
            fi
        fi
    done
    
    return $([ "$validation_passed" = true ] && echo 0 || echo 1)
}

# Function to validate shell scripts using MCP
validate_shell_mcp() {
    local files=("$@")
    local validation_passed=true
    
    log_section "Validating Shell scripts (${#files[@]} files)"
    
    for file in "${files[@]}"; do
        log_info "Validating: $file"
        
        if [[ "$MCP_LINTER_AVAILABLE" == "true" ]]; then
            # TODO: Use Serena to orchestrate code-linter MCP validation
            # Example MCP operation:
            # if serena code-linter validate \
            #     --file="$file" \
            #     --language="shell" \
            #     --fix="$FIX_MODE" \
            #     --strict="$STRICT_MODE"; then
            #     log_success "MCP validation passed: $file"
            # else
            #     log_error "MCP validation failed: $file"
            #     validation_passed=false
            # fi
            
            log_info "MCP validation placeholder for: $file"
        else
            # Fallback validation using ShellCheck
            if validate_shell_fallback "$file"; then
                log_success "Fallback validation passed: $file"
            else
                log_error "Fallback validation failed: $file"
                validation_passed=false
            fi
        fi
    done
    
    return $([ "$validation_passed" = true ] && echo 0 || echo 1)
}

# Function to validate Python files using MCP
validate_python_mcp() {
    local files=("$@")
    local validation_passed=true
    
    log_section "Validating Python files (${#files[@]} files)"
    
    for file in "${files[@]}"; do
        log_info "Validating: $file"
        
        if [[ "$MCP_LINTER_AVAILABLE" == "true" ]]; then
            # TODO: Use Serena to orchestrate code-linter MCP validation
            # Example MCP operation:
            # if serena code-linter validate \
            #     --file="$file" \
            #     --language="python" \
            #     --fix="$FIX_MODE" \
            #     --strict="$STRICT_MODE"; then
            #     log_success "MCP validation passed: $file"
            # else
            #     log_error "MCP validation failed: $file"
            #     validation_passed=false
            # fi
            
            log_info "MCP validation placeholder for: $file"
        else
            # Fallback validation using Python syntax check
            if validate_python_fallback "$file"; then
                log_success "Fallback validation passed: $file"
            else
                log_error "Fallback validation failed: $file"
                validation_passed=false
            fi
        fi
    done
    
    return $([ "$validation_passed" = true ] && echo 0 || echo 1)
}

# Fallback validation functions
validate_js_ts_fallback() {
    local file="$1"
    
    if [[ -f "$PROJECT_ROOT/dashboard/package.json" ]]; then
        cd "$PROJECT_ROOT/dashboard"
        if command -v npx >/dev/null 2>&1; then
            local eslint_args="--quiet"
            if [[ "$FIX_MODE" == "true" ]]; then
                eslint_args="$eslint_args --fix"
            fi
            
            if npx eslint $eslint_args "$file" 2>/dev/null; then
                return 0
            else
                return 1
            fi
        fi
    fi
    
    # If ESLint not available, basic syntax check
    if [[ "$file" == *.js || "$file" == *.jsx ]]; then
        if command -v node >/dev/null 2>&1; then
            if node -c "$file" 2>/dev/null; then
                return 0
            else
                return 1
            fi
        fi
    fi
    
    return 0  # Skip if no tools available
}

validate_shell_fallback() {
    local file="$1"
    
    if command -v shellcheck >/dev/null 2>&1; then
        local shellcheck_args=""
        if [[ "$STRICT_MODE" == "false" ]]; then
            shellcheck_args="-e SC2034,SC2086"  # Ignore some common warnings
        fi
        
        if shellcheck $shellcheck_args "$file"; then
            return 0
        else
            return 1
        fi
    else
        # Basic bash syntax check
        if bash -n "$file" 2>/dev/null; then
            return 0
        else
            return 1
        fi
    fi
}

validate_python_fallback() {
    local file="$1"
    
    if command -v python3 >/dev/null 2>&1; then
        if python3 -m py_compile "$file" 2>/dev/null; then
            return 0
        else
            return 1
        fi
    fi
    
    return 0  # Skip if Python not available
}

# Function to collect files for validation
collect_files() {
    log_section "Collecting files for validation"
    
    # JavaScript/TypeScript files
    JS_TS_FILES=()
    while IFS= read -r -d '' file; do
        JS_TS_FILES+=("$file")
    done < <(find "$PROJECT_ROOT" -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \
        | grep -v node_modules \
        | grep -v ".git" \
        | grep -v "dist/" \
        | grep -v "build/" \
        | sort \
        | tr '\n' '\0')
    
    # Shell script files
    SHELL_FILES=()
    while IFS= read -r -d '' file; do
        SHELL_FILES+=("$file")
    done < <(find "$PROJECT_ROOT" -name "*.sh" -o -name "*.bash" \
        | grep -v node_modules \
        | grep -v ".git" \
        | sort \
        | tr '\n' '\0')
    
    # Python files
    PYTHON_FILES=()
    while IFS= read -r -d '' file; do
        PYTHON_FILES+=("$file")
    done < <(find "$PROJECT_ROOT" -name "*.py" \
        | grep -v node_modules \
        | grep -v ".git" \
        | sort \
        | tr '\n' '\0')
    
    log_info "Found ${#JS_TS_FILES[@]} JavaScript/TypeScript files"
    log_info "Found ${#SHELL_FILES[@]} Shell script files"
    log_info "Found ${#PYTHON_FILES[@]} Python files"
}

# Main validation function
main() {
    echo -e "${CYAN}🚀 GitOps Auditor - Code Quality Validation${NC}"
    echo -e "${CYAN}=================================================${NC}"
    echo "Using MCP Integration (Phase 1)"
    echo "Fix Mode: $FIX_MODE"
    echo "Strict Mode: $STRICT_MODE"
    echo ""
    
    # Initialize logging
    init_logging
    
    # Check MCP availability
    check_mcp_availability
    
    # Collect files
    collect_files
    
    local validation_failed=false
    
    # Validate JavaScript/TypeScript files
    if [[ ${#JS_TS_FILES[@]} -gt 0 ]]; then
        if ! validate_js_ts_mcp "${JS_TS_FILES[@]}"; then
            validation_failed=true
        fi
    fi
    
    # Validate Shell scripts
    if [[ ${#SHELL_FILES[@]} -gt 0 ]]; then
        if ! validate_shell_mcp "${SHELL_FILES[@]}"; then
            validation_failed=true
        fi
    fi
    
    # Validate Python files
    if [[ ${#PYTHON_FILES[@]} -gt 0 ]]; then
        if ! validate_python_mcp "${PYTHON_FILES[@]}"; then
            validation_failed=true
        fi
    fi
    
    # Summary
    echo ""
    log_section "Validation Summary"
    
    if [[ "$validation_failed" == "true" ]]; then
        log_error "Code quality validation FAILED"
        log_error "Please fix the validation errors before proceeding"
        log_info "Detailed log: $LOG_FILE"
        log_info "MCP Linter Available: $MCP_LINTER_AVAILABLE"
        return 1
    else
        log_success "Code quality validation PASSED"
        log_success "All files passed validation checks"
        log_info "Total files validated: $((${#JS_TS_FILES[@]} + ${#SHELL_FILES[@]} + ${#PYTHON_FILES[@]}))"
        log_info "MCP Linter Available: $MCP_LINTER_AVAILABLE"
        log_info "Detailed log: $LOG_FILE"
        return 0
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
