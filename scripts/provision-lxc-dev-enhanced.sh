#!/usr/bin/env bash

# Enhanced Development Environment for LXC 128
# Includes Home Assistant Core, ESPHome, and GitOps development tools

set -euo pipefail

# Configuration
CONTAINER_ID=128
CONTAINER_NAME="developmentenvironment"
GIT_REPO="https://github.com/festion/homelab-gitops-auditor.git"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
msg_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

msg_ok() {
    echo -e "${GREEN}[OK]${NC} $1"
}

msg_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

msg_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if container exists
if ! pct list | grep -q "^${CONTAINER_ID}"; then
    msg_error "LXC ${CONTAINER_ID} does not exist!"
    exit 1
fi

msg_info "Upgrading LXC ${CONTAINER_ID} to Enhanced Development Environment"

# Stop services
msg_info "Stopping existing services"
pct exec ${CONTAINER_ID} -- systemctl stop gitops-auditor 2>/dev/null || true
sleep 2
msg_ok "Services stopped"

# Update system
msg_info "Updating system packages"
pct exec ${CONTAINER_ID} -- bash -c "
    apt update >/dev/null 2>&1
    apt upgrade -y >/dev/null 2>&1
"
msg_ok "System updated"

# Install development dependencies
msg_info "Installing development dependencies"
pct exec ${CONTAINER_ID} -- bash -c "
    apt install -y git curl wget npm nodejs python3 python3-pip python3-venv \\
        nginx jq unzip zip vim nano htop net-tools \\
        build-essential python3-dev libyaml-dev \\
        sqlite3 libsqlite3-dev >/dev/null 2>&1
"
msg_ok "Development dependencies installed"

# Install Home Assistant Core
msg_info "Installing Home Assistant Core"
pct exec ${CONTAINER_ID} -- bash -c "
    # Create Home Assistant user
    useradd -rm homeassistant || true
    
    # Create Home Assistant virtual environment
    mkdir -p /opt/homeassistant
    python3 -m venv /opt/homeassistant/venv
    source /opt/homeassistant/venv/bin/activate
    
    # Install Home Assistant
    pip install --upgrade pip wheel >/dev/null 2>&1
    pip install homeassistant >/dev/null 2>&1
    
    # Create config directory
    mkdir -p /opt/hass-workspace
    chown -R homeassistant:homeassistant /opt/homeassistant /opt/hass-workspace
    
    # Create basic configuration
    cat > /opt/hass-workspace/configuration.yaml << 'EOF'
# Home Assistant Development Configuration

default_config:

# Enable development mode
logger:
  default: info
  logs:
    homeassistant.core: debug

http:
  server_port: 8123
  
# Development helpers
developer:

# Example automation for testing
automation:
  - alias: 'Development Test Automation'
    trigger:
      platform: time
      at: '12:00:00'
    action:
      service: persistent_notification.create
      data:
        message: 'Development environment is working!'
        title: 'Dev Test'
EOF
"
msg_ok "Home Assistant Core installed"

# Install ESPHome
msg_info "Installing ESPHome development tools"
pct exec ${CONTAINER_ID} -- bash -c "
    # Install ESPHome in separate venv
    python3 -m venv /opt/esphome
    source /opt/esphome/bin/activate
    pip install esphome >/dev/null 2>&1
    
    # Create ESPHome workspace
    mkdir -p /opt/esphome-workspace
    chown -R homeassistant:homeassistant /opt/esphome-workspace
    
    # Create example device config
    cat > /opt/esphome-workspace/example-device.yaml << 'EOF'
esphome:
  name: example-device
  platform: ESP8266
  board: d1_mini

wifi:
  ssid: \"YourWiFi\"
  password: \"YourPassword\"

# Enable logging
logger:

# Enable Home Assistant API
api:

ota:

web_server:
  port: 80

# Example sensor
sensor:
  - platform: dht
    pin: D2
    temperature:
      name: \"Temperature\"
    humidity:
      name: \"Humidity\"
    update_interval: 60s
EOF
"
msg_ok "ESPHome development tools installed"

