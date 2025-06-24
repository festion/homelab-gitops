#!/bin/bash

# GitOps Template Application CLI Wrapper
#
# Comprehensive CLI interface for the Phase 1B Template Application Engine
# providing easy access to template application, conflict resolution, backup
# management, and batch processing capabilities.
#
# Usage: bash scripts/apply-template.sh [command] [options]
#
# Version: 1.0.0 (Phase 1B Implementation)
# Dependencies: Python 3.8+, Phase 1B template system
# License: MIT

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MCP_DIR="$PROJECT_ROOT/.mcp"
PYTHON_CMD="python3"

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

log_header() {
    echo ""
    echo -e "${PURPLE}📋 $1${NC}"
    echo "=================================================="
}

# Show help message
show_help() {
    cat << EOF
GitOps Template Application System - Phase 1B

USAGE:
    bash scripts/apply-template.sh <command> [options]

COMMANDS:
    apply           Apply template to single repository
    batch           Batch process multiple repositories
    list            List available templates or batch operations
    validate        Validate template configuration
    backup          Manage backups
    conflicts       Analyze or resolve conflicts
    status          Check system or batch status
    help            Show this help message

APPLY COMMAND:
    apply --template <name> --repository <path> [options]

    Options:
        --template, -t      Template name (required)
        --repository, -r    Repository path (required)
        --variables, -v     Variables JSON file
        --dry-run          Show what would be done
        --force            Force application despite conflicts
        --no-backup        Skip backup creation
        --interactive      Interactive conflict resolution

BATCH COMMAND:
    batch <action> [options]

    Actions:
        create          Create new batch operation
        execute         Execute batch operation
        resume          Resume paused/failed batch
        status          Show batch status
        cancel          Cancel running batch
        report          Generate batch report

    Options:
        --template, -t      Template name
        --repositories      Space-separated repository paths
        --batch-id          Batch operation ID
        --workers           Number of parallel workers (default: 4)
        --variables, -v     Variables JSON file
        --dry-run          Dry run mode
        --no-backup        Skip backup creation

BACKUP COMMAND:
    backup <action> [options]

    Actions:
        create          Create repository backup
        list            List available backups
        restore         Restore from backup
        validate        Validate backup integrity
        cleanup         Clean up expired backups

    Options:
        --repository, -r    Repository path
        --backup-id         Backup ID
        --target            Restore target path
        --type              Backup type (full, incremental, snapshot)

EXAMPLES:
    # Apply template to single repository
    bash scripts/apply-template.sh apply -t gitops-standard -r /path/to/repo

    # Dry run with custom variables
    bash scripts/apply-template.sh apply -t mcp-integration -r ./my-repo --dry-run -v vars.json

    # Create batch operation
    bash scripts/apply-template.sh batch create -t gitops-standard --repositories repo1 repo2 repo3

    # Execute batch with 8 workers
    bash scripts/apply-template.sh batch execute --batch-id batch_gitops_20241201_143022 --workers 8

    # List available templates
    bash scripts/apply-template.sh list templates

    # Create backup before template application
    bash scripts/apply-template.sh backup create -r /path/to/repo --type snapshot

    # Validate template configuration
    bash scripts/apply-template.sh validate -t gitops-standard

For more detailed information, see: docs/PHASE1B_TEMPLATE_SYSTEM.md
EOF
}

# Check if Python and required modules are available
check_dependencies() {
    if ! command -v "$PYTHON_CMD" >/dev/null 2>&1; then
        log_error "Python 3 not found. Please install Python 3.8 or later."
        exit 1
    fi

    if [[ ! -d "$MCP_DIR" ]]; then
        log_error "MCP directory not found: $MCP_DIR"
        log_info "Please ensure Phase 1B components are installed"
        exit 1
    fi

    # Check if template applicator exists
    if [[ ! -f "$MCP_DIR/template-applicator.py" ]]; then
        log_error "Template applicator not found: $MCP_DIR/template-applicator.py"
        log_info "Please ensure Phase 1B implementation is complete"
        exit 1
    fi
}

