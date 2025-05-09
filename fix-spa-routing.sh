#!/bin/bash

# Exit on error
set -e

echo -e "\033[0;36mFixing SPA routing for GitOps Dashboard...\033[0m"

# Directory configuration
NGINX_CONF_DIR="/etc/nginx/conf.d"
DASHBOARD_ROOT="/var/www/gitops-dashboard"

# Create config directory if it doesn't exist
mkdir -p $NGINX_CONF_DIR
mkdir -p $DASHBOARD_ROOT

# Copy Nginx configuration
echo -e "\033[0;32mInstalling Nginx configuration...\033[0m"
cat > $NGINX_CONF_DIR/gitops-dashboard.conf << 'EOF'
server {
    listen 8080;
    
    root /var/www/gitops-dashboard;
    index index.html;
    
    # API endpoints - Forward to API server
    location ~ ^/audit$ {
        proxy_pass http://localhost:3070;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location ~ ^/audit/diff/ {
        proxy_pass http://localhost:3070;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location ~ ^/audit/clone {
        proxy_pass http://localhost:3070;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location ~ ^/audit/delete {
        proxy_pass http://localhost:3070;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location ~ ^/audit/commit {
        proxy_pass http://localhost:3070;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location ~ ^/audit/discard {
        proxy_pass http://localhost:3070;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # SPA routing - handle all client-side routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Create simple HTML fallback for testing routing
echo -e "\033[0;32mCreating fallback index file for testing...\033[0m"
if [ ! -f "$DASHBOARD_ROOT/index.html" ]; then
  cat > $DASHBOARD_ROOT/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>GitOps Dashboard SPA</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .success { background-color: #e6ffe6; border-color: #99cc99; }
    .info { background-color: #e6f7ff; border-color: #99ccff; }
    code { background: #f4f4f4; padding: 3px 5px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>GitOps Dashboard SPA Routing Test</h1>
  
  <div class="card success">
    <h2>✓ SPA Routing Configured</h2>
    <p>This page is being served for all routes, including <code>/audit/repository-name</code>.</p>
    <p>Current path: <code id="current-path"></code></p>
  </div>
  
  <div class="card info">
    <h2>ℹ️ Next Steps</h2>
    <p>Now you can:</p>
    <ol>
      <li>Update the dashboard from GitHub</li>
      <li>Ensure both API and dashboard services are running</li>
      <li>Navigate to repository-specific URLs</li>
    </ol>
  </div>

  <script>
    document.getElementById('current-path').textContent = window.location.pathname;
  </script>
</body>
</html>
EOF
fi

# Test if nginx is installed and running
if command -v nginx &> /dev/null; then
  echo -e "\033[0;32mTesting and reloading Nginx configuration...\033[0m"
  if nginx -t; then
    systemctl reload nginx
    echo -e "\033[0;32mNginx configuration reloaded successfully!\033[0m"
  else
    echo -e "\033[1;31mNginx configuration test failed. Please check the syntax.\033[0m"
    exit 1
  fi
else
  echo -e "\033[1;33mNginx not found. Configuration files were created but service was not reloaded.\033[0m"
  echo -e "If you're using Nginx Proxy Manager, add the following to your host's custom configuration:"
  echo -e "\033[0;33m"
  cat /mnt/c/GIT/homelab-gitops-auditor/npm-config.txt
  echo -e "\033[0m"
fi

echo -e "\033[0;32mSPA routing fix completed!\033[0m"
echo -e "You can test by navigating to: http://your-domain/audit/repository-name"
echo -e "Don't forget to restart your API service: systemctl restart gitops-audit-api.service"