# Setup GitOps development environment
msg_info "Setting up enhanced GitOps development environment"
pct exec ${CONTAINER_ID} -- bash -c "
    # Update existing GitOps installation
    cd /opt/gitops-auditor 2>/dev/null || {
        # Clone if not exists
        git clone ${GIT_REPO} /opt/gitops-auditor
        cd /opt/gitops-auditor
    }
    
    # Pull latest changes
    git pull origin main
    
    # Install/update API dependencies
    cd /opt/gitops-auditor/api
    npm install >/dev/null 2>&1
    
    # Install/update dashboard dependencies  
    cd /opt/gitops-auditor/dashboard
    npm install >/dev/null 2>&1
    npm run build >/dev/null 2>&1
    
    # Create development configuration
    cd /opt/gitops-auditor
    cat > .env.development << 'EOF'
NODE_ENV=development
PORT=3070
VITE_PORT=5173
CORS_ENABLED=true
LOG_LEVEL=debug
AUDIT_HISTORY_PATH=/opt/gitops-auditor/audit-history
LOCAL_GIT_ROOT=/opt/git-repos
ENABLE_HOT_RELOAD=true
HASS_CONFIG_PATH=/opt/hass-workspace
ESPHOME_CONFIG_PATH=/opt/esphome-workspace
EOF
    
    # Create development git workspace
    mkdir -p /opt/git-repos
    mkdir -p /opt/gitops-auditor/logs
"
msg_ok "GitOps development environment configured"

# Create development workflow tools
msg_info "Creating development workflow tools"
pct exec ${CONTAINER_ID} -- bash -c "
    # Create Home Assistant validation tool
    cat > /usr/local/bin/hass-validate << 'EOF'
#!/bin/bash
# Home Assistant Configuration Validator

source /opt/homeassistant/venv/bin/activate
cd /opt/hass-workspace

echo \"🏠 Validating Home Assistant configuration...\"
hass --script check_config -c /opt/hass-workspace

if [ \$? -eq 0 ]; then
    echo \"✅ Home Assistant configuration is valid\"
else
    echo \"❌ Home Assistant configuration has errors\"
    exit 1
fi
EOF
    chmod +x /usr/local/bin/hass-validate
    
    # Create ESPHome development tool
    cat > /usr/local/bin/esphome-dev << 'EOF'
#!/bin/bash
# ESPHome Development Tool

source /opt/esphome/bin/activate
cd /opt/esphome-workspace

case \"\$1\" in
    validate)
        echo \"🔧 Validating ESPHome configurations...\"
        for config in *.yaml; do
            if [ -f \"\$config\" ]; then
                echo \"Validating \$config...\"
                esphome config \"\$config\"
            fi
        done
        ;;
    compile)
        if [ -z \"\$2\" ]; then
            echo \"Usage: esphome-dev compile <device.yaml>\"
            exit 1
        fi
        echo \"🔨 Compiling \$2...\"
        esphome compile \"\$2\"
        ;;
    upload)
        if [ -z \"\$2\" ]; then
            echo \"Usage: esphome-dev upload <device.yaml>\"
            exit 1
        fi
        echo \"📤 Uploading \$2...\"
        esphome upload \"\$2\"
        ;;
    *)
        echo \"ESPHome Development Tool\"
        echo \"Commands: validate, compile <device>, upload <device>\"
        ;;
esac
EOF
    chmod +x /usr/local/bin/esphome-dev
    
    # Create main development workflow tool
    cat > /usr/local/bin/gitops-dev-workflow << 'EOF'
#!/bin/bash
# GitOps Development Workflow Manager

