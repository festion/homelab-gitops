#!/usr/bin/env bash

# QA Environment for LXC 129
# Comprehensive testing framework for GitOps auditor

set -euo pipefail

# Configuration
CONTAINER_ID=129
CONTAINER_NAME="gitops-qa"
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

# Check if container exists, create if not
if pct list | grep -q "^${CONTAINER_ID}"; then
    msg_info "Updating existing LXC ${CONTAINER_ID}"
    pct exec ${CONTAINER_ID} -- systemctl stop nginx 2>/dev/null || true
    pct exec ${CONTAINER_ID} -- systemctl stop gitops-audit-api 2>/dev/null || true
else
    msg_info "Creating new LXC ${CONTAINER_ID} for QA environment"
    pct create ${CONTAINER_ID} /var/lib/vz/template/cache/debian-12-standard_12.8-1_amd64.tar.zst \
        --hostname ${CONTAINER_NAME} \
        --cores 2 \
        --memory 1536 \
        --rootfs local-lvm:8 \
        --net0 name=eth0,bridge=vmbr0,ip=dhcp \
        --unprivileged 1 \
        --features nesting=1 \
        --start
    sleep 10
fi

# Start container if not running
if ! pct status ${CONTAINER_ID} | grep -q "running"; then
    pct start ${CONTAINER_ID}
    sleep 10
fi

# Update system
msg_info "Updating system packages"
pct exec ${CONTAINER_ID} -- bash -c "
    apt update >/dev/null 2>&1
    apt upgrade -y >/dev/null 2>&1
"
msg_ok "System updated"

# Install QA dependencies
msg_info "Installing QA environment dependencies"
pct exec ${CONTAINER_ID} -- bash -c "
    apt install -y git curl wget npm nodejs python3 python3-pip python3-venv \\
        nginx jq unzip zip vim nano htop net-tools \\
        build-essential >/dev/null 2>&1
"
msg_ok "QA dependencies installed"

# Install testing tools
msg_info "Installing testing and QA tools"
pct exec ${CONTAINER_ID} -- bash -c "
    # Install global testing tools
    npm install -g jest artillery newman >/dev/null 2>&1
    
    # Install Python QA tools
    python3 -m venv /opt/qa-tools
    source /opt/qa-tools/bin/activate
    pip install pytest bandit safety yamllint >/dev/null 2>&1
"
msg_ok "Testing tools installed"

# Setup GitOps QA environment
msg_info "Setting up GitOps QA environment"
pct exec ${CONTAINER_ID} -- bash -c "
    # Clone repository
    rm -rf /opt/gitops
    git clone ${GIT_REPO} /opt/gitops
    cd /opt/gitops
    
    # Install API dependencies (production mode)
    cd api
    npm install --production >/dev/null 2>&1
    cd ..
    
    # Install and build dashboard (production mode)
    cd dashboard
    npm install >/dev/null 2>&1
    npm run build >/dev/null 2>&1
    cd ..
    
    # Create QA configuration
    mkdir -p /opt/gitops/config
    cat > /opt/gitops/config/qa.env << 'EOF'
NODE_ENV=qa
PORT=3070
CORS_ENABLED=false
LOG_LEVEL=info
AUDIT_HISTORY_PATH=/opt/gitops/audit-history
LOCAL_GIT_ROOT=/opt/git-repos
ENABLE_TESTING=true
SECURITY_HEADERS=true
EOF

    # Create QA workspace
    mkdir -p /opt/git-repos
    mkdir -p /opt/gitops/audit-history
    mkdir -p /opt/gitops/logs
    mkdir -p /opt/gitops/test-reports
"
msg_ok "GitOps QA environment configured"

