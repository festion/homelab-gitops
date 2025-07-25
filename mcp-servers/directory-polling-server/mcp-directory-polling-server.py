#!/usr/bin/env python3
"""
Directory Polling MCP Server
Proper MCP protocol implementation using Python
"""

import json
import sys
import os
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import fnmatch

class MCPDirectoryPollingServer:
    def __init__(self):
        self.config = self._load_config()
        self.request_id = 0
        
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
                    return json.load(f)
            else:
                return default_config
        except Exception:
            return default_config

    def _should_exclude_file(self, file_path: str) -> bool:
        """Check if file should be excluded based on patterns"""
        exclude_patterns = self.config["filters"].get("exclude_patterns", [])
        for pattern in exclude_patterns:
            if fnmatch.fnmatch(file_path, pattern) or pattern in file_path:
                return True
        return False

    def scan_directories(self, force_rescan: bool = False) -> List[Dict[str, Any]]:
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
                    if file_path.is_file() and not self._should_exclude_file(str(file_path)):
                        try:
                            stat = file_path.stat()
                            
                            # Apply size filters
                            min_size = self.config["filters"].get("min_file_size", 0)
                            max_size = self.config["filters"].get("max_file_size", float('inf'))
                            
                            if min_size <= stat.st_size <= max_size:
                                file_info = {
                                    "path": str(file_path),
                                    "size": stat.st_size,
                                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                                    "priority": dir_config.get("priority", "medium")
                                }
                                all_files.append(file_info)
                                
                        except Exception:
                            continue
                            
            except Exception:
                continue
        
        return all_files

    def handle_list_tools(self, request_id: str) -> Dict[str, Any]:
        """Handle tools/list request"""
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "tools": [
                    {
                        "name": "scan_directories",
                        "description": "Scan configured directories for files matching patterns",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "force_rescan": {
                                    "type": "boolean", 
                                    "description": "Force a fresh scan of all directories",
                                    "default": False
                                }
                            },
                            "additionalProperties": False
                        }
                    },
                    {
                        "name": "get_config",
                        "description": "Get current directory polling configuration", 
                        "inputSchema": {
                            "type": "object",
                            "properties": {},
                            "additionalProperties": False
                        }
                    },
                    {
                        "name": "update_watch_directory",
                        "description": "Update or add a watch directory configuration",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "path": {"type": "string", "description": "Directory path to watch"},
                                "recursive": {"type": "boolean", "default": True},
                                "priority": {"type": "string", "enum": ["low", "medium", "high"], "default": "medium"},
                                "patterns": {"type": "array", "items": {"type": "string"}, "default": ["*"]}
                            },
                            "required": ["path"],
                            "additionalProperties": False
                        }
                    }
                ]
            }
        }

    def handle_call_tool(self, request_id: str, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle tools/call request"""
        try:
            if name == "scan_directories":
                force_rescan = arguments.get("force_rescan", False)
                files = self.scan_directories(force_rescan)
                
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": f"Directory scan completed successfully.\n\nSummary:\n- Total files found: {len(files)}\n- Configuration: {len(self.config['watch_directories'])} directories monitored\n- Profile: {self.config.get('monitoring_profile', 'default')}\n\nFirst 10 files:\n{json.dumps(files[:10], indent=2)}"
                            }
                        ]
                    }
                }
                
            elif name == "get_config":
                return {
                    "jsonrpc": "2.0", 
                    "id": request_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": f"Current directory polling configuration:\n{json.dumps(self.config, indent=2)}"
                            }
                        ]
                    }
                }
                
            elif name == "update_watch_directory":
                path = arguments.get("path")
                if not path:
                    raise ValueError("path is required")
                    
                new_dir = {
                    "path": path,
                    "recursive": arguments.get("recursive", True),
                    "priority": arguments.get("priority", "medium"),
                    "patterns": arguments.get("patterns", ["*"])
                }
                
                # Add or update directory
                existing_dirs = self.config.get("watch_directories", [])
                updated = False
                for i, existing_dir in enumerate(existing_dirs):
                    if existing_dir["path"] == path:
                        existing_dirs[i] = new_dir
                        updated = True
                        break
                
                if not updated:
                    existing_dirs.append(new_dir)
                
                self.config["watch_directories"] = existing_dirs
                
                return {
                    "jsonrpc": "2.0",
                    "id": request_id, 
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": f"{'Updated' if updated else 'Added'} watch directory: {path}\nConfiguration: {json.dumps(new_dir, indent=2)}"
                            }
                        ]
                    }
                }
            else:
                raise ValueError(f"Unknown tool: {name}")
                
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": -32000,
                    "message": f"Tool execution failed: {str(e)}"
                }
            }

    def handle_initialize(self, request_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle initialize request"""
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "directory-polling-mcp-server",
                    "version": "1.0.0"
                }
            }
        }

    def handle_initialized(self, request_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Handle initialized notification"""
        return None  # Notifications don't need responses

    def process_request(self, request: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process incoming MCP request"""
        method = request.get("method")
        request_id = request.get("id")
        params = request.get("params", {})
        
        if method == "initialize":
            return self.handle_initialize(request_id, params)
        elif method == "initialized":
            return self.handle_initialized(request_id)
        elif method == "tools/list":
            return self.handle_list_tools(request_id)
        elif method == "tools/call":
            name = params.get("name")
            arguments = params.get("arguments", {})
            return self.handle_call_tool(request_id, name, arguments)
        else:
            if request_id:  # Only respond to requests, not notifications
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {
                        "code": -32601,
                        "message": f"Method not found: {method}"
                    }
                }
            return None

def main():
    """Main entry point"""
    server = MCPDirectoryPollingServer()
    
    # MCP servers use stdio for communication
    sys.stderr.write(f"Directory Polling MCP Server starting\n")
    sys.stderr.write(f"Monitoring {len(server.config['watch_directories'])} directories\n")
    sys.stderr.flush()
    
    try:
        while True:
            try:
                line = sys.stdin.readline()
                if not line:
                    break
                
                line = line.strip()
                if not line:
                    continue
                
                request = json.loads(line)
                response = server.process_request(request)
                
                if response is not None:
                    print(json.dumps(response), flush=True)
                    
            except json.JSONDecodeError as e:
                error_response = {
                    "jsonrpc": "2.0", 
                    "id": None,
                    "error": {
                        "code": -32700,
                        "message": f"Parse error: {str(e)}"
                    }
                }
                print(json.dumps(error_response), flush=True)
                
            except EOFError:
                break
            except KeyboardInterrupt:
                break
                
    except Exception as e:
        sys.stderr.write(f"Server error: {e}\n")
        sys.exit(1)
    
    sys.stderr.write("Directory Polling MCP Server stopped\n")

if __name__ == "__main__":
    main()