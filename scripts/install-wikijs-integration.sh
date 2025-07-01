#!/usr/bin/env bash

# WikiJS Integration Installer for GitOps Auditor
# Connects GitOps Auditor (LXC 123) to WikiJS Server (LXC 112)

set -euo pipefail

# Configuration
GITOPS_CONTAINER_ID=123
WIKIJS_CONTAINER_ID=112
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Helper functions
msg_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
msg_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
msg_error() { echo -e "${RED}[ERROR]${NC} $1"; }
msg_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Check if containers exist
if ! pct list | grep -q "^${GITOPS_CONTAINER_ID}"; then
    msg_error "GitOps Auditor container (LXC ${GITOPS_CONTAINER_ID}) not found!"
    exit 1
fi

if ! pct list | grep -q "^${WIKIJS_CONTAINER_ID}"; then
    msg_error "WikiJS container (LXC ${WIKIJS_CONTAINER_ID}) not found!"
    exit 1
fi

msg_info "Installing WikiJS Integration for GitOps Auditor"
msg_info "GitOps Auditor: LXC ${GITOPS_CONTAINER_ID}"
msg_info "WikiJS Server: LXC ${WIKIJS_CONTAINER_ID}"

# Get WikiJS container IP
WIKIJS_IP=$(pct exec ${WIKIJS_CONTAINER_ID} -- hostname -I | awk '{print $1}')
msg_ok "WikiJS Server IP: ${WIKIJS_IP}"

# Check WikiJS accessibility
msg_info "Testing WikiJS server connectivity"
if ! pct exec ${GITOPS_CONTAINER_ID} -- curl -f -s "http://${WIKIJS_IP}:3000" >/dev/null; then
    msg_warn "WikiJS server not accessible on port 3000, trying port 80"
    if ! pct exec ${GITOPS_CONTAINER_ID} -- curl -f -s "http://${WIKIJS_IP}" >/dev/null; then
        msg_error "WikiJS server not accessible on ${WIKIJS_IP}. Please check WikiJS is running in LXC ${WIKIJS_CONTAINER_ID}"
        exit 1
    fi
    WIKIJS_PORT=80
else
    WIKIJS_PORT=3000
fi
msg_ok "WikiJS server accessible on port ${WIKIJS_PORT}"

# Stop GitOps services
msg_info "Stopping GitOps Auditor services"
pct exec ${GITOPS_CONTAINER_ID} -- systemctl stop gitops-auditor 2>/dev/null || true
pct exec ${GITOPS_CONTAINER_ID} -- systemctl stop gitops-audit-api 2>/dev/null || true
sleep 2
msg_ok "Services stopped"

# Update GitOps Auditor with latest WikiJS integration
msg_info "Updating GitOps Auditor with WikiJS integration"
pct exec ${GITOPS_CONTAINER_ID} -- bash -c "
    cd /opt/gitops-auditor 2>/dev/null || cd /opt/gitops || {
        echo 'GitOps directory not found'
        exit 1
    }
    
    # Pull latest changes with WikiJS integration
    git pull origin main >/dev/null 2>&1 || {
        echo 'Git pull failed, continuing with existing code'
    }
    
    # Install dependencies including node-fetch for WikiJS API
    cd api
    npm install >/dev/null 2>&1
"
msg_ok "GitOps Auditor updated"

# Configure WikiJS integration
msg_info "Configuring WikiJS integration"
pct exec ${GITOPS_CONTAINER_ID} -- bash -c "
    # Determine GitOps directory
    if [ -d '/opt/gitops-auditor' ]; then
        GITOPS_DIR='/opt/gitops-auditor'
    elif [ -d '/opt/gitops' ]; then
        GITOPS_DIR='/opt/gitops'
    else
        echo 'GitOps directory not found'
        exit 1
    fi
    
    # Create WikiJS configuration
    cat > \${GITOPS_DIR}/.env.wikijs << 'EOF'
# WikiJS Integration Configuration
WIKIJS_URL=http://${WIKIJS_IP}:${WIKIJS_PORT}
WIKIJS_TOKEN=wikijs-integration-token-placeholder
NODE_ENV=production
ENABLE_WIKIJS_INTEGRATION=true
EOF

    # Update environment configuration
    cat > \${GITOPS_DIR}/.env << 'EOF'
