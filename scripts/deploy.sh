#!/bin/bash
export PATH="$PATH:/mnt/c/Program Files/nodejs/"

set -e

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DASHBOARD_DIR="$SCRIPT_DIR/../dashboard"
DEPLOY_PATH="/var/www/gitops-dashboard"
API_SRC_DIR="$SCRIPT_DIR/../api"
API_DST_DIR="/opt/gitops/api"
SERVICE_NAME="gitops-audit-api"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

# --- Build dashboard ---
echo -e "${GREEN}📦 Building the GitOps Dashboard...${NC}"
cd "$DASHBOARD_DIR"
npm install
npm run build

# --- Deploy dashboard ---
echo -e "${CYAN}🚚 Deploying dashboard to ${DEPLOY_PATH}...${NC}"
sudo mkdir -p "$DEPLOY_PATH"
sudo cp -r dist/* "$DEPLOY_PATH/"

# --- Restart dashboard service ---
echo -e "${CYAN}🔁 Restarting service 'gitops-dashboard'...${NC}"
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl restart gitops-dashboard.service

# --- Deploy API ---
echo -e "${GREEN}🔌 Installing GitOps Audit API...${NC}"
sudo mkdir -p "$API_DST_DIR"
sudo cp "$API_SRC_DIR/server.js" "$API_DST_DIR/server.js"

# --- Create or update API service ---
sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=GitOps Audit API Server
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/gitops/api/server.js
WorkingDirectory=/opt/gitops/api
Restart=always
RestartSec=10
Environment=NODE_ENV=production
User=root

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now "$SERVICE_NAME"
echo -e "${GREEN}✅ Audit API service is now running on port 3070${NC}"

echo -e "${GREEN}✅ Full deployment complete.${NC}"
