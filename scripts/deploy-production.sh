#!/bin/bash
set -euo pipefail
# ------------------------------------------------------------------
# Production Deployment Script for GitOps Auditor
# Uses configurable production server settings
# ------------------------------------------------------------------

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-loader.sh"
load_config

PRODUCTION_IP="${PRODUCTION_SERVER_IP}"
PRODUCTION_USER="${PRODUCTION_SERVER_USER}"
PRODUCTION_PATH="${PRODUCTION_BASE_PATH}"
LOCAL_PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying GitOps Auditor to Production Server: $PRODUCTION_IP"
echo "📁 Target path: $PRODUCTION_PATH"
echo "👤 User: $PRODUCTION_USER"

# Validate configuration first
if ! validate_config; then
    echo "❌ Configuration validation failed. Please check your settings."
    exit 1
fi

# Check if we can reach the production server
echo "📡 Testing connection to production server..."
if ! ping -c 1 "$PRODUCTION_IP" >/dev/null 2>&1; then
    echo "❌ Cannot reach production server at $PRODUCTION_IP"
    exit 1
fi

# Build dashboard for production
echo "🔨 Building dashboard for production..."
cd "$LOCAL_PROJECT_ROOT/dashboard"
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
cd "$LOCAL_PROJECT_ROOT"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="gitops_deploy_${TIMESTAMP}.tar.gz"

tar -czf "$PACKAGE_NAME" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude="*.log" \
    --exclude=audit-history \
    --exclude=npm_proxy_snapshot \
    dashboard/dist/ \
    api/ \
    scripts/ \
    *.md \
    package*.json

echo "📤 Uploading package to production server..."
scp "$PACKAGE_NAME" "$PRODUCTION_USER@$PRODUCTION_IP:/tmp/"

echo "🔧 Installing on production server..."
ssh "$PRODUCTION_USER@$PRODUCTION_IP" << EOF
    set -e
    
    # Create backup of existing installation
    if [ -d "$PRODUCTION_PATH" ]; then
        cp -r "$PRODUCTION_PATH" "/tmp/gitops_backup_$TIMESTAMP"
        echo "📋 Backup created at /tmp/gitops_backup_$TIMESTAMP"
    fi
    
    # Create production directory
    mkdir -p "$PRODUCTION_PATH"
    cd "$PRODUCTION_PATH"
    
    # Extract new package
    tar -xzf "/tmp/$PACKAGE_NAME"
    
    # Install API dependencies
    cd api && npm ci --only=production
    
    # Set up systemd service for API
    cat > /etc/systemd/system/gitops-audit-api.service << EOL
[Unit]
Description=GitOps Audit API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PRODUCTION_PATH/api
Environment=NODE_ENV=production
Environment=PORT=$DEVELOPMENT_API_PORT
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

    # Enable and start service
    systemctl daemon-reload
    systemctl enable gitops-audit-api
    systemctl restart gitops-audit-api
    
    # Configure Nginx
    cat > /etc/nginx/sites-available/gitops-audit << EOL
server {
    listen 80;
    server_name $PRODUCTION_IP gitopsdashboard.local;
    
    # Dashboard static files
    location / {
        root $PRODUCTION_PATH/dashboard/dist;
        try_files \\\$uri \\\$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:$DEVELOPMENT_API_PORT/;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }
    
    # Direct audit endpoint proxy
    location /audit {
        proxy_pass http://localhost:$DEVELOPMENT_API_PORT/audit;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
    }
}
EOL

    # Enable site and restart Nginx
    ln -sf /etc/nginx/sites-available/gitops-audit /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    
    # Set up cron job for comprehensive audit
    echo "$AUDIT_SCHEDULE $PRODUCTION_PATH/scripts/comprehensive_audit.sh" | crontab -
    
    # Make scripts executable
    chmod +x $PRODUCTION_PATH/scripts/*.sh
    
    # Create necessary directories
    mkdir -p "$PRODUCTION_PATH/audit-history"
    mkdir -p "$PRODUCTION_PATH/logs"
    
    echo "✅ Deployment completed successfully"
EOF

# Clean up local package
rm "$PACKAGE_NAME"

echo ""
echo "🎉 Deployment Complete!"
echo "📍 Production Dashboard: http://$PRODUCTION_IP/"
echo "📍 API Endpoint: http://$PRODUCTION_IP:$DEVELOPMENT_API_PORT/audit"
echo "📍 SSH Access: ssh $PRODUCTION_USER@$PRODUCTION_IP"
echo ""
echo "🔍 Service Status Commands:"
echo "  systemctl status gitops-audit-api"
echo "  systemctl status nginx"
echo "  curl http://$PRODUCTION_IP/audit"
echo ""
echo "📋 Next Steps:"
echo "  1. Verify dashboard loads: http://$PRODUCTION_IP/"
echo "  2. Run comprehensive audit: ssh $PRODUCTION_USER@$PRODUCTION_IP '$PRODUCTION_PATH/scripts/comprehensive_audit.sh'"
echo "  3. Check logs: ssh $PRODUCTION_USER@$PRODUCTION_IP 'journalctl -u gitops-audit-api -f'"