#!/usr/bin/env python3
"""
TrueNAS MCP Server Runner
Entry point for running the TrueNAS MCP server with environment setup
"""

import os
import sys
from pathlib import Path

def load_environment():
    """Load environment variables from .env file if it exists"""
    env_file = Path(__file__).parent / '.env'
    if env_file.exists():
        try:
            from dotenv import load_dotenv
            load_dotenv(env_file)
            print(f"Loaded environment from {env_file}")
        except ImportError:
            print("Warning: python-dotenv not installed, cannot load .env file")
        except Exception as e:
            print(f"Warning: Could not load .env file: {e}")

def main():
    """Main entry point"""
    print("Starting TrueNAS MCP Server...")
    
    # Load environment variables
    load_environment()
    
    # Validate required environment variables
    required_vars = ['TRUENAS_URL', 'TRUENAS_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"Error: Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these variables or create a .env file with the required configuration.")
        print("\nExample .env file:")
        print("TRUENAS_URL=https://your-truenas-server")
        print("TRUENAS_API_KEY=your-api-key")
        print("TRUENAS_VERIFY_SSL=false")
        return 1
    
    # Import and run the server
    try:
        from truenas_mcp_server import main as server_main
        return server_main()
    except ImportError as e:
        print(f"Error importing TrueNAS MCP server: {e}")
        return 1
    except Exception as e:
        print(f"Error starting server: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())