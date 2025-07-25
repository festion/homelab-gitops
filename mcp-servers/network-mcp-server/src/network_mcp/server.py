"""Main MCP server implementation for network filesystem access."""

import asyncio
import json
import logging
import os
from typing import Any, Dict, List, Optional, Union

import mcp.server.stdio
import mcp.types as types
from mcp.server.lowlevel import NotificationOptions, Server
from mcp.server.models import InitializationOptions

from .config import NetworkMCPConfig, SMBShareConfig
from .smb_fs import AsyncSMBConnection, SMBFileInfo
from .security import SecurityValidator
from .exceptions import (
    NetworkMCPError, 
    NetworkFileSystemError, 
    AuthenticationError,
    FileNotFoundError,
    ValidationError,
    PermissionError,
    ConfigurationError
)


logger = logging.getLogger(__name__)


class NetworkMCPServer:
    """Network MCP Server for accessing network filesystems."""
    
    def __init__(self, config: NetworkMCPConfig):
        self.config = config
        self.server = Server("network-mcp-server")
        self.security = SecurityValidator(config.security)
        self.connections: Dict[str, AsyncSMBConnection] = {}
        
        self._setup_logging()
        self._register_tools()
    
    def _setup_logging(self) -> None:
        """Configure logging."""
        log_level = getattr(logging, self.config.logging_level.upper(), logging.INFO)
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    def _register_tools(self) -> None:
        """Register MCP tools."""
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[types.Tool]:
            """List available tools."""
            return [
                types.Tool(
                    name="list_network_directory",
                    description="List contents of a network directory",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "share_name": {
                                "type": "string",
                                "description": "Name of the configured network share"
                            },
                            "path": {
                                "type": "string", 
                                "description": "Directory path to list (relative to share root)",
                                "default": ""
                            }
                        },
                        "required": ["share_name"]
                    }
                ),
                types.Tool(
                    name="read_network_file",
                    description="Read contents of a network file",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "share_name": {
                                "type": "string",
                                "description": "Name of the configured network share"
                            },
                            "file_path": {
                                "type": "string",
                                "description": "File path to read (relative to share root)"
                            },
                            "encoding": {
                                "type": "string",
                                "description": "Text encoding for the file",
                                "default": "utf-8"
                            }
                        },
                        "required": ["share_name", "file_path"]
                    }
                ),
                types.Tool(
                    name="write_network_file",
                    description="Write contents to a network file",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "share_name": {
                                "type": "string",
                                "description": "Name of the configured network share"
                            },
                            "file_path": {
                                "type": "string",
                                "description": "File path to write (relative to share root)"
                            },
                            "content": {
                                "type": "string",
                                "description": "Content to write to the file"
                            },
                            "encoding": {
                                "type": "string",
                                "description": "Text encoding for the file",
                                "default": "utf-8"
                            }
                        },
                        "required": ["share_name", "file_path", "content"]
                    }
                ),
                types.Tool(
                    name="delete_network_file",
                    description="Delete a network file",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "share_name": {
                                "type": "string",
                                "description": "Name of the configured network share"
                            },
                            "file_path": {
                                "type": "string",
                                "description": "File path to delete (relative to share root)"
                            }
                        },
                        "required": ["share_name", "file_path"]
                    }
                ),
                types.Tool(
                    name="create_network_directory",
                    description="Create a directory on a network share",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "share_name": {
                                "type": "string",
                                "description": "Name of the configured network share"
                            },
                            "directory_path": {
                                "type": "string",
                                "description": "Directory path to create (relative to share root)"
                            }
                        },
                        "required": ["share_name", "directory_path"]
                    }
                ),
                types.Tool(
                    name="get_network_file_info",
                    description="Get information about a network file or directory",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "share_name": {
                                "type": "string",
                                "description": "Name of the configured network share"
                            },
                            "path": {
                                "type": "string",
                                "description": "File or directory path (relative to share root)"
                            }
                        },
                        "required": ["share_name", "path"]
                    }
                ),
                types.Tool(
                    name="get_share_info",
                    description="Get information about configured network shares",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "share_name": {
                                "type": "string",
                                "description": "Name of specific share (optional - if not provided, lists all shares)"
                            }
                        }
                    }
                )
            ]
        
        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> List[types.TextContent]:
            """Handle tool calls."""
            try:
                if name == "list_network_directory":
                    return await self._handle_list_directory(**arguments)
                elif name == "read_network_file":
                    return await self._handle_read_file(**arguments)
                elif name == "write_network_file":
                    return await self._handle_write_file(**arguments)
                elif name == "delete_network_file":
                    return await self._handle_delete_file(**arguments)
                elif name == "create_network_directory":
                    return await self._handle_create_directory(**arguments)
                elif name == "get_network_file_info":
                    return await self._handle_get_file_info(**arguments)
                elif name == "get_share_info":
                    return await self._handle_get_share_info(**arguments)
                else:
                    raise ValueError(f"Unknown tool: {name}")
            
            except NetworkMCPError as e:
                logger.error(f"Network MCP error in {name}: {e}")
                return [types.TextContent(type="text", text=f"Error: {str(e)}")]
            except Exception as e:
                logger.error(f"Unexpected error in {name}: {e}", exc_info=True)
                return [types.TextContent(type="text", text=f"Unexpected error: {str(e)}")]
    
    async def _get_connection(self, share_name: str) -> AsyncSMBConnection:
        """Get or create connection for a share."""
        if share_name not in self.config.shares:
            raise ConfigurationError(f"Share '{share_name}' not configured")
        
        if share_name not in self.connections:
            share_config = self.config.shares[share_name]
            
            if isinstance(share_config, SMBShareConfig):
                connection = AsyncSMBConnection(share_config)
                await connection.connect()
                self.connections[share_name] = connection
            else:
                raise ConfigurationError(f"Unsupported share type for '{share_name}'")
        
        return self.connections[share_name]
    
    async def _handle_list_directory(self, share_name: str, path: str = "") -> List[types.TextContent]:
        """Handle directory listing."""
        connection = await self._get_connection(share_name)
        
        # Validate path
        self.security.validate_file_path(path)
        
        files = await connection.list_directory(path)
        
        # Format results
        result_lines = []
        result_lines.append(f"Contents of {share_name}:{path or '/'}")
        result_lines.append("-" * 50)
        
        directories = [f for f in files if f.is_directory]
        files_list = [f for f in files if not f.is_directory]
        
        # List directories first
        for directory in sorted(directories, key=lambda x: x.name.lower()):
            result_lines.append(f"📁 {directory.name}/")
        
        # Then list files
        for file in sorted(files_list, key=lambda x: x.name.lower()):
            size_str = self._format_file_size(file.size)
            result_lines.append(f"📄 {file.name} ({size_str})")
        
        if not files:
            result_lines.append("(empty directory)")
        
        return [types.TextContent(type="text", text="\n".join(result_lines))]
    
    async def _handle_read_file(self, share_name: str, file_path: str, encoding: str = "utf-8") -> List[types.TextContent]:
        """Handle file reading."""
        connection = await self._get_connection(share_name)
        
        # Validate operation
        self.security.validate_read_operation(file_path)
        
        content_bytes = await connection.read_file(file_path)
        
        # Validate file size
        self.security.validate_file_size(len(content_bytes))
        
        try:
            content_text = content_bytes.decode(encoding)
            return [types.TextContent(type="text", text=content_text)]
        except UnicodeDecodeError as e:
            raise ValidationError(f"Failed to decode file with {encoding} encoding: {e}")
    
    async def _handle_write_file(self, share_name: str, file_path: str, content: str, encoding: str = "utf-8") -> List[types.TextContent]:
        """Handle file writing."""
        connection = await self._get_connection(share_name)
        
        # Validate operation
        self.security.validate_write_operation(file_path)
        
        # Encode content
        try:
            content_bytes = content.encode(encoding)
        except UnicodeEncodeError as e:
            raise ValidationError(f"Failed to encode content with {encoding} encoding: {e}")
        
        # Validate file size
        self.security.validate_file_size(len(content_bytes))
        
        await connection.write_file(file_path, content_bytes)
        
        size_str = self._format_file_size(len(content_bytes))
        return [types.TextContent(type="text", text=f"Successfully wrote {size_str} to {share_name}:{file_path}")]
    
    async def _handle_delete_file(self, share_name: str, file_path: str) -> List[types.TextContent]:
        """Handle file deletion."""
        connection = await self._get_connection(share_name)
        
        # Validate operation
        self.security.validate_delete_operation(file_path)
        
        await connection.delete_file(file_path)
        
        return [types.TextContent(type="text", text=f"Successfully deleted {share_name}:{file_path}")]
    
    async def _handle_create_directory(self, share_name: str, directory_path: str) -> List[types.TextContent]:
        """Handle directory creation."""
        connection = await self._get_connection(share_name)
        
        # Validate operation
        self.security.validate_write_operation(directory_path)
        
        await connection.create_directory(directory_path)
        
        return [types.TextContent(type="text", text=f"Successfully created directory {share_name}:{directory_path}")]
    
    async def _handle_get_file_info(self, share_name: str, path: str) -> List[types.TextContent]:
        """Handle file info retrieval."""
        connection = await self._get_connection(share_name)
        
        # Validate path
        self.security.validate_file_path(path)
        
        file_info = await connection.get_file_info(path)
        
        info_lines = []
        info_lines.append(f"Information for {share_name}:{path}")
        info_lines.append("-" * 50)
        info_lines.append(f"Name: {file_info.name}")
        info_lines.append(f"Type: {'Directory' if file_info.is_directory else 'File'}")
        
        if not file_info.is_directory:
            size_str = self._format_file_size(file_info.size)
            info_lines.append(f"Size: {size_str}")
        
        if file_info.modified_time:
            import datetime
            modified_dt = datetime.datetime.fromtimestamp(file_info.modified_time)
            info_lines.append(f"Modified: {modified_dt.strftime('%Y-%m-%d %H:%M:%S')}")
        
        return [types.TextContent(type="text", text="\n".join(info_lines))]
    
    async def _handle_get_share_info(self, share_name: Optional[str] = None) -> List[types.TextContent]:
        """Handle share info retrieval."""
        if share_name:
            if share_name not in self.config.shares:
                raise ConfigurationError(f"Share '{share_name}' not configured")
            
            shares_to_show = {share_name: self.config.shares[share_name]}
        else:
            shares_to_show = self.config.shares
        
        info_lines = []
        info_lines.append("Network Share Information")
        info_lines.append("=" * 50)
        
        for name, config in shares_to_show.items():
            info_lines.append(f"\nShare: {name}")
            info_lines.append(f"Type: {config.type.upper()}")
            
            if isinstance(config, SMBShareConfig):
                info_lines.append(f"Host: {config.host}:{config.port}")
                info_lines.append(f"Share Name: {config.share_name}")
                info_lines.append(f"Domain: {config.domain or '(none)'}")
                info_lines.append(f"Username: {config.username}")
                info_lines.append(f"Connected: {'Yes' if name in self.connections else 'No'}")
        
        info_lines.append(f"\nSecurity Settings:")
        info_lines.append(self.security.get_validation_summary())
        
        return [types.TextContent(type="text", text="\n".join(info_lines))]
    
    def _format_file_size(self, size_bytes: int) -> str:
        """Format file size in human-readable format."""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.1f} MB"
        else:
            return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"
    
    async def cleanup(self) -> None:
        """Cleanup connections."""
        for connection in self.connections.values():
            await connection.disconnect()
        self.connections.clear()
    
    async def run(self, transport: str = "stdio") -> None:
        """Run the MCP server."""
        try:
            if transport == "stdio":
                async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
                    initialization_options = InitializationOptions(
                        server_name="network-mcp-server",
                        server_version="0.1.0",
                        capabilities=types.ServerCapabilities(
                            tools=types.ToolsCapability(listChanged=True)
                        )
                    )
                    await self.server.run(read_stream, write_stream, initialization_options)
            else:
                raise ValueError(f"Unsupported transport: {transport}")
        
        except KeyboardInterrupt:
            logger.info("Server interrupted by user")
        except Exception as e:
            logger.error(f"Server error: {e}", exc_info=True)
        finally:
            await self.cleanup()


def load_config(config_path: str) -> NetworkMCPConfig:
    """Load configuration from file."""
    try:
        with open(config_path, 'r') as f:
            config_data = json.load(f)
        
        # Convert share configs to proper types
        shares = {}
        for name, share_data in config_data.get('shares', {}).items():
            share_type = share_data.get('type', 'smb')
            
            if share_type == 'smb':
                shares[name] = SMBShareConfig(**share_data)
            else:
                raise ConfigurationError(f"Unsupported share type: {share_type}")
        
        config_data['shares'] = shares
        return NetworkMCPConfig(**config_data)
        
    except FileNotFoundError:
        raise ConfigurationError(f"Configuration file not found: {config_path}")
    except json.JSONDecodeError as e:
        raise ConfigurationError(f"Invalid JSON in configuration file: {e}")
    except Exception as e:
        raise ConfigurationError(f"Error loading configuration: {e}")


def main() -> None:
    """Main entry point for the server."""
    from .cli import cli_main
    cli_main()