NODE_ENV=production
PORT=3070
CORS_ENABLED=false
LOG_LEVEL=info
AUDIT_HISTORY_PATH=\${GITOPS_DIR}/audit-history
LOCAL_GIT_ROOT=/opt/git-repos
ENABLE_WIKIJS_INTEGRATION=true
WIKIJS_URL=http://${WIKIJS_IP}:${WIKIJS_PORT}
WIKIJS_TOKEN=wikijs-integration-token-placeholder
EOF
"
msg_ok "WikiJS integration configured"

# Update systemd service to load WikiJS environment
msg_info "Updating systemd service for WikiJS integration"
pct exec ${GITOPS_CONTAINER_ID} -- bash -c "
    # Determine GitOps directory
    if [ -d '/opt/gitops-auditor' ]; then
        GITOPS_DIR='/opt/gitops-auditor'
    elif [ -d '/opt/gitops' ]; then
        GITOPS_DIR='/opt/gitops'
    else
        echo 'GitOps directory not found'
        exit 1
    fi

    # Update or create systemd service with WikiJS integration
    cat > /etc/systemd/system/gitops-auditor.service << EOF
[Unit]
Description=GitOps Auditor API Server with WikiJS Integration
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=\${GITOPS_DIR}/api
EnvironmentFile=\${GITOPS_DIR}/.env
ExecStart=/usr/bin/node server-mcp.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable gitops-auditor
"
msg_ok "Systemd service updated"

# Create WikiJS management tools
msg_info "Creating WikiJS management tools"
pct exec ${GITOPS_CONTAINER_ID} -- bash -c "
    cat > /usr/local/bin/wikijs-integration << 'EOF'
#!/bin/bash
# WikiJS Integration Management Tool

WIKIJS_URL=\"http://${WIKIJS_IP}:${WIKIJS_PORT}\"

case \"\$1\" in
    status)
        echo \"📊 WikiJS Integration Status:\"
        systemctl status gitops-auditor --no-pager
        echo \"\"
        echo \"🌐 Connectivity Tests:\"
        curl -f \"\${WIKIJS_URL}\" >/dev/null 2>&1 && echo \"✅ WikiJS Server: OK\" || echo \"❌ WikiJS Server: Failed\"
        curl -f http://localhost:3070/wiki-agent/test-wikijs >/dev/null 2>&1 && echo \"✅ Integration API: OK\" || echo \"❌ Integration API: Failed\"
        ;;
    test)
        echo \"🔍 Testing WikiJS integration...\"
        curl -s http://localhost:3070/wiki-agent/test-wikijs | jq . 2>/dev/null || curl -s http://localhost:3070/wiki-agent/test-wikijs
        ;;
    discover)
        echo \"🔍 Discovering documents...\"
        curl -X POST http://localhost:3070/wiki-agent/discover
        ;;
    upload)
        if [ -z \"\$2\" ]; then
            echo \"📤 Uploading all ready documents...\"
            curl -X POST http://localhost:3070/wiki-agent/upload/batch \\
                -H \"Content-Type: application/json\" \\
                -d '{\"documentIds\": []}'
        else
            echo \"📤 Uploading document \$2...\"
            curl -X POST http://localhost:3070/wiki-agent/upload/\$2
        fi
        ;;
    docs)
        echo \"📋 Available documents:\"
        curl -s http://localhost:3070/wiki-agent/documents | jq . 2>/dev/null || curl -s http://localhost:3070/wiki-agent/documents
        ;;
    config)
        echo \"⚙️  WikiJS Integration Configuration:\"
        echo \"WikiJS URL: \${WIKIJS_URL}\"
        echo \"API Status: \$(systemctl is-active gitops-auditor)\"
        echo \"\"
        echo \"📝 To configure WikiJS API token:\"
        echo \"   1. Visit: \${WIKIJS_URL}\"
        echo \"   2. Login as administrator\"
        echo \"   3. Go to Administration → API Access\"
        echo \"   4. Create API key with write permissions\"
        echo \"   5. Run: wikijs-integration set-token YOUR_TOKEN_HERE\"
        ;;
    set-token)
        if [ -z \"\$2\" ]; then
            echo \"❌ Usage: wikijs-integration set-token YOUR_TOKEN_HERE\"
            exit 1
        fi
        echo \"🔑 Setting WikiJS API token...\"
        
        # Determine GitOps directory
        if [ -d '/opt/gitops-auditor' ]; then
            GITOPS_DIR='/opt/gitops-auditor'
        elif [ -d '/opt/gitops' ]; then
            GITOPS_DIR='/opt/gitops'
        else
            echo '❌ GitOps directory not found'
            exit 1
        fi
        
        # Update token in environment file
        sed -i \"s/WIKIJS_TOKEN=.*/WIKIJS_TOKEN=\$2/\" \${GITOPS_DIR}/.env
        sed -i \"s/wikijs-integration-token-placeholder/\$2/\" \${GITOPS_DIR}/.env
        
        # Restart service to apply new token
        systemctl restart gitops-auditor
        sleep 3
        
        echo \"✅ WikiJS API token updated and service restarted\"
        echo \"🔍 Testing connection...\"
        sleep 2
        curl -s http://localhost:3070/wiki-agent/test-wikijs | grep -q '\"success\":true' && echo \"✅ WikiJS connection successful\" || echo \"❌ WikiJS connection failed\"
        ;;
    logs)
        echo \"📋 GitOps Auditor logs:\"
        journalctl -u gitops-auditor -f
        ;;
    restart)
        echo \"🔄 Restarting WikiJS integration...\"
        systemctl restart gitops-auditor
        sleep 3
        echo \"✅ Service restarted\"
        ;;
    *)
        echo \"WikiJS Integration Management Tool\"
        echo \"\"
        echo \"Commands:\"
        echo \"  status              - Show integration status\"
        echo \"  test                - Test WikiJS connection\"
        echo \"  config              - Show configuration and setup instructions\"
        echo \"  set-token <token>   - Set WikiJS API token\"
        echo \"  discover            - Discover documents for upload\"
        echo \"  docs                - List available documents\"
        echo \"  upload [doc_id]     - Upload documents (all or specific)\"
        echo \"  logs                - View service logs\"
        echo \"  restart             - Restart integration service\"
        echo \"\"
        echo \"WikiJS Server: \${WIKIJS_URL}\"
        echo \"API Endpoint: http://\$(hostname -I | awk '{print \$1}'):3070\"
        ;;
