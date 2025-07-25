#!/usr/bin/env python3
"""Direct server runner that doesn't rely on entry point installation."""

import sys
import os
import asyncio
from pathlib import Path

# Add the src directory to Python path
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))

# Import and run
from network_mcp.cli import main

if __name__ == "__main__":
    asyncio.run(main())