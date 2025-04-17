#!/bin/bash
export PATH="$PATH:/mnt/c/Program Files/nodejs/"

set -e

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 Building the GitOps Dashboard...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DASHBOARD_DIR="$SCRIPT_DIR/../dashboard"
DEPLOY_PATH="/var/www/gitops-dashboard"

cd "$DASHBOARD_DIR"

npm install
npm run build

echo -e "${CYAN}🚚 Deploying to ${DEPLOY_PATH}...${NC}"
sudo mkdir -p "$DEPLOY_PATH"
sudo cp -r dist/* "$DEPLOY_PATH/"

echo -e "${GREEN}✅ Deployment complete.${NC}"

echo -e "${CYAN}🔁 Restarting service 'gitops-dashboard'...${NC}"
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl restart gitops-dashboard.service

echo -e "${GREEN}🚀 Service restarted. All done!${NC}"
