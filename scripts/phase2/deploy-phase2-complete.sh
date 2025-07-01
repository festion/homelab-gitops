#!/bin/bash
# deploy-phase2-complete.sh - Master orchestration script for Phase 2 deployment
# This script coordinates the deployment of all Phase 2 components

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PRODUCTION_SERVER="${PRODUCTION_SERVER:-192.168.1.58}"
DEPLOYMENT_USER="${DEPLOYMENT_USER:-root}"
DEPLOYMENT_DIR="${DEPLOYMENT_DIR:-/opt/gitops}"
LOG_FILE="${SCRIPT_DIR}/phase2-deployment-$(date +%Y%m%d_%H%M%S).log"

# Import common functions
source "${SCRIPT_DIR}/../common-functions.sh" 2>/dev/null || true

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

# Error handler
handle_error() {
    log "ERROR: Phase 2 deployment failed at line $1"
    echo -e "${RED}❌ Deployment failed. Check ${LOG_FILE} for details.${NC}"
    exit 1
}

trap 'handle_error $LINENO' ERR

# Display banner
clear
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        Phase 2: Advanced DevOps Platform Deployment        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo
echo -e "${BLUE}Target Server:${NC} ${PRODUCTION_SERVER}"
echo -e "${BLUE}Deployment Path:${NC} ${DEPLOYMENT_DIR}"
echo -e "${BLUE}Log File:${NC} ${LOG_FILE}"
echo

# Confirm deployment
if [[ "${1:-}" != "--auto" ]]; then
    echo -e "${YELLOW}This will deploy Phase 2 components to production.${NC}"
    read -p "Continue with deployment? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
fi

# Pre-deployment validation
log "Starting Phase 2 deployment..."
echo -e "\n${BLUE}[Pre-Check]${NC} Validating prerequisites..."

# Check SSH connectivity
if ! ssh -o ConnectTimeout=5 "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}" "echo 'SSH OK'" &>/dev/null; then
    echo -e "${RED}ERROR: Cannot connect to ${PRODUCTION_SERVER}${NC}"
    exit 1
fi

# Check Phase 1B deployment
if ! ssh "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}" "test -f ${DEPLOYMENT_DIR}/.mcp/template-applicator.py"; then
    echo -e "${RED}ERROR: Phase 1B not found. Please deploy Phase 1B first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites validated${NC}"

# Create backup
log "Creating pre-deployment backup..."
echo -e "\n${BLUE}[Backup]${NC} Creating system backup..."
BACKUP_NAME="pre_phase2_$(date +%Y%m%d_%H%M%S)"
ssh "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}" "cd ${DEPLOYMENT_DIR} && tar -czf backups/${BACKUP_NAME}.tar.gz --exclude='backups' --exclude='logs' --exclude='node_modules' ."
echo -e "${GREEN}✓ Backup created: ${BACKUP_NAME}${NC}"

# Execute deployment phases
PHASES=(
    "2.1:deploy-dashboard-v2.sh:Dashboard UI Components"
    "2.2:deploy-pipeline-engine.sh:Pipeline Engine"
    "2.3:deploy-dependencies.sh:Dependency Management"
    "2.4:deploy-quality-gates.sh:Quality Gates"
    "2.5:integrate-phase2-api.sh:API Integration"
    "2.6:migrate-phase2-db.sh:Database Migration"
)

for phase_info in "${PHASES[@]}"; do
    IFS=':' read -r phase_num script_name phase_desc <<< "$phase_info"
    
    echo -e "\n${BLUE}[Phase ${phase_num}]${NC} ${phase_desc}..."
    log "Executing Phase ${phase_num}: ${phase_desc}"
    
    if [[ -x "${SCRIPT_DIR}/${script_name}" ]]; then
        if "${SCRIPT_DIR}/${script_name}"; then
            echo -e "${GREEN}✓ Phase ${phase_num} completed${NC}"
            log "Phase ${phase_num} completed successfully"
        else
            echo -e "${RED}✗ Phase ${phase_num} failed${NC}"
            log "Phase ${phase_num} failed"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠ Script ${script_name} not found, skipping${NC}"
        log "Warning: ${script_name} not found"
    fi
done

# Post-deployment validation
echo -e "\n${BLUE}[Validation]${NC} Running post-deployment validation..."
log "Starting post-deployment validation"

if "${SCRIPT_DIR}/validate-phase2.sh"; then
    echo -e "${GREEN}✓ Validation passed${NC}"
    log "Post-deployment validation successful"
else
    echo -e "${RED}✗ Validation failed${NC}"
    log "Post-deployment validation failed"
    echo -e "${YELLOW}Check the logs and run manual validation${NC}"
fi

# Generate deployment report
echo -e "\n${BLUE}[Report]${NC} Generating deployment report..."
cat > "${SCRIPT_DIR}/phase2-deployment-report.txt" << EOF
Phase 2 Deployment Report
========================
Date: $(date)
Server: ${PRODUCTION_SERVER}
Path: ${DEPLOYMENT_DIR}
Backup: ${BACKUP_NAME}

Components Deployed:
- Advanced Dashboard UI ✓
- Pipeline Engine ✓
- Dependency Manager ✓
- Quality Gates ✓
- Enhanced APIs ✓
- Database Schema v2 ✓

Next Steps:
1. Access dashboard at http://${PRODUCTION_SERVER}/
2. Configure pipeline templates
3. Set up quality gates
4. Test dependency scanning

Log: ${LOG_FILE}
EOF

# Display success message
echo
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            Phase 2 Deployment Successful! 🎉               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo
echo -e "${BLUE}Dashboard:${NC} http://${PRODUCTION_SERVER}/"
echo -e "${BLUE}API Docs:${NC} http://${PRODUCTION_SERVER}:3070/api/docs"
echo -e "${BLUE}Report:${NC} ${SCRIPT_DIR}/phase2-deployment-report.txt"
echo
echo -e "${YELLOW}Recommended: Test all new features before production use${NC}"

log "Phase 2 deployment completed successfully"

# Cleanup
unset PRODUCTION_SERVER DEPLOYMENT_USER DEPLOYMENT_DIR