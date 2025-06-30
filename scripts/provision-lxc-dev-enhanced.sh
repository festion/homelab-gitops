#!/usr/bin/env bash
source <(curl -s https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/scripts/build.func)

APP="GitOps Dev Environment"
var_tags="development;gitops;home-assistant"
var_cpu="4"
var_ram="2048"
var_disk="12"
var_os="debian"
var_version="12"
var_unprivileged="1"
GIT_REPO="https://github.com/festion/homelab-gitops-auditor.git"
SERVICE_PORT=5173
API_PORT=3070
CT_HOSTNAME="gitops-dev"

header_info "$APP"
variables
color
catch_errors

CTID=$(pct list | awk -v host="$CT_HOSTNAME" '$3 == host {print $1}')

if [[ -n "$CTID" ]]; then
  msg_ok "Container for ${APP} already exists (CTID: ${CTID}). Updating existing container."

  msg_info "Stopping services"
  pct exec $CTID -- systemctl stop gitops-api gitops-dashboard || true
  sleep 2
  msg_ok "Stopped services"
else
  start
  build_container
  description
fi

msg_info "Installing base dependencies"
pct exec $CTID -- bash -c "
  apt update >/dev/null 2>&1
  apt install -y git curl wget npm nodejs python3 python3-pip python3-venv \
    build-essential jq unzip zip vim nano htop tmux screen \
    yamllint python3-yaml >/dev/null 2>&1
"
msg_ok "Installed base dependencies"

msg_info "Installing Home Assistant development tools"
pct exec $CTID -- bash -c "
  # Install Home Assistant Core for development
  python3 -m venv /opt/hass-dev
  source /opt/hass-dev/bin/activate
  pip install homeassistant >/dev/null 2>&1
  
  # Install HASS configuration validation tools
  pip install homeassistant-cli yamllint >/dev/null 2>&1
  
  # Install ESPHome for device development
  pip install esphome >/dev/null 2>&1
  
  # Create HASS development workspace
  mkdir -p /opt/hass-workspace
  cd /opt/hass-workspace
  
  # Initialize a basic HA config for testing
  /opt/hass-dev/bin/hass --script ensure_config >/dev/null 2>&1 || true
"
msg_ok "Installed Home Assistant development tools"

msg_info "Setting up GitOps Auditor development environment"
pct exec $CTID -- bash -c "
  # Clone the repository
  rm -rf /opt/gitops
  git clone $GIT_REPO /opt/gitops
  cd /opt/gitops
  
  # Install API dependencies (development mode)
  cd api
  npm install >/dev/null 2>&1
  cd ..
  
  # Install dashboard dependencies (development mode)
  cd dashboard
  npm install >/dev/null 2>&1
  cd ..
  
  # Create development environment configuration
  mkdir -p /opt/gitops/config
  cat > /opt/gitops/config/development.env << 'EOL'
NODE_ENV=development
PORT=$API_PORT
DASHBOARD_PORT=$SERVICE_PORT
CORS_ENABLED=true
LOG_LEVEL=debug
AUDIT_HISTORY_PATH=/opt/gitops/audit-history
LOCAL_GIT_ROOT=/opt/git-repos
ENABLE_HOT_RELOAD=true
EOL

  # Create development git repository workspace
  mkdir -p /opt/git-repos
  
  # Set up development data directories
  mkdir -p /opt/gitops/audit-history
  mkdir -p /opt/gitops/logs
  mkdir -p /opt/gitops/npm_proxy_snapshot
"
msg_ok "Set up GitOps development environment"

msg_info "Creating development startup script"
pct exec $CTID -- bash -c "
cat > /opt/gitops/dev-start.sh << 'EOL'
#!/bin/bash
# GitOps Development Environment Startup Script

echo '🚀 Starting GitOps Development Environment...'

# Source development environment
source /opt/gitops/config/development.env

# Start API server in background
echo '📡 Starting API server on port $API_PORT...'
cd /opt/gitops/api
NODE_ENV=development PORT=$API_PORT node server.js &
API_PID=\$!
echo \"API server started with PID: \$API_PID\"

# Wait a moment for API to start
sleep 2

# Start dashboard development server
echo '🎨 Starting dashboard development server on port $SERVICE_PORT...'
cd /opt/gitops/dashboard
npm run dev -- --host 0.0.0.0 --port $SERVICE_PORT &
DASHBOARD_PID=\$!
echo \"Dashboard server started with PID: \$DASHBOARD_PID\"

