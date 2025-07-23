#!/usr/bin/env python3
"""
Script to consolidate .claude.json mcpServers sections
Removes duplicates and standardizes configuration
"""
import json
import shutil
from pathlib import Path

def main():
    claude_config_path = Path.home() / '.claude.json'
    backup_path = Path.home() / '.claude.json.backup-before-final-consolidation'
    
    # Create backup
    shutil.copy2(claude_config_path, backup_path)
    print(f"Created backup: {backup_path}")
    
    # Read current config
    with open(claude_config_path, 'r') as f:
        config = json.load(f)
    
    # Define the standard MCP server configuration
    standard_mcp_servers = {
        "filesystem": {
            "type": "stdio",
            "command": "node",
            "args": [
                "/home/dev/workspace/node_modules/@modelcontextprotocol/server-filesystem/dist/index.js",
                "/home/dev/workspace"
            ],
            "env": {}
        },
        "network-fs": {
            "type": "stdio",
            "command": "bash",
            "args": ["/home/dev/workspace/wrappers/network-fs.sh"],
            "env": {}
        },
        "serena-enhanced": {
            "type": "stdio",
            "command": "bash",
            "args": ["/home/dev/workspace/wrappers/serena-enhanced.sh"],
            "env": {}
        },
        "home-assistant": {
            "type": "stdio",
            "command": "bash",
            "args": ["/home/dev/workspace/wrappers/home-assistant.sh"],
            "env": {}
        },
        "proxmox": {
            "type": "stdio",
            "command": "bash", 
            "args": ["/home/dev/workspace/wrappers/proxmox.sh"],
            "env": {}
        },
        "truenas": {
            "type": "stdio",
            "command": "bash",
            "args": ["/home/dev/workspace/wrappers/truenas.sh"],
            "env": {}
        },
        "github": {
            "type": "stdio",
            "command": "bash",
            "args": ["/home/dev/workspace/wrappers/github.sh"],
            "env": {}
        },
        "wikijs": {
            "type": "stdio",
            "command": "bash",
            "args": ["/home/dev/workspace/wrappers/wikijs.sh"],
            "env": {}
        },
        "code-linter": {
            "type": "stdio",
            "command": "bash",
            "args": ["/home/dev/workspace/wrappers/code-linter.sh"],
            "env": {}
        },
        "directory-polling": {
            "type": "stdio",
            "command": "bash",
            "args": ["/home/dev/workspace/wrappers/directory-polling.sh"],
            "env": {}
        }
    }
    
    # Update all project configurations to use the standard MCP servers
    if 'projects' in config:
        workspace_path = "/home/dev/workspace"
        
        # Set the main workspace project with standard servers
        if workspace_path in config['projects']:
            config['projects'][workspace_path]['mcpServers'] = standard_mcp_servers
            print(f"Updated {workspace_path} with standard MCP servers")
        
        # Clear MCP servers from other project contexts to avoid duplication
        for project_path, project_config in config['projects'].items():
            if project_path != workspace_path and 'mcpServers' in project_config:
                old_servers = list(project_config['mcpServers'].keys())
                project_config['mcpServers'] = {}
                print(f"Cleared MCP servers from {project_path}: {old_servers}")
    
    # Write updated config
    with open(claude_config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("Consolidated .claude.json configuration:")
    print("- Standard MCP servers set for main workspace")
    print("- Duplicate MCP server sections cleared from other projects")
    print("- All wrapper paths updated to /home/dev/workspace/wrappers/")
    print("- Standardized server names (removed -mcp suffixes)")

if __name__ == "__main__":
    main()