# Configure Nginx for QA
msg_info "Configuring Nginx for QA environment"
pct exec ${CONTAINER_ID} -- bash -c "
cat > /etc/nginx/sites-available/gitops-qa << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /opt/gitops/dashboard/dist;
    index index.html;

    # Security headers for QA
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control \"no-cache, no-store, must-revalidate\";
    }

    location /api/ {
        proxy_pass http://localhost:3070/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        add_header X-Environment \"QA\" always;
    }

    location /health {
        access_log off;
        return 200 \"QA Environment OK\";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/gitops-qa /etc/nginx/sites-enabled/
nginx -t >/dev/null 2>&1
"
msg_ok "Nginx configured for QA"

# Create QA testing framework
msg_info "Creating QA testing framework"
pct exec ${CONTAINER_ID} -- bash -c "
# Create QA test directory
mkdir -p /opt/gitops/qa-tests

# Create functional test script
cat > /opt/gitops/qa-tests/functional-tests.sh << 'EOF'
#!/bin/bash
echo \"🧪 Running QA Functional Tests...\"

# Test dashboard loading
RESPONSE=\$(curl -s -o /dev/null -w \"%{http_code}\" http://localhost/)
if [ \"\$RESPONSE\" = \"200\" ]; then
    echo \"✅ Dashboard loads successfully\"
else
    echo \"❌ Dashboard failed (HTTP \$RESPONSE)\"
fi

# Test API endpoints
AUDIT_RESPONSE=\$(curl -s -o /dev/null -w \"%{http_code}\" http://localhost:3070/audit)
if [ \"\$AUDIT_RESPONSE\" = \"200\" ]; then
    echo \"✅ API working\"
else
    echo \"❌ API failed (HTTP \$AUDIT_RESPONSE)\"
fi

echo \"✅ Functional tests completed\"
EOF

# Create security test script
cat > /opt/gitops/qa-tests/security-tests.sh << 'EOF'
#!/bin/bash
echo \"🔒 Running QA Security Tests...\"

# Check security headers
curl -I http://localhost/ | grep -E \"X-(Frame-Options|Content-Type-Options|XSS-Protection)\" >/dev/null
if [ \$? -eq 0 ]; then
    echo \"✅ Security headers present\"
else
    echo \"❌ Security headers missing\"
fi

# Check for sensitive data exposure
curl -s http://localhost/api/ | grep -i \"password\\|secret\\|key\" >/dev/null
if [ \$? -eq 0 ]; then
    echo \"❌ Sensitive data exposed\"
else
    echo \"✅ No sensitive data found\"
fi

echo \"✅ Security tests completed\"
EOF

chmod +x /opt/gitops/qa-tests/*.sh
"
msg_ok "QA testing framework created"

# Create QA workflow manager
msg_info "Creating QA workflow management tools"
pct exec ${CONTAINER_ID} -- bash -c "
cat > /usr/local/bin/gitops-qa-workflow << 'EOF'
#!/bin/bash
# GitOps QA Environment Workflow Manager

case \"\$1\" in
    start)
        echo \"🚀 Starting QA environment...\"
        systemctl start gitops-audit-api nginx
        sleep 3
        echo \"✅ QA environment started\"
        echo \"📊 QA Dashboard: http://\$(hostname -I | awk '{print \$1}')\"
        echo \"📡 QA API: http://\$(hostname -I | awk '{print \$1}'):3070\"
        ;;
    stop)
        echo \"⏹️  Stopping QA environment...\"
        systemctl stop gitops-audit-api nginx
        echo \"✅ QA environment stopped\"
        ;;
    restart)
        echo \"🔄 Restarting QA environment...\"
        systemctl restart gitops-audit-api nginx
        sleep 3
        echo \"✅ QA environment restarted\"
        ;;
    test)
        case \"\$2\" in
            all)
                echo \"🧪 Running all QA tests...\"
                /opt/gitops/qa-tests/functional-tests.sh
                /opt/gitops/qa-tests/security-tests.sh
                ;;
            functional)
                /opt/gitops/qa-tests/functional-tests.sh
                ;;
            security)
                /opt/gitops/qa-tests/security-tests.sh
                ;;
            *)
                echo \"🧪 Available tests: all, functional, security\"
                ;;
        esac
        ;;
    status)
        echo \"📊 QA Environment Status:\"
        systemctl status gitops-audit-api nginx --no-pager
        echo \"\"
        echo \"🌐 Health Checks:\"
        curl -f http://localhost/health 2>/dev/null && echo \"✅ Dashboard: OK\" || echo \"❌ Dashboard: Failed\"
        curl -f http://localhost:3070/audit 2>/dev/null && echo \"✅ API: OK\" || echo \"❌ API: Failed\"
        ;;
    logs)
        case \"\$2\" in
            api)
                journalctl -u gitops-audit-api -f
                ;;
            nginx)
                journalctl -u nginx -f
                ;;
            *)
                echo \"📋 Available logs: api, nginx\"
                ;;
        esac
        ;;
    *)
        echo \"GitOps QA Environment Workflow Manager\"
        echo \"\"
        echo \"Commands:\"
        echo \"  start              - Start QA environment\"
        echo \"  stop               - Stop QA environment\"
        echo \"  restart            - Restart QA environment\"
        echo \"  test <suite>       - Run test suite (all/functional/security)\"
        echo \"  status             - Show environment status\"
        echo \"  logs <service>     - Follow logs (api/nginx)\"
        echo \"\"
        echo \"QA Environment URLs:\"
        echo \"  Dashboard: http://\$(hostname -I | awk '{print \$1}')\"
        echo \"  API: http://\$(hostname -I | awk '{print \$1}'):3070\"
        ;;
esac
EOF

chmod +x /usr/local/bin/gitops-qa-workflow
"
msg_ok "QA workflow tools created"

# Create systemd services
msg_info "Creating systemd services for QA environment"
pct exec ${CONTAINER_ID} -- bash -c "
# Create API QA service
cat > /etc/systemd/system/gitops-audit-api.service << 'EOF'
[Unit]
Description=GitOps Audit API Server (QA)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gitops/api
Environment=NODE_ENV=qa
Environment=PORT=3070
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable gitops-audit-api nginx
"
msg_ok "Systemd services created"

# Start services
msg_info "Starting QA environment services"
pct exec ${CONTAINER_ID} -- systemctl start gitops-audit-api nginx
msg_ok "QA services started"

# Get container IP
IP=$(pct exec ${CONTAINER_ID} -- hostname -I | awk '{print $1}')

# Final message
echo -e "${GREEN}✅ QA Environment Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}📊 QA Environment Access:${NC}"
echo -e "   Dashboard: http://${IP}"
echo -e "   API: http://${IP}:3070"
echo -e "   Health Check: http://${IP}/health"
echo ""
echo -e "${YELLOW}🛠️  QA Tools:${NC}"
echo -e "   gitops-qa-workflow - Main QA commands"
echo -e "   Test Reports: /opt/gitops/test-reports/"
echo -e "   QA Tests: /opt/gitops/qa-tests/"
echo ""
echo -e "${BLUE}💡 Quick Start:${NC}"
echo -e "   pct exec ${CONTAINER_ID} -- gitops-qa-workflow test all"