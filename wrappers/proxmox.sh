#!/bin/bash
cd /home/dev/workspace

# Load tokens from secure storage
if [ -f "/home/dev/.mcp_tokens/proxmox_host" ]; then
    export PROXMOX_HOST=$(cat /home/dev/.mcp_tokens/proxmox_host)
else
    export PROXMOX_HOST="${PROXMOX_HOST:-192.168.1.137}"
fi

if [ -f "/home/dev/.mcp_tokens/proxmox_user" ]; then
    export PROXMOX_USER=$(cat /home/dev/.mcp_tokens/proxmox_user)
else
    export PROXMOX_USER="${PROXMOX_USER:-root@pam}"
fi

if [ -f "/home/dev/.mcp_tokens/proxmox_token" ]; then
    export PROXMOX_TOKEN=$(cat /home/dev/.mcp_tokens/proxmox_token)
else
    export PROXMOX_TOKEN="${PROXMOX_TOKEN:-your_proxmox_token_here}"
fi

# Check if token is configured
if [ "$PROXMOX_TOKEN" = "your_proxmox_token_here" ]; then
    echo "ERROR: Proxmox MCP server requires configuration. Please set PROXMOX_TOKEN environment variable or store token in /home/dev/.mcp_tokens/proxmox_token"
    echo "Example: echo 'PVEAPIToken=user@pam!tokenid=token-secret' > /home/dev/.mcp_tokens/proxmox_token && chmod 600 /home/dev/.mcp_tokens/proxmox_token"
    exit 1
fi

# Check if Proxmox MCP server is available
if [ -d "/home/dev/workspace/mcp-servers/proxmox-mcp-server" ]; then
    cd /home/dev/workspace/mcp-servers/proxmox-mcp-server
    python3 run_server.py run config.json 2>/dev/null || uv run proxmox-mcp-server run config.json
else
    echo "Proxmox MCP server not found in mcp-servers directory."
    exit 1
fi