echo '✅ Development environment started!'
echo \"📊 Dashboard: http://\$(hostname -I | awk '{print \$1}'):$SERVICE_PORT\"
echo \"📡 API: http://\$(hostname -I | awk '{print \$1}'):$API_PORT\"
echo \"🏠 Home Assistant workspace: /opt/hass-workspace\"
echo \"📁 Git repositories: /opt/git-repos\"
echo ''
echo '⏹️  To stop: pkill -f \"node server.js\" && pkill -f \"npm run dev\"'

# Keep script running
wait
EOL

chmod +x /opt/gitops/dev-start.sh
"
msg_ok "Created development startup script"

msg_info "Creating Home Assistant development helpers"
pct exec $CTID -- bash -c "
# Create HA config validation script
cat > /usr/local/bin/hass-validate << 'EOL'
#!/bin/bash
# Home Assistant Configuration Validation Script

if [ -z \"\$1\" ]; then
    echo \"Usage: hass-validate <config-directory>\"
    echo \"Example: hass-validate /opt/git-repos/home-assistant-config\"
    exit 1
fi

CONFIG_DIR=\"\$1\"

if [ ! -d \"\$CONFIG_DIR\" ]; then
    echo \"Error: Directory \$CONFIG_DIR does not exist\"
    exit 1
fi

echo \"🔍 Validating Home Assistant configuration in \$CONFIG_DIR\"

# Activate HA development environment
source /opt/hass-dev/bin/activate

# Run HA configuration check
echo \"📋 Running Home Assistant config check...\"
hass -c \"\$CONFIG_DIR\" --script check_config

# Run YAML linting
echo \"📝 Running YAML lint check...\"
find \"\$CONFIG_DIR\" -name \"*.yaml\" -o -name \"*.yml\" | xargs yamllint -c /opt/gitops/config/yamllint-config.yaml

echo \"✅ Validation complete\"
EOL

chmod +x /usr/local/bin/hass-validate

# Create yamllint configuration for HA
mkdir -p /opt/gitops/config
cat > /opt/gitops/config/yamllint-config.yaml << 'EOL'
extends: default
rules:
  line-length:
    max: 120
  indentation:
    spaces: 2
  truthy:
    allowed-values: ['true', 'false', 'on', 'off']
  comments:
    min-spaces-from-content: 1
EOL

# Create ESPHome development helper
cat > /usr/local/bin/esphome-dev << 'EOL'
#!/bin/bash
# ESPHome Development Helper

if [ -z \"\$1\" ]; then
    echo \"Usage: esphome-dev <command> [args]\"
    echo \"Commands:\"
    echo \"  validate <yaml-file>  - Validate ESPHome configuration\"
    echo \"  compile <yaml-file>   - Compile ESPHome firmware\"
    echo \"  logs <device>         - View device logs\"
    exit 1
fi

# Activate HA development environment
source /opt/hass-dev/bin/activate

case \"\$1\" in
    validate)
        esphome config \"\$2\"
        ;;
    compile)
        esphome compile \"\$2\"
        ;;
    logs)
        esphome logs \"\$2\"
        ;;
    *)
        echo \"Unknown command: \$1\"
        exit 1
        ;;
esac
EOL

chmod +x /usr/local/bin/esphome-dev
"
msg_ok "Created Home Assistant development helpers"

msg_info "Creating systemd services for development"
pct exec $CTID -- bash -c "
# Create API development service
cat > /etc/systemd/system/gitops-api-dev.service << 'EOL'
[Unit]
Description=GitOps API Development Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gitops/api
Environment=NODE_ENV=development
Environment=PORT=$API_PORT
Environment=CORS_ENABLED=true
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOL

# Create dashboard development service
cat > /etc/systemd/system/gitops-dashboard-dev.service << 'EOL'
[Unit]
Description=GitOps Dashboard Development Server
After=network.target gitops-api-dev.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gitops/dashboard
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port $SERVICE_PORT
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOL

systemctl daemon-reload
systemctl enable gitops-api-dev gitops-dashboard-dev
"
msg_ok "Created systemd services"

msg_info "Setting up development Git hooks and automation"
pct exec $CTID -- bash -c "
# Create auto-rebuild script for development
cat > /opt/gitops/dev-rebuild.sh << 'EOL'
#!/bin/bash
echo \"🔄 Rebuilding development environment...\"

cd /opt/gitops

# Pull latest changes
git pull

# Update API dependencies
cd api
npm install

# Update dashboard dependencies
cd ../dashboard
npm install

# Restart services if they're running
systemctl restart gitops-api-dev gitops-dashboard-dev 2>/dev/null || true

echo \"✅ Development environment rebuilt\"
EOL

chmod +x /opt/gitops/dev-rebuild.sh

