#!/usr/bin/env python3
"""Direct server runner for directory-polling MCP server."""

import sys
import os
import asyncio
from pathlib import Path

# Make sure we can import the server
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

if __name__ == "__main__":
    # Import and run the proper MCP server
    exec(open("mcp-directory-polling-server.py").read())