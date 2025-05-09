#!/bin/bash

# Exit on error
set -e

echo -e "\033[0;36mDeploying repository route fixes...\033[0m"

# Build the dashboard
echo -e "\033[0;36mBuilding dashboard...\033[0m"
cd dashboard
npm run build

# Create .htaccess for Apache/Nginx compatibility
echo -e "\033[0;36mCreating .htaccess for SPA routing...\033[0m"
cat > dist/.htaccess << EOF
# Handle SPA routes
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF

echo -e "\033[0;36mCopying dashboard files to deployment location...\033[0m"
# Update this path to match your actual deployment path
DEPLOY_PATH="/var/www/gitops-dashboard" 

# Check if running as root or if we have sudo access
if [ "$(id -u)" = "0" ]; then
  mkdir -p $DEPLOY_PATH
  cp -r dist/* $DEPLOY_PATH/
  echo "Creating Nginx configuration for HTML5 History mode"
  cat > /etc/nginx/sites-available/gitops-dashboard << EOF
server {
    listen 80;
    server_name gitopsdashboard.local;

    root /var/www/gitops-dashboard;
    index index.html;

    # API proxy
    location /audit {
        # First check if this is an API endpoint
        try_files \$uri @api_proxy;
    }

    # SPA routing - serve index.html for any non-file routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy location
    location @api_proxy {
        proxy_pass http://localhost:3070;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF
  ln -sf /etc/nginx/sites-available/gitops-dashboard /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
else
  echo -e "\033[1;33mWARNING: Not running as root. Dashboard files were built but not deployed.\033[0m"
  echo -e "Please manually copy the 'dashboard/dist/' directory to your production location."
  echo -e "You will also need to configure your web server to handle HTML5 History API routing."
fi

# Update JSON generation script
cd ..
echo -e "\033[0;36mUpdating sync_github_repos.sh script...\033[0m"
if grep -q "dashboard_link.*gitopsdashboard.local" scripts/sync_github_repos.sh; then
  # Replace absolute URLs with relative URLs
  sed -i 's|"http://gitopsdashboard.local/audit/\$repo?action=view"|"/audit/\$repo?action=view"|g' scripts/sync_github_repos.sh
  echo -e "\033[0;32mUpdated dashboard links in sync script to use relative URLs\033[0m"
fi

# Regenerate JSON data
echo -e "\033[0;36mRegenerating JSON data...\033[0m"
if [ -f scripts/sync_github_repos.sh ]; then
  # Use --dev flag in development or run normally in production
  if [ "$NODE_ENV" = "development" ]; then
    bash scripts/sync_github_repos.sh --dev
  else
    bash scripts/sync_github_repos.sh
  fi
fi

echo -e "\033[0;32mDone! You should now restart your API service:\033[0m"
echo -e "  systemctl restart gitops-audit-api.service"

echo -e "\033[0;33mTesting information:\033[0m"
echo -e "- Development URL: http://localhost:5173/audit/YOUR-REPO?action=view"
echo -e "- Production URL: http://gitopsdashboard.local/audit/YOUR-REPO?action=view"