#!/usr/bin/env python3
"""
Directory Polling MCP Server
Simple implementation without external dependencies
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# Simple MCP-like server implementation
class SimpleDirectoryPollingServer:
    def __init__(self):
        self.config = self._load_config()
        self.monitored_files = {}
        
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file or use defaults"""
        config_path = os.environ.get('POLLING_CONFIG', '/home/dev/workspace/production-monitoring-config.json')
        
        default_config = {
            "monitoring_profile": "production",
            "watch_directories": [
                {
                    "path": "/home/dev/workspace",
                    "recursive": True,
                    "priority": "high",
                    "patterns": ["*.md", "*.py", "*.js", "*.json", "*.yaml", "*.yml"]
                }
            ],
            "processing_rules": {
                "batch_size": 10,
                "processing_interval": 30,
                "max_queue_size": 50,
                "duplicate_detection": True
            },
            "filters": {
                "exclude_patterns": [
                    "node_modules/**",
                    ".git/**", 
                    "__pycache__/**",
                    "*.log",
                    "*.tmp"
                ],
                "min_file_size": 10,
                "max_file_size": 1048576
            }
        }
        
        try:
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    config = json.load(f)
                print(f"Configuration loaded from {config_path}", file=sys.stderr)
                return config
            else:
                print("Using default configuration", file=sys.stderr)
                return default_config
        except Exception as e:
            print(f"Error loading config: {e}, using defaults", file=sys.stderr)
            return default_config
    
    def scan_directories(self) -> List[Dict[str, Any]]:
        """Scan configured directories for files"""
        all_files = []
        
        for dir_config in self.config["watch_directories"]:
            path = Path(dir_config["path"])
            if not path.exists():
                continue
                
            patterns = dir_config.get("patterns", ["*"])
            
            try:
                files = []
                if dir_config.get("recursive", False):
                    for pattern in patterns:
                        files.extend(path.rglob(pattern))
                else:
                    for pattern in patterns:
                        files.extend(path.glob(pattern))
                        
                for file_path in files:
                    if file_path.is_file():
                        try:
                            stat = file_path.stat()
                            file_info = {
                                "path": str(file_path),
                                "size": stat.st_size,
                                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                                "priority": dir_config.get("priority", "medium")
                            }
                            
                            # Apply size filters
                            min_size = self.config["filters"].get("min_file_size", 0)
                            max_size = self.config["filters"].get("max_file_size", float('inf'))
                            
                            if min_size <= stat.st_size <= max_size:
                                all_files.append(file_info)
                                
                        except Exception as e:
                            print(f"Error processing {file_path}: {e}", file=sys.stderr)
                            
            except Exception as e:
                print(f"Error scanning {path}: {e}", file=sys.stderr)
        
        return all_files
    
    def process_mcp_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process MCP-like request"""
        method = request.get("method", "")
        params = request.get("params", {})
        
        if method == "tools/list":
            return {
                "tools": [
                    {
                        "name": "scan_directories",
                        "description": "Scan configured directories for files",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "force_rescan": {"type": "boolean", "default": False}
                            }
                        }
                    },
                    {
                        "name": "get_config", 
                        "description": "Get current configuration",
                        "inputSchema": {"type": "object", "properties": {}}
                    }
                ]
            }
        elif method == "tools/call":
            tool_name = params.get("name", "")
            arguments = params.get("arguments", {})
            
            if tool_name == "scan_directories":
                files = self.scan_directories()
                return {
                    "content": [{
                        "type": "text",
                        "text": f"Directory scan completed:\n{json.dumps({'total_files': len(files), 'files': files[:10]}, indent=2)}"
                    }]
                }
            elif tool_name == "get_config":
                return {
                    "content": [{
                        "type": "text", 
                        "text": f"Current configuration:\n{json.dumps(self.config, indent=2)}"
                    }]
                }
        
        return {"error": f"Unknown method: {method}"}

def main():
    """Main entry point"""
    server = SimpleDirectoryPollingServer()
    
    print("Directory Polling MCP Server starting", file=sys.stderr)
    print(f"Monitoring {len(server.config['watch_directories'])} directories", file=sys.stderr)
    
    # Simple stdio-based MCP protocol simulation
    try:
        while True:
            try:
                line = input()
                if not line:
                    continue
                    
                request = json.loads(line)
                response = server.process_mcp_request(request)
                print(json.dumps(response))
                sys.stdout.flush()
                
            except json.JSONDecodeError:
                print(json.dumps({"error": "Invalid JSON"}))
            except EOFError:
                break
            except KeyboardInterrupt:
                break
                
    except Exception as e:
        print(f"Server error: {e}", file=sys.stderr)
        sys.exit(1)
    
    print("Directory Polling MCP Server stopped", file=sys.stderr)

if __name__ == "__main__":
    # Create configuration if it doesn't exist
    config_path = os.environ.get('POLLING_CONFIG', '/home/dev/workspace/production-monitoring-config.json')
    if not os.path.exists(config_path):
        default_config = {
            "monitoring_profile": "production",
            "watch_directories": [
                {
                    "path": "/home/dev/workspace",
                    "recursive": True,
                    "priority": "high", 
                    "patterns": ["*.md", "*.py", "*.js", "*.json", "*.yaml", "*.yml"]
                }
            ],
            "processing_rules": {
                "batch_size": 10,
                "processing_interval": 30,
                "max_queue_size": 50,
                "duplicate_detection": True
            },
            "filters": {
                "exclude_patterns": [
                    "node_modules/**",
                    ".git/**",
                    "__pycache__/**", 
                    "*.log",
                    "*.tmp"
                ],
                "min_file_size": 10,
                "max_file_size": 1048576
            }
        }
        
        try:
            with open(config_path, 'w') as f:
                json.dump(default_config, f, indent=2)
            print(f"Created default configuration at {config_path}", file=sys.stderr)
        except Exception as e:
            print(f"Warning: Could not create config file: {e}", file=sys.stderr)
    
    main()