#!/bin/bash
# Quick validation script to test the one-line installer locally

set -e

echo "🧪 Testing GitOps Auditor One-Line Installer"
echo "============================================="

# Check if we're on a system that could run the installer
if ! command -v wget >/dev/null 2>&1; then
    echo "❌ wget not found - required for one-line install"
    exit 1
fi

if ! command -v bash >/dev/null 2>&1; then
    echo "❌ bash not found - required for installer"
    exit 1
fi

echo "✅ Basic dependencies found"

# Test script syntax
echo "🔍 Validating installer script syntax..."
bash -n install.sh
echo "✅ Installer script syntax is valid"

# Test configuration system
echo "🔍 Testing configuration system..."
if [ -f "scripts/config-loader.sh" ]; then
    bash -n scripts/config-loader.sh
    echo "✅ Configuration loader syntax is valid"
else
    echo "❌ Configuration loader not found"
    exit 1
fi

if [ -f "scripts/config-manager.sh" ]; then
    bash -n scripts/config-manager.sh
    echo "✅ Configuration manager syntax is valid"
else
    echo "❌ Configuration manager not found"
    exit 1
fi

# Test comprehensive audit script
echo "🔍 Testing comprehensive audit script..."
if [ -f "scripts/comprehensive_audit.sh" ]; then
    bash -n scripts/comprehensive_audit.sh
    echo "✅ Comprehensive audit script syntax is valid"
else
    echo "❌ Comprehensive audit script not found"
    exit 1
fi

# Check if API server can be parsed
echo "🔍 Testing API server..."
if [ -f "api/server.js" ]; then
    if command -v node >/dev/null 2>&1; then
        node -c api/server.js
        echo "✅ API server syntax is valid"
    else
        echo "⚠️  Node.js not found - cannot validate API server syntax"
    fi
else
    echo "❌ API server not found"
    exit 1
fi

echo ""
echo "🎉 All tests passed!"
echo ""
echo "📋 One-line install command:"
echo "bash -c \"\$(wget -qLO - https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/install.sh)\""
echo ""
echo "📖 For Proxmox VE users, this will:"
echo "  1. Create a new LXC container"
echo "  2. Install Ubuntu 22.04"
echo "  3. Set up GitOps Auditor with all dependencies"
echo "  4. Configure Nginx and systemd services"
echo "  5. Provide access at http://CONTAINER_IP"