#!/bin/bash

# Claude Auto-Commit MCP Server Main Wrapper
# Entry point for the Claude AI-powered auto-commit functionality

set -e

# Define paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_WRAPPER="$SCRIPT_DIR/mcp-servers/claude-auto-commit-wrapper.sh"

# Check if the server wrapper exists
if [[ ! -f "$SERVER_WRAPPER" ]]; then
    echo "Error: Claude Auto-Commit MCP Server not found at $SERVER_WRAPPER" >&2
    echo "Please ensure the server is installed correctly." >&2
    exit 1
fi

# Forward all arguments to the server wrapper
exec "$SERVER_WRAPPER" "$@"