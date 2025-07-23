#!/bin/bash

# MCP Server Structure Cleanup Script
# This script consolidates MCP servers and removes duplicates

set -e

WORKSPACE="/home/dev/workspace"
BACKUP_DIR="$WORKSPACE/mcp-cleanup-backup-$(date +%Y%m%d-%H%M%S)"

echo "Starting MCP server structure cleanup..."
echo "Creating backup at: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup current state
echo "Creating backups..."
cp -r "$WORKSPACE/.claude.json" "$BACKUP_DIR/" 2>/dev/null || true
cp -r "$WORKSPACE/home-assistant-mcp-server" "$BACKUP_DIR/" 2>/dev/null || true
cp -r "$WORKSPACE/mcp-servers" "$BACKUP_DIR/" 2>/dev/null || true

echo "Analysis of current structure:"
echo "================================"

echo "Home Assistant Servers:"
echo "- Workspace root: $([ -d "$WORKSPACE/home-assistant-mcp-server" ] && echo "EXISTS (ACTIVE)" || echo "MISSING")"
echo "- MCP-servers dir: $([ -d "$WORKSPACE/mcp-servers/home-assistant-mcp-server" ] && echo "EXISTS" || echo "MISSING")"
if [ -d "$WORKSPACE/mcp-servers/home-assistant-mcp-server" ]; then
    file_count=$(ls -1 "$WORKSPACE/mcp-servers/home-assistant-mcp-server" 2>/dev/null | wc -l)
    echo "  Files in mcp-servers version: $file_count"
fi

echo ""
echo "All MCP Server Directories:"
echo "=========================="
find "$WORKSPACE" -maxdepth 2 -name "*mcp*server*" -type d | sort

echo ""
echo "Wrapper Scripts:"
echo "==============="
ls -la "$WORKSPACE"/*wrapper*.sh 2>/dev/null | awk '{print $9}' | sort

echo ""
echo "Configuration Analysis:"
echo "======================"
mcp_sections=$(grep -c '"mcpServers"' ~/.claude.json 2>/dev/null || echo "0")
echo "Number of mcpServers sections in .claude.json: $mcp_sections"

echo ""
echo "Duplicate Servers in Configuration:"
echo "=================================="
# Extract all server names from configurations
grep -A 20 '"mcpServers"' ~/.claude.json | grep -E '^\s*"[^"]+":' | sed 's/.*"\([^"]*\)".*/\1/' | sort | uniq -c | sort -nr

echo ""
echo "Recommendations:"
echo "==============="
echo "1. Remove empty mcp-servers/home-assistant-mcp-server directory"
echo "2. Keep workspace root home-assistant-mcp-server (active implementation)"
echo "3. Consolidate duplicate .claude.json mcpServers sections"
echo "4. Standardize server names (remove duplicate proxmox/proxmox-mcp entries)"
echo "5. Use consistent wrapper script naming"

echo ""
echo "Backup completed at: $BACKUP_DIR"
echo "Review the analysis above before proceeding with cleanup."