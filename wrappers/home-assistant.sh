#!/bin/bash
cd /home/dev/workspace

# Load tokens from secure storage
if [ -f "/home/dev/.mcp_tokens/hass_url" ]; then
    export HA_URL=$(cat /home/dev/.mcp_tokens/hass_url)
else
    export HA_URL="${HA_URL:-https://homeassistant.internal.lakehouse.wtf}"
fi

if [ -f "/home/dev/.mcp_tokens/hass_token" ]; then
    export HA_TOKEN=$(cat /home/dev/.mcp_tokens/hass_token)
else
    export HA_TOKEN="${HA_TOKEN:-your_hass_token_here}"
fi

# Check if token is configured
if [ "$HA_TOKEN" = "your_hass_token_here" ]; then
    echo "ERROR: Home Assistant MCP server requires configuration. Please set HA_TOKEN environment variable or store token in /home/dev/.mcp_tokens/hass_token"
    echo "Example: echo 'your-token' > /home/dev/.mcp_tokens/hass_token && chmod 600 /home/dev/.mcp_tokens/hass_token"
    exit 1
fi

# Check if Home Assistant MCP server is available
if [ -d "/home/dev/workspace/home-assistant-mcp-server" ]; then
    cd /home/dev/workspace/home-assistant-mcp-server
    
    # Try Docker first (recommended), then fall back to Python/uv
    if command -v docker >/dev/null 2>&1; then
        # Use Docker if available
        docker run -i --rm -e HA_URL -e HA_TOKEN voska/hass-mcp 2>/dev/null || {
            echo "Docker image not available locally, trying to pull..."
            docker pull voska/hass-mcp >/dev/null 2>&1 && docker run -i --rm -e HA_URL -e HA_TOKEN voska/hass-mcp
        } || {
            echo "Docker execution failed, falling back to Python..."
            # Fall back to Python execution
            if command -v uv >/dev/null 2>&1; then
                uv run python -m app
            else
                python3 -m app
            fi
        }
    else
        # No Docker, use Python directly
        if command -v uv >/dev/null 2>&1; then
            uv run python -m app
        else
            python3 -m app
        fi
    fi
else
    echo "Home Assistant MCP server not found at /home/dev/workspace/home-assistant-mcp-server"
    exit 1
fi