#!/bin/bash

# ------------------------------------------------------------------
# GitOps Dashboard Production Update Script
# Description: Transfers local changes to the production LXC and deploys them
# ------------------------------------------------------------------

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
LXC_IP="192.168.1.58"
LXC_USER="root"
REMOTE_PATH="/opt/gitops"
LOCAL_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# SSH connection reuse settings
SSH_CONFIG_DIR="$HOME/.ssh"
SSH_CONTROL_PATH="$SSH_CONFIG_DIR/gitops_update_%h_%p_%r"
SSH_OPTS="-o ControlMaster=auto -o ControlPath=$SSH_CONTROL_PATH -o ControlPersist=10m"

# Ensure SSH config directory exists
mkdir -p "$SSH_CONFIG_DIR"

# Header
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}    GitOps Auditor Production Update    ${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${YELLOW}LXC IP:${NC} $LXC_IP"
echo -e "${YELLOW}Local Path:${NC} $LOCAL_PATH"
echo -e "${YELLOW}Remote Path:${NC} $REMOTE_PATH"
echo

# Function to handle errors
handle_error() {
  echo -e "\n${RED}ERROR: Update failed!${NC}"
  echo -e "${RED}$1${NC}"
  exit 1
}

# Establish SSH master connection
echo -e "${CYAN}Establishing SSH connection to LXC...${NC}"
# Test if SSH is available with verbose output
echo -e "${YELLOW}Testing SSH connection with verbose output...${NC}"
ssh -v -o StrictHostKeyChecking=accept-new -o BatchMode=no -o ConnectTimeout=10 $LXC_USER@$LXC_IP "echo SSH connection test" || {
  echo -e "${RED}SSH connection test failed. See details above.${NC}"
  echo -e "${YELLOW}Troubleshooting tips:${NC}"
  echo "1. Verify IP address $LXC_IP is correct"
  echo "2. Ensure you have SSH access to root@$LXC_IP"
  echo "3. Check if you need to use SSH key authentication"
  echo "4. Make sure TCP port 22 is open on the target LXC"
  handle_error "Cannot connect to $LXC_USER@$LXC_IP. Check SSH credentials and connection."
}

# Now establish the control master connection if test was successful
ssh -qfN $SSH_OPTS $LXC_USER@$LXC_IP
if [ $? -ne 0 ]; then
  handle_error "Cannot establish SSH control connection to $LXC_USER@$LXC_IP."
fi
echo -e "${GREEN}✓ SSH connection established${NC}"

# Function to run SSH commands with connection sharing
run_ssh() {
  ssh $SSH_OPTS $LXC_USER@$LXC_IP "$1"
}

# Ensure remote directories exist
echo -e "${CYAN}Ensuring remote directories exist...${NC}"
run_ssh "mkdir -p $REMOTE_PATH/audit-history $REMOTE_PATH/logs $REMOTE_PATH/api $REMOTE_PATH/scripts /var/www/gitops-dashboard" || handle_error "Failed to create remote directories"
echo -e "${GREEN}✓ Remote directories ready${NC}"

# Backup existing configuration
echo -e "${CYAN}Backing up existing configuration on LXC...${NC}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
run_ssh "if [ -d $REMOTE_PATH ]; then cp -r $REMOTE_PATH/audit-history $REMOTE_PATH/audit-history.bak-$TIMESTAMP 2>/dev/null || true; fi" || handle_error "Failed to backup existing configuration"
echo -e "${GREEN}✓ Backup created${NC}"

# Transfer files to LXC
echo -e "${CYAN}Transferring files to LXC...${NC}"
rsync -avz --exclude 'node_modules' --exclude '.git' \
      --exclude 'audit-history' --exclude '.dev_mode' \
      -e "ssh $SSH_OPTS" \
      $LOCAL_PATH/ $LXC_USER@$LXC_IP:$REMOTE_PATH/ || handle_error "Failed to transfer files"
echo -e "${GREEN}✓ Files transferred${NC}"

# Create symbolic link for sync_github_repos.sh in scripts directory
echo -e "${CYAN}Setting up scripts...${NC}"
# Remove the invalid symlink creation (linking a file to itself)
# Instead, make sure the script is executable
run_ssh "chmod +x $REMOTE_PATH/scripts/sync_github_repos.sh" || handle_error "Failed to setup scripts"
echo -e "${GREEN}✓ Scripts prepared${NC}"

# Verify required packages are installed first
echo -e "${CYAN}Checking required packages on LXC...${NC}"
run_ssh "which git curl npm nodejs jq > /dev/null || { apt update && apt install -y git curl npm nodejs jq; }" || \
  handle_error "Failed to install required packages"
echo -e "${GREEN}✓ Required packages are installed${NC}"

# Deploy application on LXC
echo -e "${CYAN}Running deployment script on LXC...${NC}"
# Add more verbose output to help diagnose issues
run_ssh "cd $REMOTE_PATH/scripts && bash -x deploy.sh" || {
    echo -e "${YELLOW}Deployment encountered an error. Showing last 20 lines of system log:${NC}"
    run_ssh "journalctl -n 20"
    handle_error "Deployment failed"
}
echo -e "${GREEN}✓ Deployment completed${NC}"

# Run initial audit to generate data
echo -e "${CYAN}Running initial audit on LXC...${NC}"
run_ssh "cd $REMOTE_PATH/scripts && NODE_ENV=production bash sync_github_repos.sh" || handle_error "Initial audit failed"
echo -e "${GREEN}✓ Initial audit completed${NC}"

# Restart services
echo -e "${CYAN}Restarting services...${NC}"
run_ssh "systemctl daemon-reload && systemctl restart gitops-audit-api && systemctl restart nginx" || handle_error "Failed to restart services"
echo -e "${GREEN}✓ Services restarted${NC}"

# Test API endpoint
echo -e "${CYAN}Testing API endpoint...${NC}"
sleep 3 # Give API time to start up
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$LXC_IP:3070/audit)
if [ "$API_TEST" != "200" ]; then
  echo -e "${YELLOW}API endpoint returned $API_TEST instead of 200${NC}"
  echo -e "${YELLOW}Checking API logs...${NC}"
  run_ssh "journalctl -u gitops-audit-api -n 20"
fi

# Verify deployment
echo -e "${CYAN}Verifying deployment...${NC}"
API_STATUS=$(run_ssh "systemctl is-active gitops-audit-api")
if [ "$API_STATUS" != "active" ]; then
  handle_error "API service is not active. Status: $API_STATUS"
fi
echo -e "${GREEN}✓ API service is active${NC}"

# Close SSH master connection
echo -e "${CYAN}Closing SSH connection...${NC}"
ssh -O stop -o ControlPath=$SSH_CONTROL_PATH $LXC_USER@$LXC_IP 2>/dev/null || true

# Complete
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}    GitOps Auditor Update Complete!    ${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${CYAN}Dashboard:${NC} http://$LXC_IP/"
echo -e "${CYAN}API:${NC} http://$LXC_IP:3070/audit"
echo -e "\nYou may need to clear your browser cache to see the updated dashboard."