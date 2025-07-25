#!/usr/bin/env python3
"""
TrueNAS MCP Server Startup Test Script
Tests that the server can initialize properly with environment configuration
"""

import os
import sys
import asyncio
from pathlib import Path

# Add the current directory to Python path for imports
sys.path.insert(0, str(Path(__file__).parent))

def load_env_file():
    """Load environment variables from .env file"""
    env_file = Path(__file__).parent / '.env'
    if env_file.exists():
        from dotenv import load_dotenv
        load_dotenv(env_file)
        return True
    return False

async def test_server_initialization():
    """Test TrueNAS MCP server initialization"""
    print("🧪 Testing TrueNAS MCP Server Startup...")
    print("=" * 60)
    
    # Test 1: Check if we can import the module
    try:
        import truenas_mcp_server
        print("✅ Module import: SUCCESS")
    except ImportError as e:
        print(f"❌ Module import: FAILED - {e}")
        return False
    
    # Test 2: Check environment variables
    print("\n📋 Environment Variables:")
    env_vars = {
        'TRUENAS_URL': os.getenv('TRUENAS_URL'),
        'TRUENAS_API_KEY': os.getenv('TRUENAS_API_KEY'),
        'TRUENAS_VERIFY_SSL': os.getenv('TRUENAS_VERIFY_SSL'),
        'TRUENAS_TIMEOUT': os.getenv('TRUENAS_TIMEOUT')
    }
    
    all_env_set = True
    for var, value in env_vars.items():
        if value:
            if var == 'TRUENAS_API_KEY':
                print(f"✅ {var}: {value[:20]}..." if len(value) > 20 else f"✅ {var}: {value}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NOT SET")
            all_env_set = False
    
    if all_env_set:
        print("✅ Environment Variables: PASS")
    else:
        print("⚠️  Environment Variables: Some variables not set (this is expected for test mode)")
    
    # Test 3: Check config file exists
    env_file = Path(__file__).parent / '.env'
    if env_file.exists():
        print("✅ Config File: PASS")
    else:
        print("⚠️  Config File: .env file not found")
    
    # Test 4: Test server initialization (without actually running)
    try:
        # Test if we can create the MCP server instance
        from truenas_mcp_server import mcp, get_client
        print("✅ Server Initialization: PASS")
        
        # Test client creation (will fail with test credentials but should not crash)
        try:
            if all_env_set:
                client = get_client()
                print("✅ HTTP Client: PASS")
            else:
                print("⚠️  HTTP Client: Skipped (no credentials)")
        except ValueError as e:
            if "TRUENAS_API_KEY" in str(e):
                print("⚠️  HTTP Client: Expected error (no API key)")
            else:
                print(f"❌ HTTP Client: FAILED - {e}")
                return False
        except Exception as e:
            print(f"❌ HTTP Client: FAILED - {e}")
            return False
            
    except Exception as e:
        print(f"❌ Server Initialization: FAILED - {e}")
        return False
    
    print("\n" + "=" * 60)
    
    # Final results
    if all_env_set:
        print("🎉 [SUCCESS] All tests passed! Server is ready.")
        return True
    else:
        print("⚠️  [PARTIAL] Server code is functional, but needs configuration.")
        print("   To complete setup:")
        print("   1. Set TRUENAS_URL to your TrueNAS server")
        print("   2. Set TRUENAS_API_KEY to your API key")
        print("   3. Adjust TRUENAS_VERIFY_SSL as needed")
        return True

def main():
    """Main test function"""
    # Try to load .env file
    env_loaded = load_env_file()
    if env_loaded:
        print("📁 Loaded configuration from .env file")
    else:
        print("📁 No .env file found, using system environment")
    
    print()
    
    # Run the tests
    try:
        success = asyncio.run(test_server_initialization())
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())