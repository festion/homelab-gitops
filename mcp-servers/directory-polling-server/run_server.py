#!/usr/bin/env python3
"""Direct server runner for directory-polling MCP server."""

import sys
import os
from pathlib import Path

# Make sure we can import the server
current_dir = Path(__file__).parent

if __name__ == "__main__":
    # Import and run the main server
    sys.path.insert(0, str(current_dir))
    
    # Use the simple version for now
    import subprocess
    subprocess.run([sys.executable, str(current_dir / "mcp-directory-polling-server-simple.py")])