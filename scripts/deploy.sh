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
CRON_FILE="/etc/cron.d/gitops-nightly-audit"

# --- Install runtime dependencies ---
echo -e "${CYAN}📦 Installing required packages...${NC}"
apt update && apt install -y git curl npm nodejs jq

# --- Build dashboard ---
echo -e "${GREEN}📦 Building the GitOps Dashboard...${NC}"
cd "$DASHBOARD_DIR"
npm install
npm run build

# --- Deploy dashboard ---
echo -e "${CYAN}🚚 Deploying dashboard to ${DEPLOY_PATH}...${NC}"
mkdir -p "$DEPLOY_PATH"
cp -r dist/* "$DEPLOY_PATH/"

# --- Restart dashboard service ---
echo -e "${CYAN}🔁 Restarting service 'gitops-dashboard'...${NC}"
systemctl daemon-reexec
systemctl daemon-reload
systemctl restart gitops-dashboard.service

# --- Deploy API ---
echo -e "${GREEN}🔌 Installing GitOps Audit API...${NC}"
mkdir -p "$API_DST_DIR"
cp "$API_SRC_DIR/server.js" "$API_DST_DIR/server.js"

# --- Install API dependencies ---
cd "$API_DST_DIR"
npm install express

# --- Create or update API service ---
tee "$SERVICE_FILE" > /dev/null <<EOF
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

systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"
echo -e "${GREEN}✅ Audit API service is now running on port 3070${NC}"

# --- Create nightly audit cron job ---
echo -e "${CYAN}🕒 Setting up nightly GitOps audit cron job...${NC}"
echo "0 3 * * * root /opt/gitops/scripts/sync_github_repos.sh >> /opt/gitops/logs/nightly_audit.log 2>&1" > "$CRON_FILE"
chmod 644 "$CRON_FILE"
echo -e "${GREEN}✅ Nightly audit will run at 3:00 AM UTC daily.${NC}"

echo -e "${GREEN}✅ Full deployment complete.${NC}"
