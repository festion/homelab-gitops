#!/usr/bin/env python3
"""Direct server runner for code-linter MCP server."""

import sys
import os
from pathlib import Path

# Add the src directory to Python path
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))

if __name__ == "__main__":
    import asyncio
    from code_linter_mcp.server import main
    asyncio.run(main())