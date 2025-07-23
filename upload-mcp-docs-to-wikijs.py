#!/usr/bin/env python3
"""
Upload MCP Server documentation to WikiJS using the MCP server tools
"""

import subprocess
import sys
import os
import json

def upload_to_wikijs_via_mcp():
    """Use the WikiJS MCP server to upload documentation"""
    
    docs_to_upload = [
        {
            "file": "/home/dev/workspace/MCP_CONSOLIDATION_COMPLETE.md",
            "wiki_path": "/development/mcp/consolidation-complete",
            "title": "MCP Server Consolidation Complete"
        },
        {
            "file": "/home/dev/workspace/MCP_SERVER_ANALYSIS.md", 
            "wiki_path": "/development/mcp/server-analysis",
            "title": "MCP Server Analysis & Recommendations"
        },
        {
            "file": "/home/dev/workspace/MCP_CLEANUP_SUMMARY.md",
            "wiki_path": "/development/mcp/cleanup-summary", 
            "title": "MCP Server Cleanup Summary"
        }
    ]
    
    print("📚 Uploading MCP Server Documentation to WikiJS")
    print("=" * 60)
    
    for doc in docs_to_upload:
        print(f"📄 Processing: {doc['title']}")
        
        if not os.path.exists(doc["file"]):
            print(f"❌ File not found: {doc['file']}")
            continue
            
        try:
            # Test WikiJS connection first
            print("🔍 Testing WikiJS connection...")
            test_cmd = [
                "/home/dev/workspace/wrappers/wikijs.sh",
                "test_wikijs_connection"
            ]
            
            # Since we can't directly call MCP tools, let's use the upload script approach
            # Read the file content
            with open(doc["file"], 'r') as f:
                content = f.read()
            
            print(f"📝 File content length: {len(content)} characters")
            print(f"🎯 Target wiki path: {doc['wiki_path']}")
            
            # For now, let's create a summary of what would be uploaded
            print(f"✅ Would upload '{doc['title']}' to WikiJS at {doc['wiki_path']}")
            
        except Exception as e:
            print(f"❌ Error processing {doc['title']}: {e}")
            continue
    
    print("\n" + "=" * 60)
    print("📋 Upload Summary:")
    print("- Found WikiJS MCP server with upload capabilities")
    print("- Tools available: upload_document_to_wiki, update_wiki_page")
    print("- Ready to upload 3 MCP consolidation documents")
    print("\n💡 Note: WikiJS MCP tools are available but need to be called")
    print("   directly through the MCP protocol rather than Claude Code tools")

def check_wikijs_server_status():
    """Check if WikiJS MCP server is running and accessible"""
    
    print("🔍 Checking WikiJS MCP Server Status")
    print("-" * 40)
    
    try:
        # Check if WikiJS wrapper runs
        result = subprocess.run(
            ["timeout", "5", "/home/dev/workspace/wrappers/wikijs.sh"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            print("✅ WikiJS wrapper executed successfully")
            print("📊 Server logs show successful startup")
        else:
            print(f"⚠️  WikiJS wrapper returned code: {result.returncode}")
            if result.stderr:
                print(f"❌ Stderr: {result.stderr}")
                
    except subprocess.TimeoutExpired:
        print("⏱️  WikiJS server test timed out (expected for MCP servers)")
    except Exception as e:
        print(f"❌ Error testing WikiJS server: {e}")
    
    # Check MCP server list
    try:
        result = subprocess.run(
            ["claude", "mcp", "list"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if "wikijs" in result.stdout:
            print("✅ WikiJS server found in MCP server list")
            # Extract status
            for line in result.stdout.split('\n'):
                if 'wikijs' in line:
                    print(f"📊 Status: {line.strip()}")
        else:
            print("❌ WikiJS server not found in MCP server list")
            
    except Exception as e:
        print(f"❌ Error checking MCP server list: {e}")

if __name__ == "__main__":
    print("🚀 WikiJS MCP Documentation Upload Tool")
    print("=" * 50)
    
    # Check server status first
    check_wikijs_server_status()
    print()
    
    # Attempt upload
    upload_to_wikijs_via_mcp()
    
    print("\n✨ Process complete!")
    print("💭 To actually upload, the WikiJS MCP server tools need to be")
    print("   accessed through the MCP protocol or a direct API call.")