# Apply template to single repository
apply_template() {
    local template=""
    local repository=""
    local variables=""
    local dry_run=false
    local force=false
    local no_backup=false
    local interactive=false

    # Parse apply-specific arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --template|-t)
                template="$2"
                shift 2
                ;;
            --repository|-r)
                repository="$2"
                shift 2
                ;;
            --variables|-v)
                variables="$2"
                shift 2
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            --no-backup)
                no_backup=true
                shift
                ;;
            --interactive)
                interactive=true
                shift
                ;;
            *)
                log_error "Unknown apply option: $1"
                exit 1
                ;;
        esac
    done

    # Validate required arguments
    if [[ -z "$template" ]]; then
        log_error "Template name is required (--template)"
        exit 1
    fi

    if [[ -z "$repository" ]]; then
        log_error "Repository path is required (--repository)"
        exit 1
    fi

    log_header "Applying Template: $template"
    log_info "Repository: $repository"
    log_info "Dry Run: $dry_run"
    log_info "Force: $force"
    log_info "Create Backup: $([ "$no_backup" = true ] && echo "false" || echo "true")"

    # Build Python command
    local cmd_args=("apply" "--template" "$template" "--repository" "$repository")

    if [[ -n "$variables" ]]; then
        cmd_args+=("--variables" "$variables")
    fi

    if [[ "$dry_run" = true ]]; then
        cmd_args+=("--dry-run")
    fi

    if [[ "$force" = true ]]; then
        cmd_args+=("--force")
    fi

    if [[ "$interactive" = true ]]; then
        export TEMPLATE_INTERACTIVE_MODE=true
    fi

    # Execute template application
    cd "$PROJECT_ROOT"
    if "$PYTHON_CMD" "$MCP_DIR/template-applicator.py" "${cmd_args[@]}"; then
        log_success "Template application completed successfully"
    else
        log_error "Template application failed"
        exit 1
    fi
}

# Handle batch operations
batch_operations() {
    local action="$1"
    shift

    case "$action" in
        create|execute|resume|status|cancel|report)
            # Delegate to batch processor
            cd "$PROJECT_ROOT"
            if "$PYTHON_CMD" "$MCP_DIR/batch-processor.py" "$action" "$@"; then
                log_success "Batch operation completed successfully"
            else
                log_error "Batch operation failed"
                exit 1
            fi
            ;;
        *)
            log_error "Unknown batch action: $action"
            log_info "Available actions: create, execute, resume, status, cancel, report"
            exit 1
            ;;
    esac
}

# List available templates or batch operations
list_items() {
    local item_type="${1:-templates}"

    case "$item_type" in
        templates)
            log_header "Available Templates"
            cd "$PROJECT_ROOT"
            "$PYTHON_CMD" "$MCP_DIR/template-applicator.py" list
            ;;
        batches)
            log_header "Batch Operations"
            cd "$PROJECT_ROOT"
            "$PYTHON_CMD" "$MCP_DIR/batch-processor.py" list
            ;;
        backups)
            log_header "Available Backups"
            cd "$PROJECT_ROOT"
            "$PYTHON_CMD" "$MCP_DIR/backup-manager.py" list
            ;;
        *)
            log_error "Unknown list type: $item_type"
            log_info "Available types: templates, batches, backups"
            exit 1
            ;;
    esac
}

# Validate template configuration
validate_template() {
    local template=""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --template|-t)
                template="$2"
                shift 2
                ;;
            *)
                log_error "Unknown validate option: $1"
                exit 1
                ;;
        esac
    done

    if [[ -z "$template" ]]; then
        log_error "Template name is required (--template)"
        exit 1
    fi

    log_header "Validating Template: $template"

    cd "$PROJECT_ROOT"
    if "$PYTHON_CMD" "$MCP_DIR/template-applicator.py" validate --template "$template"; then
        log_success "Template validation passed"
    else
        log_error "Template validation failed"
        exit 1
    fi
}

