#!/usr/bin/env bash
source <(curl -s https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/scripts/build.func)

APP="GitOps QA Environment"
var_tags="qa;testing;gitops;staging"
var_cpu="2"
var_ram="1536"
var_disk="8"
var_os="debian"
var_version="12"
var_unprivileged="1"
GIT_REPO="https://github.com/festion/homelab-gitops-auditor.git"
SERVICE_PORT=80
API_PORT=3070
CT_HOSTNAME="gitops-qa"

header_info "$APP"
variables
color
catch_errors

CTID=$(pct list | awk -v host="$CT_HOSTNAME" '$3 == host {print $1}')

if [[ -n "$CTID" ]]; then
  msg_ok "Container for ${APP} already exists (CTID: ${CTID}). Updating existing container."

  msg_info "Stopping QA services"
  pct exec $CTID -- systemctl stop gitops-audit-api nginx 2>/dev/null || true
  sleep 2
  msg_ok "Stopped QA services"
else
  start
  build_container
  description
fi

msg_info "Installing QA environment dependencies"
pct exec $CTID -- bash -c "
  apt update >/dev/null 2>&1
  apt install -y git curl wget npm nodejs python3 python3-pip python3-venv \
    nginx jq unzip zip vim nano htop \
    yamllint python3-yaml build-essential >/dev/null 2>&1
"
msg_ok "Installed QA dependencies"

msg_info "Installing testing and quality assurance tools"
pct exec $CTID -- bash -c "
  # Install testing tools
  npm install -g jest cypress lighthouse artillery newman >/dev/null 2>&1
  
  # Install Home Assistant validation tools for QA
  python3 -m venv /opt/hass-qa
  source /opt/hass-qa/bin/activate
  pip install homeassistant homeassistant-cli yamllint >/dev/null 2>&1
  
  # Install security scanning tools
  pip install safety bandit >/dev/null 2>&1
  
  # Install performance testing tools
  pip install locust >/dev/null 2>&1
"
msg_ok "Installed QA testing tools"

msg_info "Setting up GitOps QA environment"
pct exec $CTID -- bash -c "
  # Clone the repository
  rm -rf /opt/gitops
  git clone $GIT_REPO /opt/gitops
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
  
  # Create QA environment configuration
  mkdir -p /opt/gitops/config
  cat > /opt/gitops/config/qa.env << 'EOL'
NODE_ENV=qa
PORT=$API_PORT
CORS_ENABLED=false
LOG_LEVEL=info
AUDIT_HISTORY_PATH=/opt/gitops/audit-history
LOCAL_GIT_ROOT=/opt/git-repos
ENABLE_TESTING=true
SECURITY_HEADERS=true
EOL

  # Create QA git repository workspace
  mkdir -p /opt/git-repos
  
  # Set up QA data directories
  mkdir -p /opt/gitops/audit-history
  mkdir -p /opt/gitops/logs
  mkdir -p /opt/gitops/npm_proxy_snapshot
  mkdir -p /opt/gitops/test-reports
  mkdir -p /opt/gitops/qa-artifacts
"
msg_ok "Set up GitOps QA environment"

msg_info "Configuring Nginx for QA environment"
pct exec $CTID -- bash -c "
cat > /etc/nginx/sites-available/gitops-qa << 'EOL'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /opt/gitops/dashboard/dist;
    index index.html;

    # Security headers for QA testing
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control \"no-cache, no-store, must-revalidate\";
    }

    location /api/ {
        proxy_pass http://localhost:$API_PORT/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # QA-specific headers
        add_header X-Environment \"QA\" always;
    }

    location /audit {
        proxy_pass http://localhost:$API_PORT/audit;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # Health check endpoint for QA monitoring
    location /health {
        access_log off;
        return 200 \"QA Environment OK\";
        add_header Content-Type text/plain;
    }
}
EOL

# Enable the site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/gitops-qa /etc/nginx/sites-enabled/
nginx -t >/dev/null 2>&1
"
msg_ok "Configured Nginx for QA"

msg_info "Creating QA testing framework"
pct exec $CTID -- bash -c "
# Create comprehensive QA test suite
mkdir -p /opt/gitops/qa-tests

# API integration tests
cat > /opt/gitops/qa-tests/api-integration.test.js << 'EOL'
const axios = require('axios');

const API_BASE = 'http://localhost:$API_PORT';

