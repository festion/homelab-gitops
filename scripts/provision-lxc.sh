#!/usr/bin/env bash
source <(curl -s https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/scripts/build.func)

APP="GitOps Dashboard"
var_tags="dashboard;gitops"
var_cpu="2"
var_ram="512"
var_disk="4"
var_os="debian"
var_version="12"
var_unprivileged="1"
GIT_REPO="https://github.com/festion/homelab-gitops-auditor.git"
SERVICE_PORT=8080
CT_HOSTNAME="gitopsdashboard"

header_info "$APP"
variables
color
catch_errors

CTID=$(pct list | awk -v host="$CT_HOSTNAME" '$3 == host {print $1}')

if [[ -n "$CTID" ]]; then
  msg_ok "Container for ${APP} already exists (CTID: ${CTID}). Updating existing container."

  msg_info "Stopping ${APP}"
  pct exec $CTID -- systemctl stop gitops-dashboard
  sleep 2
  msg_ok "Stopped ${APP}"
else
  start
  build_container
  description
fi

msg_info "Installing dependencies"
pct exec $CTID -- bash -c "apt update >/dev/null 2>&1 && apt install -y git curl npm nodejs python3 >/dev/null 2>&1"
msg_ok "Installed dependencies"

msg_info "Setting up ${APP}"
pct exec $CTID -- bash -c "\
  rm -rf /opt/gitops && \
  git clone --depth=1 $GIT_REPO /opt/gitops && \
  cd /opt/gitops/dashboard && \
  npm install && npm run build && \
  mkdir -p /var/www/gitops-dashboard && \
  cp -r dist/* /var/www/gitops-dashboard/"

# Create systemd service to serve the static dashboard
SERVICE_FILE="[Unit]
Description=GitOps Dashboard
After=network.target

[Service]
WorkingDirectory=/var/www/gitops-dashboard
ExecStart=/usr/bin/python3 -m http.server ${SERVICE_PORT}
Restart=always

[Install]
WantedBy=multi-user.target"

pct exec $CTID -- bash -c "echo '$SERVICE_FILE' > /etc/systemd/system/gitops-dashboard.service"
pct exec $CTID -- systemctl daemon-reload
pct exec $CTID -- systemctl enable --now gitops-dashboard.service
msg_ok "Service installed and started"

# Add Git post-merge hook to rebuild on pull
HOOK_SCRIPT="#!/bin/bash
cd /opt/gitops/dashboard
npm install
npm run build
systemctl restart gitops-dashboard"

pct exec $CTID -- bash -c "echo '$HOOK_SCRIPT' > /opt/gitops/.git/hooks/post-merge && chmod +x /opt/gitops/.git/hooks/post-merge"
msg_ok "Auto-rebuild Git hook created"

# Add shortcut to manually trigger update + rebuild
UPDATE_SCRIPT="#!/bin/bash
cd /opt/gitops
git pull
if [ -x .git/hooks/post-merge ]; then
  .git/hooks/post-merge
else
  echo 'No post-merge hook found.'
fi"

pct exec $CTID -- bash -c "echo '$UPDATE_SCRIPT' > /usr/local/bin/gitops-update && chmod +x /usr/local/bin/gitops-update"
msg_ok "Manual update script created at /usr/local/bin/gitops-update"


# Final output
IP=$(pct exec $CTID -- hostname -I | awk '{print $1}')
msg_ok "Completed Successfully!\n"
echo -e "${CREATING}${GN}${APP} setup has been successfully initialized!${CL}"
echo -e "${INFO}${YW} Access it using the following URL:${CL}"
echo -e "${TAB}${GATEWAY}${BGN}http://${IP}:${SERVICE_PORT}${CL}"
