#!/bin/bash
set -e

# Configuration
PRODUCTION_DIR="/opt/gitops"
DASHBOARD_BUILD_DIR="dashboard/dist"
API_DIR="api"
LOG_DIR="logs"
SCRIPTS_DIR="scripts"
API_PORT=3070 # Default port

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --port=*)
      API_PORT="${1#*=}"
      shift
      ;;
    --no-nginx)
      NO_NGINX=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--port=NUMBER] [--no-nginx]"
      exit 1
      ;;
  esac
done

echo "==== GitOps Dashboard Manual Deployment ===="
echo "This script will prepare files for manual deployment."
echo "API Port: $API_PORT"
echo "Nginx Included: ${NO_NGINX:+No}${NO_NGINX:-Yes}"

# Create deployment directory
DEPLOY_PACKAGE="gitops_deploy_$(date +%Y%m%d_%H%M%S)"
mkdir -p "${DEPLOY_PACKAGE}"
mkdir -p "${DEPLOY_PACKAGE}/dashboard"
mkdir -p "${DEPLOY_PACKAGE}/api"
mkdir -p "${DEPLOY_PACKAGE}/scripts"
mkdir -p "${DEPLOY_PACKAGE}/logs"

# Copy built dashboard files
echo "Copying dashboard files..."
cp -r "${DASHBOARD_BUILD_DIR}/"* "${DEPLOY_PACKAGE}/dashboard/"

# Copy API files
echo "Copying API files..."
cp -r "${API_DIR}/"* "${DEPLOY_PACKAGE}/api/"

# Copy scripts
echo "Copying scripts..."
cp -r "${SCRIPTS_DIR}/"* "${DEPLOY_PACKAGE}/scripts/"

# Create install script
cat > "${DEPLOY_PACKAGE}/install.sh" << 'INSTALLSCRIPT'
#\!/bin/bash
set -e

# Target directories
TARGET_DIR="/opt/gitops"
WEB_DIR="/var/www/gitops-dashboard"

# Create directories if they don't exist
mkdir -p "${TARGET_DIR}/api"
mkdir -p "${TARGET_DIR}/scripts"
mkdir -p "${TARGET_DIR}/logs"
mkdir -p "${WEB_DIR}"

if [ "${NO_NGINX}" = "true" ]; then
  echo "Nginx integration skipped as requested"
else
  # Copy dashboard files to web directory
  echo "Installing dashboard files..."
  cp -r dashboard/* "${WEB_DIR}/"
fi

# Copy API files
echo "Installing API files..."
cp -r api/* "${TARGET_DIR}/api/"

# Copy scripts
echo "Installing scripts..."
cp -r scripts/* "${TARGET_DIR}/scripts/"

# Make scripts executable
chmod +x "${TARGET_DIR}/scripts/"*.sh

# Install API dependencies
echo "Installing API dependencies..."
cd "${TARGET_DIR}/api"
npm install express

# Setup systemd service for API
echo "Setting up API service..."
cat > /etc/systemd/system/gitops-audit-api.service << 'SERVICEDEF'
[Unit]
Description=GitOps Audit API Server
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/gitops/api/server.js --port=${API_PORT}
WorkingDirectory=/opt/gitops/api
Restart=always
RestartSec=10
Environment=NODE_ENV=production
User=root

[Install]
WantedBy=multi-user.target
SERVICEDEF

# Reload and enable service
systemctl daemon-reload
systemctl enable --now gitops-audit-api

echo "Installation complete\!"
echo "Dashboard URL: http://YOUR_SERVER_IP/"
echo "API URL: http://YOUR_SERVER_IP:${API_PORT}/audit"
INSTALLSCRIPT

chmod +x "${DEPLOY_PACKAGE}/install.sh"

# Create readme
cat > "${DEPLOY_PACKAGE}/README.txt" << 'README'
GitOps Dashboard Deployment Package

To install:
1. Copy this entire directory to your production server
2. SSH into your production server
3. Navigate to the copied directory
4. Run: ./install.sh

This will install the dashboard, API, and required scripts.
README

# Create a tarball
tar -czf "${DEPLOY_PACKAGE}.tar.gz" "${DEPLOY_PACKAGE}"

echo "==== Deployment package created ===="
echo "Package: ${DEPLOY_PACKAGE}.tar.gz"
echo ""
echo "To deploy:"
echo "1. Copy this package to your production server"
echo "2. Extract with: tar -xzf ${DEPLOY_PACKAGE}.tar.gz"
echo "3. Navigate to the extracted directory: cd ${DEPLOY_PACKAGE}"
echo "4. Run the installer: ./install.sh"

# Cleanup
rm -rf "${DEPLOY_PACKAGE}"