esac
EOF

    chmod +x /usr/local/bin/wikijs-integration
"
msg_ok "WikiJS management tools created"

# Start services
msg_info "Starting GitOps Auditor with WikiJS integration"
pct exec ${GITOPS_CONTAINER_ID} -- systemctl start gitops-auditor
sleep 5
msg_ok "GitOps Auditor started"

# Test basic connectivity
msg_info "Testing WikiJS integration"
if pct exec ${GITOPS_CONTAINER_ID} -- curl -f http://localhost:3070/wiki-agent/status >/dev/null 2>&1; then
    msg_ok "GitOps Auditor API responding"
else
    msg_warn "GitOps Auditor API not responding yet, may need more time to start"
fi

# Get GitOps container IP
GITOPS_IP=$(pct exec ${GITOPS_CONTAINER_ID} -- hostname -I | awk '{print $1}')

# Final setup instructions
echo ""
echo -e "${GREEN}✅ WikiJS Integration Installation Complete!${NC}"
echo ""
echo -e "${YELLOW}📊 Access Information:${NC}"
echo -e "   GitOps Auditor: http://${GITOPS_IP}:3070"
echo -e "   WikiJS Server: http://${WIKIJS_IP}:${WIKIJS_PORT}"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo -e "   1. Configure WikiJS API token:"
echo -e "      ${BLUE}pct exec ${GITOPS_CONTAINER_ID} -- wikijs-integration config${NC}"
echo -e "   2. Test the integration:"
echo -e "      ${BLUE}pct exec ${GITOPS_CONTAINER_ID} -- wikijs-integration test${NC}"
echo -e "   3. Upload documents:"
echo -e "      ${BLUE}pct exec ${GITOPS_CONTAINER_ID} -- wikijs-integration discover${NC}"
echo -e "      ${BLUE}pct exec ${GITOPS_CONTAINER_ID} -- wikijs-integration upload${NC}"
echo ""
echo -e "${BLUE}💡 Management Commands:${NC}"
echo -e "   ${BLUE}pct exec ${GITOPS_CONTAINER_ID} -- wikijs-integration status${NC}    # Check status"
echo -e "   ${BLUE}pct exec ${GITOPS_CONTAINER_ID} -- wikijs-integration --help${NC}     # Show all commands"
echo ""
echo -e "${GREEN}🎉 WikiJS integration is ready! Configure your API token to start uploading documents.${NC}"