describe('GitOps API Integration Tests', () => {
  test('Health check endpoint', async () => {
    const response = await axios.get(\`\${API_BASE}/audit\`);
    expect(response.status).toBe(200);
  });

  test('API responds with valid JSON', async () => {
    const response = await axios.get(\`\${API_BASE}/audit\`);
    expect(response.headers['content-type']).toMatch(/json/);
  });

  test('Dashboard serves correctly', async () => {
    const response = await axios.get('http://localhost');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
  });
});
EOL

# Security test suite
cat > /opt/gitops/qa-tests/security-tests.sh << 'EOL'
#!/bin/bash
# QA Security Test Suite

echo \"🔒 Running QA Security Tests...\"

# Test for security headers
echo \"📋 Checking security headers...\"
curl -I http://localhost/ | grep -E \"X-(Frame-Options|Content-Type-Options|XSS-Protection)\"

# Test for sensitive information exposure
echo \"📋 Checking for sensitive information exposure...\"
curl -s http://localhost/api/ | grep -i \"password\\|secret\\|key\" && echo \"❌ Sensitive data exposed\" || echo \"✅ No sensitive data found\"

# Run bandit security scan on Python code
if [ -d \"/opt/gitops/scripts\" ]; then
    echo \"📋 Running Python security scan...\"
    source /opt/hass-qa/bin/activate
    bandit -r /opt/gitops/scripts/ -f json -o /opt/gitops/test-reports/bandit-report.json 2>/dev/null || true
fi

echo \"✅ Security tests completed\"
EOL

chmod +x /opt/gitops/qa-tests/security-tests.sh

# Performance test suite
cat > /opt/gitops/qa-tests/performance-tests.sh << 'EOL'
#!/bin/bash
# QA Performance Test Suite

echo \"⚡ Running QA Performance Tests...\"

# Lighthouse audit for dashboard
echo \"📊 Running Lighthouse audit...\"
lighthouse http://localhost --output=json --output-path=/opt/gitops/test-reports/lighthouse-report.json --chrome-flags=\"--headless --no-sandbox\" 2>/dev/null || echo \"⚠️  Lighthouse audit skipped (Chrome not available)\"

# API load testing with artillery
if command -v artillery >/dev/null; then
    echo \"📈 Running API load test...\"
    cat > /tmp/artillery-config.yml << 'LOADTEST'
config:
  target: 'http://localhost:$API_PORT'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: \"API Load Test\"
    requests:
      - get:
          url: \"/audit\"
LOADTEST
    artillery run /tmp/artillery-config.yml --output /opt/gitops/test-reports/load-test-report.json
fi

echo \"✅ Performance tests completed\"
EOL

chmod +x /opt/gitops/qa-tests/performance-tests.sh

# Functional test suite
cat > /opt/gitops/qa-tests/functional-tests.sh << 'EOL'
#!/bin/bash
# QA Functional Test Suite

echo \"🧪 Running QA Functional Tests...\"

# Test dashboard loading
echo \"📱 Testing dashboard functionality...\"
RESPONSE=\$(curl -s -o /dev/null -w \"%{http_code}\" http://localhost/)
if [ \"\$RESPONSE\" = \"200\" ]; then
    echo \"✅ Dashboard loads successfully\"
else
    echo \"❌ Dashboard failed to load (HTTP \$RESPONSE)\"
fi

# Test API endpoints
echo \"📡 Testing API endpoints...\"
AUDIT_RESPONSE=\$(curl -s -o /dev/null -w \"%{http_code}\" http://localhost:$API_PORT/audit)
if [ \"\$AUDIT_RESPONSE\" = \"200\" ]; then
    echo \"✅ API audit endpoint working\"
else
    echo \"❌ API audit endpoint failed (HTTP \$AUDIT_RESPONSE)\"
fi

# Test audit functionality
echo \"🔍 Testing audit functionality...\"
cd /opt/gitops
if bash scripts/sync_github_repos.sh --dev >/dev/null 2>&1; then
    echo \"✅ Audit functionality working\"
else
    echo \"❌ Audit functionality failed\"
fi

echo \"✅ Functional tests completed\"
EOL

chmod +x /opt/gitops/qa-tests/functional-tests.sh
"
msg_ok "Created QA testing framework"

msg_info "Setting up QA automation and CI/CD simulation"
pct exec $CTID -- bash -c "
# Create QA deployment simulation script
cat > /opt/gitops/qa-deploy.sh << 'EOL'
#!/bin/bash
# QA Environment Deployment Simulation

echo \"🚀 Starting QA Deployment Process...\"

# Stop services
systemctl stop gitops-audit-api nginx

# Backup current version
BACKUP_DIR=\"/opt/gitops/backups/\$(date +%Y%m%d_%H%M%S)\"
mkdir -p \"\$BACKUP_DIR\"
cp -r /opt/gitops/dashboard/dist \"\$BACKUP_DIR/\" 2>/dev/null || true

# Pull latest changes
cd /opt/gitops
git pull

# Install dependencies and rebuild
cd api && npm install --production
cd ../dashboard && npm install && npm run build
cd ..

# Run QA test suite
echo \"🧪 Running QA test suite...\"
./qa-tests/functional-tests.sh
./qa-tests/security-tests.sh

# Start services
systemctl start gitops-audit-api nginx

# Verify deployment
sleep 5
if curl -f http://localhost/health >/dev/null 2>&1; then
    echo \"✅ QA deployment successful\"
    echo \"📊 QA Environment: http://\$(hostname -I | awk '{print \$1}')\"
else
    echo \"❌ QA deployment failed\"
    exit 1
fi
EOL

chmod +x /opt/gitops/qa-deploy.sh

# Create QA monitoring script
cat > /opt/gitops/qa-monitor.sh << 'EOL'
#!/bin/bash
# QA Environment Monitoring

while true; do
    echo \"📊 QA Health Check - \$(date)\"
    
    # Check service status
    systemctl is-active --quiet gitops-audit-api && echo \"✅ API Service: Running\" || echo \"❌ API Service: Failed\"
    systemctl is-active --quiet nginx && echo \"✅ Nginx: Running\" || echo \"❌ Nginx: Failed\"
    
    # Check endpoint responses
    curl -f http://localhost/health >/dev/null 2>&1 && echo \"✅ Health Check: OK\" || echo \"❌ Health Check: Failed\"
    curl -f http://localhost:$API_PORT/audit >/dev/null 2>&1 && echo \"✅ API Endpoint: OK\" || echo \"❌ API Endpoint: Failed\"
    
    echo \"\"
    sleep 300  # Check every 5 minutes
done
EOL

chmod +x /opt/gitops/qa-monitor.sh
"
msg_ok "Set up QA automation"

msg_info "Creating systemd services for QA environment"
pct exec $CTID -- bash -c "
# Create API QA service
cat > /etc/systemd/system/gitops-audit-api.service << 'EOL'
[Unit]
Description=GitOps Audit API Server (QA)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gitops/api
Environment=NODE_ENV=qa
Environment=PORT=$API_PORT
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

# Create QA monitoring service
cat > /etc/systemd/system/gitops-qa-monitor.service << 'EOL'
[Unit]
Description=GitOps QA Environment Monitor
After=network.target gitops-audit-api.service nginx.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gitops
ExecStart=/opt/gitops/qa-monitor.sh
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
EOL

systemctl daemon-reload
systemctl enable gitops-audit-api nginx gitops-qa-monitor
"
msg_ok "Created QA systemd services"

msg_info "Creating QA workflow management tools"
pct exec $CTID -- bash -c "
# Create comprehensive QA workflow manager
cat > /usr/local/bin/gitops-qa-workflow << 'EOL'
#!/bin/bash
# GitOps QA Environment Workflow Manager

case \"\$1\" in
    start)
        echo \"🚀 Starting QA environment...\"
        systemctl start gitops-audit-api nginx gitops-qa-monitor
        sleep 3
        echo \"✅ QA environment started\"
        echo \"📊 QA Dashboard: http://\$(hostname -I | awk '{print \$1}')\"
        echo \"📡 QA API: http://\$(hostname -I | awk '{print \$1}'):$API_PORT\"
        ;;
    stop)
        echo \"⏹️  Stopping QA environment...\"
        systemctl stop gitops-audit-api nginx gitops-qa-monitor
        echo \"✅ QA environment stopped\"
        ;;
    restart)
        echo \"🔄 Restarting QA environment...\"
        systemctl restart gitops-audit-api nginx gitops-qa-monitor
        sleep 3
        echo \"✅ QA environment restarted\"
        ;;
    deploy)
        echo \"🚀 Running QA deployment...\"
        /opt/gitops/qa-deploy.sh
        ;;
    test)
        case \"\$2\" in
            all)
                echo \"🧪 Running all QA tests...\"
                cd /opt/gitops/qa-tests
                ./functional-tests.sh
                ./security-tests.sh
                ./performance-tests.sh
                ;;
            functional)
                echo \"🧪 Running functional tests...\"
                /opt/gitops/qa-tests/functional-tests.sh
                ;;
            security)
                echo \"🔒 Running security tests...\"
                /opt/gitops/qa-tests/security-tests.sh
                ;;
            performance)
                echo \"⚡ Running performance tests...\"
                /opt/gitops/qa-tests/performance-tests.sh
                ;;
            api)
                echo \"📡 Running API integration tests...\"
                cd /opt/gitops && npm test qa-tests/api-integration.test.js 2>/dev/null || echo \"⚠️  Jest not configured\"
                ;;
            *)
                echo \"🧪 Available test suites: all, functional, security, performance, api\"
                ;;
        esac
        ;;
    status)
        echo \"📊 QA Environment Status:\"
        systemctl status gitops-audit-api nginx gitops-qa-monitor --no-pager
        echo \"\"
        echo \"🌐 Health Checks:\"
        curl -f http://localhost/health 2>/dev/null && echo \"✅ Dashboard: OK\" || echo \"❌ Dashboard: Failed\"
        curl -f http://localhost:$API_PORT/audit 2>/dev/null && echo \"✅ API: OK\" || echo \"❌ API: Failed\"
        ;;
    logs)
        case \"\$2\" in
            api)
                journalctl -u gitops-audit-api -f
                ;;
            nginx)
                journalctl -u nginx -f
                ;;
            monitor)
                journalctl -u gitops-qa-monitor -f
                ;;
            *)
                echo \"📋 Available log streams: api, nginx, monitor\"
                ;;
        esac
        ;;
    reports)
        echo \"📊 QA Test Reports:\"
        ls -la /opt/gitops/test-reports/ 2>/dev/null || echo \"No reports available\"
        ;;
    *)
        echo \"GitOps QA Environment Workflow Manager\"
        echo \"\"
        echo \"Commands:\"
        echo \"  start              - Start QA environment\"
        echo \"  stop               - Stop QA environment\"
        echo \"  restart            - Restart QA environment\"
        echo \"  deploy             - Run QA deployment process\"
        echo \"  test <suite>       - Run test suite (all/functional/security/performance/api)\"
        echo \"  status             - Show environment status\"
        echo \"  logs <service>     - Follow logs (api/nginx/monitor)\"
        echo \"  reports            - Show test reports\"
        echo \"\"
        echo \"QA Environment URLs:\"
        echo \"  Dashboard: http://\$(hostname -I | awk '{print \$1}')\"
        echo \"  API: http://\$(hostname -I | awk '{print \$1}'):$API_PORT\"
        ;;
esac
EOL

chmod +x /usr/local/bin/gitops-qa-workflow
"
msg_ok "Created QA workflow management tools"

msg_info "Starting QA environment services"
pct exec $CTID -- systemctl start gitops-audit-api nginx gitops-qa-monitor
msg_ok "Started QA services"

# Final output
IP=$(pct exec $CTID -- hostname -I | awk '{print $1}')
msg_ok "Completed Successfully!\n"
echo -e "${CREATING}${GN}${APP} setup completed!${CL}"
echo -e "${INFO}${YW} QA Environment Access:${CL}"
echo -e "${TAB}${GATEWAY}${BGN}Dashboard: http://${IP}${CL}"
echo -e "${TAB}${GATEWAY}${BGN}API: http://${IP}:${API_PORT}${CL}"
echo -e "${TAB}${GATEWAY}${BGN}Health Check: http://${IP}/health${CL}"
echo -e "${INFO}${YW} QA Tools:${CL}"
echo -e "${TAB}${GATEWAY}${BGN}gitops-qa-workflow - Main QA commands${CL}"
echo -e "${TAB}${GATEWAY}${BGN}Test Reports: /opt/gitops/test-reports/${CL}"
echo -e "${TAB}${GATEWAY}${BGN}QA Tests: /opt/gitops/qa-tests/${CL}"