# Set up Git hooks
echo '#!/bin/bash
/opt/gitops/dev-rebuild.sh' > /opt/gitops/.git/hooks/post-merge
chmod +x /opt/gitops/.git/hooks/post-merge

# Create convenient update script
ln -sf /opt/gitops/dev-rebuild.sh /usr/local/bin/gitops-dev-update
"
msg_ok "Set up development automation"

msg_info "Creating development workflow scripts"
pct exec $CTID -- bash -c "
# Create comprehensive development workflow script
cat > /usr/local/bin/gitops-dev-workflow << 'EOL'
#!/bin/bash
# GitOps Development Workflow Manager

case \"\$1\" in
    start)
        echo \"🚀 Starting GitOps development environment...\"
        systemctl start gitops-api-dev gitops-dashboard-dev
        sleep 3
        echo \"✅ Development environment started\"
        echo \"📊 Dashboard: http://\$(hostname -I | awk '{print \$1}'):$SERVICE_PORT\"
        echo \"📡 API: http://\$(hostname -I | awk '{print \$1}'):$API_PORT\"
        ;;
    stop)
        echo \"⏹️  Stopping GitOps development environment...\"
        systemctl stop gitops-api-dev gitops-dashboard-dev
        echo \"✅ Development environment stopped\"
        ;;
    restart)
        echo \"🔄 Restarting GitOps development environment...\"
        systemctl restart gitops-api-dev gitops-dashboard-dev
        sleep 3
        echo \"✅ Development environment restarted\"
        ;;
    status)
        echo \"📊 GitOps Development Environment Status:\"
        systemctl status gitops-api-dev gitops-dashboard-dev --no-pager
        ;;
    logs)
        case \"\$2\" in
            api)
                journalctl -u gitops-api-dev -f
                ;;
            dashboard)
                journalctl -u gitops-dashboard-dev -f
                ;;
            *)
                echo \"📋 Available log streams: api, dashboard\"
                echo \"Usage: gitops-dev-workflow logs <api|dashboard>\"
                ;;
        esac
        ;;
    audit)
        echo \"🔍 Running development audit...\"
        cd /opt/gitops
        bash scripts/sync_github_repos.sh --dev
        ;;
    hass-setup)
        echo \"🏠 Setting up Home Assistant development workspace...\"
        mkdir -p /opt/git-repos/home-assistant-config
        echo \"📁 Workspace created at /opt/git-repos/home-assistant-config\"
        echo \"💡 Use 'hass-validate /opt/git-repos/home-assistant-config' to validate configurations\"
        ;;
    *)
        echo \"GitOps Development Workflow Manager\"
        echo \"\"
        echo \"Commands:\"
        echo \"  start         - Start development environment\"
        echo \"  stop          - Stop development environment\"
        echo \"  restart       - Restart development environment\"
        echo \"  status        - Show service status\"
        echo \"  logs <stream> - Follow logs (api/dashboard)\"
        echo \"  audit         - Run development audit\"
        echo \"  hass-setup    - Set up Home Assistant workspace\"
        echo \"\"
        echo \"Development URLs:\"
        echo \"  Dashboard: http://\$(hostname -I | awk '{print \$1}'):$SERVICE_PORT\"
        echo \"  API: http://\$(hostname -I | awk '{print \$1}'):$API_PORT\"
        ;;
esac
EOL

chmod +x /usr/local/bin/gitops-dev-workflow
"
msg_ok "Created development workflow scripts"

msg_info "Starting development services"
pct exec $CTID -- systemctl start gitops-api-dev gitops-dashboard-dev
msg_ok "Started development services"

# Final output
IP=$(pct exec $CTID -- hostname -I | awk '{print $1}')
msg_ok "Completed Successfully!\n"
echo -e "${CREATING}${GN}${APP} setup completed!${CL}"
echo -e "${INFO}${YW} Development Environment Access:${CL}"
echo -e "${TAB}${GATEWAY}${BGN}Dashboard: http://${IP}:${SERVICE_PORT}${CL}"
echo -e "${TAB}${GATEWAY}${BGN}API: http://${IP}:${API_PORT}${CL}"
echo -e "${INFO}${YW} Development Tools:${CL}"
echo -e "${TAB}${GATEWAY}${BGN}gitops-dev-workflow - Main development commands${CL}"
echo -e "${TAB}${GATEWAY}${BGN}hass-validate - Home Assistant config validation${CL}"
echo -e "${TAB}${GATEWAY}${BGN}esphome-dev - ESPHome development tools${CL}"
echo -e "${TAB}${GATEWAY}${BGN}Home Assistant workspace: /opt/hass-workspace${CL}"