case \"\$1\" in
    start)
        echo \"🚀 Starting development environment...\"
        systemctl start gitops-auditor
        cd /opt/gitops-auditor/dashboard
        npm run dev &
        echo \"✅ Development environment started\"
        echo \"📊 Dashboard: http://\$(hostname -I | awk '{print \$1}'):5173\"
        echo \"📡 API: http://\$(hostname -I | awk '{print \$1}'):3070\"
        echo \"🏠 Home Assistant: http://\$(hostname -I | awk '{print \$1}'):8123\"
        ;;
    stop)
        echo \"⏹️  Stopping development environment...\"
        systemctl stop gitops-auditor
        pkill -f \"npm run dev\" 2>/dev/null || true
        echo \"✅ Development environment stopped\"
        ;;
    restart)
        echo \"🔄 Restarting development environment...\"
        \$0 stop
        sleep 2
        \$0 start
        ;;
    test)
        case \"\$2\" in
            hass)
                hass-validate
                ;;
            esphome)
                esphome-dev validate
                ;;
            all)
                echo \"🧪 Running all validation tests...\"
                hass-validate
                esphome-dev validate
                echo \"✅ All tests completed\"
                ;;
            *)
                echo \"🧪 Available tests: hass, esphome, all\"
                ;;
        esac
        ;;
    validate)
        echo \"🔍 Validating GitOps configurations...\"
        cd /opt/gitops-auditor
        if bash scripts/sync_github_repos.sh --dev; then
            echo \"✅ GitOps validation passed\"
        else
            echo \"❌ GitOps validation failed\"
        fi
        ;;
    logs)
        case \"\$2\" in
            api)
                journalctl -u gitops-auditor -f
                ;;
            hass)
                tail -f /opt/hass-workspace/home-assistant.log 2>/dev/null || echo \"No Home Assistant logs yet\"
                ;;
            dev)
                tail -f /opt/gitops-auditor/logs/*.log 2>/dev/null || echo \"No development logs yet\"
                ;;
            *)
                echo \"📋 Available logs: api, hass, dev\"
                ;;
        esac
        ;;
    status)
        echo \"📊 Development Environment Status:\"
        systemctl status gitops-auditor --no-pager
        echo \"\"
        echo \"🌐 Service Checks:\"
        curl -f http://localhost:3070/audit 2>/dev/null && echo \"✅ API: OK\" || echo \"❌ API: Failed\"
        curl -f http://localhost:5173 2>/dev/null && echo \"✅ Dashboard: OK\" || echo \"❌ Dashboard: Not Running\"
        ;;
    *)
        echo \"GitOps Enhanced Development Environment\"
        echo \"\"
        echo \"Commands:\"
        echo \"  start              - Start development services\"
        echo \"  stop               - Stop development services\"
        echo \"  restart            - Restart development services\"
        echo \"  test <type>        - Run tests (hass/esphome/all)\"
        echo \"  validate           - Validate GitOps configurations\"
        echo \"  logs <service>     - View logs (api/hass/dev)\"
        echo \"  status             - Show environment status\"
        echo \"\"
        echo \"Development Tools:\"
        echo \"  hass-validate      - Validate Home Assistant configs\"
        echo \"  esphome-dev        - ESPHome development commands\"
        echo \"\"
        echo \"Access URLs:\"
        echo \"  Dashboard: http://\$(hostname -I | awk '{print \$1}'):5173\"
        echo \"  API: http://\$(hostname -I | awk '{print \$1}'):3070\"
        echo \"  Home Assistant: http://\$(hostname -I | awk '{print \$1}'):8123\"
        ;;
esac
EOF
    chmod +x /usr/local/bin/gitops-dev-workflow
"
msg_ok "Development workflow tools created"

# Update systemd service
msg_info "Updating systemd service for development"
pct exec ${CONTAINER_ID} -- bash -c "
    cat > /etc/systemd/system/gitops-auditor.service << 'EOF'
[Unit]
Description=GitOps Auditor API Server (Development)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gitops-auditor/api
Environment=NODE_ENV=development
Environment=PORT=3070
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable gitops-auditor
"
msg_ok "Systemd service updated"

# Start services
msg_info "Starting development services"
pct exec ${CONTAINER_ID} -- systemctl start gitops-auditor
msg_ok "Development services started"

# Get container IP
IP=$(pct exec ${CONTAINER_ID} -- hostname -I | awk '{print $1}')

# Final message
echo -e "${GREEN}✅ Enhanced Development Environment Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}📊 Development Environment Access:${NC}"
echo -e "   Dashboard: http://${IP}:5173"
echo -e "   API: http://${IP}:3070"
echo -e "   Home Assistant: http://${IP}:8123"
echo ""
echo -e "${YELLOW}🛠️  Development Tools:${NC}"
echo -e "   gitops-dev-workflow - Main development commands"
echo -e "   hass-validate - Home Assistant config validation"
echo -e "   esphome-dev - ESPHome development tools"
echo ""
echo -e "${YELLOW}📁 Workspaces:${NC}"
echo -e "   GitOps: /opt/gitops-auditor"
echo -e "   Home Assistant: /opt/hass-workspace"
echo -e "   ESPHome: /opt/esphome-workspace"
echo ""
echo -e "${BLUE}💡 Quick Start:${NC}"
echo -e "   pct exec ${CONTAINER_ID} -- gitops-dev-workflow start"