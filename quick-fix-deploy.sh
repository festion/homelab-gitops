#!/bin/bash

# Exit on error
set -e

echo -e "\033[0;36mDeploying repository route fixes (quick mode)...\033[0m"

# Create a temporary directory
TMP_DIR=$(mktemp -d)
cd $TMP_DIR

# Clone the repository
echo -e "\033[0;36mDownloading latest code from GitHub...\033[0m"
git clone https://github.com/festion/homelab-gitops-auditor.git
cd homelab-gitops-auditor

# Only update the necessary files for the route fix
echo -e "\033[0;36mApplying only the essential fixes...\033[0m"

# 1. Fix the router.tsx file
echo -e "\033[0;32mPatching router.tsx with repository route...\033[0m"
cat > dashboard/src/router.tsx << 'EOF'
// File: dashboard/src/router.tsx

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import AuditPage from './pages/audit';
import Home from './pages/home';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SidebarLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'audit', element: <AuditPage /> },
      { path: 'audit/:repo', element: <AuditPage /> },
    ],
  },
]);

export default function RouterRoot() {
  return <RouterProvider router={router} />;
}
EOF

# 2. Fix the main.tsx file
echo -e "\033[0;32mPatching main.tsx to use router...\033[0m"
cat > dashboard/src/main.tsx << 'EOF'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './generated.css';

import RouterRoot from './router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterRoot />
  </StrictMode>,
)
EOF

# 3. Fix the audit.tsx file
echo -e "\033[0;32mPatching audit.tsx to use route parameters...\033[0m"
# Create a patch file
cat > audit.patch << 'EOF'
--- a/dashboard/src/pages/audit.tsx
+++ b/dashboard/src/pages/audit.tsx
@@ -1,6 +1,7 @@
 // File: dashboard/src/pages/audit.tsx

 import { useEffect, useState } from 'react';
+import { useParams, useSearchParams } from 'react-router-dom';
 import axios from 'axios';

 // Development configuration
@@ -36,9 +37,25 @@
 }

 const AuditPage = () => {
+  const { repo } = useParams();
+  const [searchParams] = useSearchParams();
+  const action = searchParams.get('action');
+  
   const [data, setData] = useState<AuditReport | null>(null);
   const [loading, setLoading] = useState(true);
   const [diffs, setDiffs] = useState<Record<string, string>>({});
+  const [expandedRepo, setExpandedRepo] = useState(repo || null);
+
+  // Handle repo parameter and action when component mounts or parameters change
+  useEffect(() => {
+    if (repo && data) {
+      setExpandedRepo(repo);
+      
+      // Auto-load diff when action is 'view' and repo status is 'dirty'
+      if (action === 'view') {
+        const repoData = data.repos.find(r => r.name === repo);
+        if (repoData && (repoData.status === 'dirty' || repoData.uncommittedChanges)) {
+          loadDiff(repo);
+        }
+      }
+    }
+  }, [repo, action, data]);

   useEffect(() => {
     const fetchAudit = () => {
EOF

# Apply the patch with some error handling (ignore if patch fails)
patch -p1 < audit.patch || echo -e "\033[1;33mWarning: Patch did not apply cleanly. Manual review may be needed.\033[0m"

# 4. Update the sync_github_repos.sh script
echo -e "\033[0;32mUpdating sync_github_repos.sh to use relative URLs...\033[0m"
sed -i 's|"http://gitopsdashboard.local/audit/$repo?action=view"|"/audit/$repo?action=view"|g' scripts/sync_github_repos.sh

# 5. Create .htaccess for SPA routing
echo -e "\033[0;32mCreating .htaccess for SPA routing...\033[0m"
mkdir -p production-fix/nginx
cat > production-fix/nginx/gitops-dashboard << 'EOF'
server {
    listen 80;
    server_name gitopsdashboard.local;

    root /var/www/gitops-dashboard;
    index index.html;

    # API proxy
    location /audit {
        try_files $uri @api_proxy;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy location
    location @api_proxy {
        proxy_pass http://localhost:3070;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Create deployment package
echo -e "\033[0;32mPreparing deployment package...\033[0m"
mkdir -p /opt/gitops/production-fix
cp -r production-fix/nginx /opt/gitops/production-fix/

# Regenerate JSON data
echo -e "\033[0;36mRegenerating JSON data with relative URLs...\033[0m"
cd /opt/gitops
if [ -f scripts/sync_github_repos.sh ]; then
  # First backup the original script
  cp scripts/sync_github_repos.sh scripts/sync_github_repos.sh.bak
  
  # Update the script with relative URLs
  sed -i 's|"http://gitopsdashboard.local/audit/$repo?action=view"|"/audit/$repo?action=view"|g' scripts/sync_github_repos.sh
  
  # Run the script to generate data with new URLs
  bash scripts/sync_github_repos.sh
fi

# Configure nginx
if [ -d /etc/nginx/sites-available ]; then
  echo -e "\033[0;32mConfiguring Nginx for SPA routing...\033[0m"
  cp /opt/gitops/production-fix/nginx/gitops-dashboard /etc/nginx/sites-available/
  ln -sf /etc/nginx/sites-available/gitops-dashboard /etc/nginx/sites-enabled/ 2>/dev/null || true
  nginx -t && systemctl reload nginx
else
  echo -e "\033[1;33mNginx configuration directory not found. Manual configuration needed.\033[0m"
fi

# Clean up
rm -rf $TMP_DIR

echo -e "\033[0;32mFix deployed! You should now restart your API service:\033[0m"
echo -e "  systemctl restart gitops-audit-api.service"