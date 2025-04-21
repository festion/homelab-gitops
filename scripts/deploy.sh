#!/bin/bash

# ------------------------------------------------------------------
# GitOps Dashboard Deploy Script
# Description: Builds and deploys the frontend and audit API service.
# Author: festion GitOps
# Last Updated: 2025-04-18
# ------------------------------------------------------------------

set -euo pipefail
export PATH="$PATH:/mnt/c/Program Files/nodejs/"

# --- 🧾 Globals ---
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

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

# --- 📦 Install Required Dependencies ---
echo -e "${CYAN}📦 Installing required packages...${NC}"
apt update && apt install -y git curl npm nodejs jq

# --- 🛠 Bootstrap Tailwind if missing ---
cd "$DASHBOARD_DIR"
echo -e "${CYAN}🔧 Ensuring Tailwind setup...${NC}"
if [ ! -f tailwind.config.js ] || [ ! -f postcss.config.js ]; then
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
fi

# Fix tailwind.config.js paths
sed -i 's|content: .*|content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],|' tailwind.config.js

# --- ✅ Validate Tailwind Directives ---
if ! grep -q '@tailwind base;' src/index.css; then
  echo -e "@tailwind base;\n@tailwind components;\n@tailwind utilities;" > src/index.css
fi

# --- 🧼 Clean and Build Dashboard ---
echo -e "${GREEN}📦 Building the GitOps Dashboard...${NC}"
rm -rf dist tsconfig.tsbuildinfo
npm install
npm run build

# --- 🚚 Deploy Static Assets ---
echo -e "${CYAN}🚚 Deploying dashboard to ${DEPLOY_PATH}...${NC}"
mkdir -p "$DEPLOY_PATH"
cp -r dist/* "$DEPLOY_PATH/"

# --- 🔁 Restart Dashboard Service ---
echo -e "${CYAN}🔁 Restarting service 'gitops-dashboard'...${NC}"
systemctl daemon-reexec
systemctl daemon-reload
systemctl restart gitops-dashboard.service || true

# --- 🔌 Install GitOps Audit API Backend ---
echo -e "${GREEN}🔌 Installing GitOps Audit API...${NC}"
mkdir -p "$API_DST_DIR"
cp "$API_SRC_DIR/server.js" "$API_DST_DIR/server.js"
cd "$API_DST_DIR"
npm install express

# --- 🔧 Create/Update API Service ---
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

# --- 🕒 Create Audit Cron Job ---
echo -e "${CYAN}🕒 Setting up nightly GitOps audit cron job...${NC}"
echo "0 3 * * * root /opt/gitops/scripts/sync_github_repos.sh >> /opt/gitops/logs/nightly_audit.log 2>&1" > "$CRON_FILE"
chmod 644 "$CRON_FILE"
echo -e "${GREEN}✅ Nightly audit will run at 3:00 AM UTC daily.${NC}"

# --- 📘 Known Issues & Notes ---
# - React Router v7+ requires Node >= 20 to fully silence warnings
# - Lucide React icons require proper import size handling
# - Vite direct linking (e.g. /audit) requires NGINX try_files or SPA fallback

# --- 🛣️ Roadmap ---
# - Add WebSocket or polling auto-refresh
# - Add email summary on nightly audit
# - Add GitHub Actions deploy hook for push-to-main
# - Implement Git-based file diffs in dashboard
# - Add SSO and auth layer
# - Optional dark mode toggle

# --- ✅ Done ---
echo -e "${GREEN}✅ Full GitOps Dashboard deployment complete.${NC}"
