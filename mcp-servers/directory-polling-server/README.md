# Directory Polling MCP Server

## Overview
This directory contains implementations of a directory polling MCP server that monitors file system changes.

## Files
- `mcp-directory-polling-server-fixed.py` - **RECOMMENDED** - MCP protocol compliant implementation
- `mcp-directory-polling-server.py` - Original implementation 
- `mcp-directory-polling-server-simple.py` - Simple implementation (non-compliant)

## Usage
Use the fixed implementation for proper MCP protocol compliance:
```bash
python3 mcp-directory-polling-server-fixed.py
```

## Features
- Real-time directory monitoring
- Configurable file patterns and filters
- MCP JSON-RPC 2.0 protocol compliance
- Tools: scan_directories, get_config, update_watch_directory