# Handle backup operations
backup_operations() {
    local action="$1"
    shift

    case "$action" in
        create|list|restore|validate|cleanup)
            # Delegate to backup manager
            cd "$PROJECT_ROOT"
            if "$PYTHON_CMD" "$MCP_DIR/backup-manager.py" "$action" "$@"; then
                log_success "Backup operation completed successfully"
            else
                log_error "Backup operation failed"
                exit 1
            fi
            ;;
        *)
            log_error "Unknown backup action: $action"
            log_info "Available actions: create, list, restore, validate, cleanup"
            exit 1
            ;;
    esac
}

# Handle conflict analysis and resolution
conflict_operations() {
    local action="${1:-analyze}"
    shift

    case "$action" in
        analyze)
            log_header "Conflict Analysis"
            cd "$PROJECT_ROOT"
            "$PYTHON_CMD" "$MCP_DIR/conflict-resolver.py" --analyze "$@"
            ;;
        *)
            log_error "Unknown conflict action: $action"
            log_info "Available actions: analyze"
            exit 1
            ;;
    esac
}

# Show system status
show_status() {
    log_header "Template Application System Status"

    # Check dependencies
    log_info "Checking system dependencies..."

    if command -v "$PYTHON_CMD" >/dev/null 2>&1; then
        python_version=$("$PYTHON_CMD" --version 2>&1)
        log_success "Python: $python_version"
    else
        log_error "Python not found"
    fi

    # Check MCP components
    log_info "Checking Phase 1B components..."

    local components=(
        "template-applicator.py:Template Application Engine"
        "conflict-resolver.py:Conflict Resolution System"
        "backup-manager.py:Backup Management System"
        "batch-processor.py:Batch Processing System"
    )

    for component in "${components[@]}"; do
        IFS=':' read -r file description <<< "$component"
        if [[ -f "$MCP_DIR/$file" ]]; then
            log_success "$description"
        else
            log_error "$description - Missing: $MCP_DIR/$file"
        fi
    done

    # Check template directory
    if [[ -d "$MCP_DIR/templates" ]]; then
        template_count=$(find "$MCP_DIR/templates" -name "template.json" | wc -l)
        log_success "Templates directory: $template_count templates found"
    else
        log_warning "Templates directory not found: $MCP_DIR/templates"
    fi

    # Check backup directory
    if [[ -d "$MCP_DIR/backups" ]]; then
        backup_count=$(find "$MCP_DIR/backups" -name "*.tar.gz" -o -name "*.zip" | wc -l)
        log_success "Backups directory: $backup_count backups found"
    else
        log_info "Backups directory not found (will be created on first backup)"
    fi

    # Check checkpoint directory
    if [[ -d "$MCP_DIR/checkpoints" ]]; then
        checkpoint_count=$(find "$MCP_DIR/checkpoints" -name "batch_*.json" | wc -l)
        log_success "Checkpoints directory: $checkpoint_count batch operations found"
    else
        log_info "Checkpoints directory not found (will be created on first batch operation)"
    fi
}

# Main execution
main() {
    # Show header
    echo -e "${CYAN}🚀 GitOps Template Application System - Phase 1B${NC}"
    echo -e "${CYAN}=====================================================${NC}"

    # Check dependencies first
    check_dependencies

    # Parse main command
    if [[ $# -eq 0 ]]; then
        show_help
        exit 0
    fi

    local command="$1"
    shift

    case "$command" in
        apply)
            apply_template "$@"
            ;;
        batch)
            if [[ $# -eq 0 ]]; then
                log_error "Batch action required"
                log_info "Available actions: create, execute, resume, status, cancel, report"
                exit 1
            fi
            batch_operations "$@"
            ;;
        list)
            list_items "$@"
            ;;
        validate)
            validate_template "$@"
            ;;
        backup)
            if [[ $# -eq 0 ]]; then
                log_error "Backup action required"
                log_info "Available actions: create, list, restore, validate, cleanup"
                exit 1
            fi
            backup_operations "$@"
            ;;
        conflicts)
            conflict_operations "$@"
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
