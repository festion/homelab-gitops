# SPA Routing Configuration for GitOps Dashboard

This document explains how to properly configure SPA (Single Page Application) routing for the GitOps Dashboard with various server setups.

## The Problem

The GitOps Dashboard uses React Router for client-side routing. When a user navigates directly to a URL like `/audit/repository-name` or refreshes the page while on such a route, the server attempts to find a file at that path. Since no such file exists (the route is handled client-side), a 404 error occurs.

## Solution: Configure Server to Support SPA Routing

### Option 1: Standard Nginx Configuration

If you're running Nginx directly on your server:

```bash
# Install configuration
curl -s https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/fix-spa-routing.sh | bash
```

This script creates a configuration file at `/etc/nginx/conf.d/gitops-dashboard.conf` with proper routing rules.

### Option 2: Nginx Proxy Manager

If you're using Nginx Proxy Manager:

1. Log in to your NPM admin interface
2. Edit your GitOps Dashboard proxy host
3. Add this to the "Custom Configuration" section:

```nginx
# API endpoints - must be first to take precedence
location ~ ^/audit$ {
    proxy_pass http://your-server-ip:3070;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ~ ^/audit/diff/ {
    proxy_pass http://your-server-ip:3070;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ~ ^/audit/clone {
    proxy_pass http://your-server-ip:3070;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ~ ^/audit/delete {
    proxy_pass http://your-server-ip:3070;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ~ ^/audit/commit {
    proxy_pass http://your-server-ip:3070;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ~ ^/audit/discard {
    proxy_pass http://your-server-ip:3070;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# SPA routing
location / {
    try_files $uri $uri/ /index.html;
}
```

Replace `your-server-ip` with the actual IP address of your GitOps server.

### Option 3: Apache Configuration

If you're using Apache:

```apache
<VirtualHost *:8080>
    DocumentRoot /var/www/gitops-dashboard
    
    # API Proxy
    ProxyPass "/audit" "http://localhost:3070/audit"
    ProxyPassReverse "/audit" "http://localhost:3070/audit"
    
    # SPA Routing
    <Directory "/var/www/gitops-dashboard">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

Create a `.htaccess` file in your dashboard root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Important Note About API Routes

The configuration carefully distinguishes between:

1. **API endpoints** - Should be forwarded to the API server (port 3070)
   - `/audit` (data fetch endpoint)
   - `/audit/diff/repo-name` (diff API)
   - `/audit/clone`, `/audit/delete`, etc. (action APIs)

2. **SPA routes** - Should be handled by the React router
   - `/audit/repo-name` (repository view)
   - Any other client-side routes

## Testing Your Configuration

After applying the configuration:

1. Navigate directly to `http://your-domain/audit/repository-name`
2. Refresh the page while on this route
3. Use browser back/forward navigation

If any of these actions work, your SPA routing is correctly configured.

## Troubleshooting

If you encounter issues:

1. **404 errors on direct URL access**: Your SPA routing is not working
2. **API calls failing**: Check the proxy configuration for API endpoints
3. **Empty page**: Ensure your dashboard build is correctly deployed
4. **React errors in console**: Check for client-side routing issues