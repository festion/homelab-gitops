[Unit]
Description=GitOps Audit API Server
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/gitops/api/server.js
WorkingDirectory=/opt/gitops/api
Restart=always
RestartSec=10
Environment=NODE_ENV=production
User=root

[Install]
WantedBy=multi-user.target
