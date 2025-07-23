#!/bin/bash
# Directory Polling MCP Server Wrapper

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/../mcp-servers/mcp-servers/directory-polling-server"

# Check if server exists
if [ ! -f "$SERVER_DIR/mcp-directory-polling-server.py" ]; then
    echo "Directory polling MCP server not found at $SERVER_DIR" >&2
    exit 1
fi

# Execute the MCP server
cd "$SERVER_DIR" && python3 mcp-directory-polling-server.py