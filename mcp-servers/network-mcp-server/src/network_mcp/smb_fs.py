"""SMB/CIFS filesystem implementation with async wrapper."""

import io
import logging
import os
from pathlib import Path
from typing import Dict, List, Optional, Union

# Using pysmb for SMB/CIFS support
from smb.SMBConnection import SMBConnection as PySMBConnection

from .config import SMBShareConfig
from .exceptions import NetworkFileSystemError, AuthenticationError, FileNotFoundError


logger = logging.getLogger(__name__)


class SMBFileInfo:
    """File information from SMB share."""
    
    def __init__(self, name: str, path: str, is_directory: bool, size: int, 
                 modified_time: Optional[float] = None):
        self.name = name
        self.path = path
        self.is_directory = is_directory
        self.size = size
        self.modified_time = modified_time


class SMBConnection:
    """Manages SMB/CIFS connections and operations using pysmb."""
    
    def __init__(self, config: SMBShareConfig):
        self.config = config
        self.connection: Optional[PySMBConnection] = None
        self._connected = False
    
    def connect(self) -> None:
        """Establish connection to SMB share."""
        try:
            # Create SMB connection
            self.connection = PySMBConnection(
                username=self.config.username,
                password=self.config.password,
                my_name="network-mcp-client",
                remote_name=self.config.host,
                domain=self.config.domain,
                use_ntlm_v2=self.config.use_ntlm_v2,
                is_direct_tcp=True  # Use direct TCP connection (port 445)
            )
            
            # Connect to server
            connected = self.connection.connect(
                self.config.host, 
                self.config.port,
                timeout=self.config.timeout
            )
            
            if not connected:
                raise NetworkFileSystemError("Failed to connect to SMB server")
            
            self._connected = True
            logger.info(f"Connected to SMB share {self.config.host}\\{self.config.share_name}")
            
        except Exception as e:
            logger.error(f"SMB connection failed: {e}")
            if "authentication" in str(e).lower() or "login" in str(e).lower():
                raise AuthenticationError(f"SMB authentication failed: {e}")
            raise NetworkFileSystemError(f"SMB connection failed: {e}")
    
    def disconnect(self) -> None:
        """Close SMB connection."""
        try:
            if self.connection and self._connected:
                self.connection.close()
            self._connected = False
            logger.info("Disconnected from SMB share")
        except Exception as e:
            logger.warning(f"Error during SMB disconnect: {e}")
    
    def _ensure_connected(self) -> None:
        """Ensure we have an active connection."""
        if not self._connected or not self.connection:
            raise NetworkFileSystemError("Not connected to SMB share")
    
    def _normalize_path(self, path: str) -> str:
        """Normalize path for SMB operations."""
        # Convert backslashes to forward slashes for pysmb
        path = path.replace('\\', '/')
        
        # Remove leading slash if present
        if path.startswith('/'):
            path = path[1:]
        
        return path
    
    def list_directory(self, path: str = "") -> List[SMBFileInfo]:
        """List contents of a directory."""
        self._ensure_connected()
        
        try:
            normalized_path = self._normalize_path(path)
            
            # List directory contents
            file_list = self.connection.listPath(self.config.share_name, normalized_path or "/")
            
            result = []
            for file_info in file_list:
                if file_info.filename in ['.', '..']:
                    continue
                
                entry_path = os.path.join(path, file_info.filename).replace('\\', '/')
                is_directory = file_info.isDirectory
                
                smb_file_info = SMBFileInfo(
                    name=file_info.filename,
                    path=entry_path,
                    is_directory=is_directory,
                    size=file_info.file_size if not is_directory else 0,
                    modified_time=file_info.last_write_time if file_info.last_write_time else None
                )
                result.append(smb_file_info)
            
            return result
            
        except Exception as e:
            if "not found" in str(e).lower() or "no such file" in str(e).lower():
                raise FileNotFoundError(f"Directory not found: {path}")
            logger.error(f"SMB directory listing failed for {path}: {e}")
            raise NetworkFileSystemError(f"Failed to list directory {path}: {e}")
    
    def read_file(self, path: str) -> bytes:
        """Read contents of a file."""
        self._ensure_connected()
        
        try:
            normalized_path = self._normalize_path(path)
            
            # Read file into BytesIO buffer
            file_buffer = io.BytesIO()
            self.connection.retrieveFile(self.config.share_name, normalized_path, file_buffer)
            
            content = file_buffer.getvalue()
            file_buffer.close()
            
            return content
            
        except Exception as e:
            if "not found" in str(e).lower() or "no such file" in str(e).lower():
                raise FileNotFoundError(f"File not found: {path}")
            logger.error(f"SMB file read failed for {path}: {e}")
            raise NetworkFileSystemError(f"Failed to read file {path}: {e}")
    
    def write_file(self, path: str, content: Union[str, bytes]) -> None:
        """Write contents to a file."""
        self._ensure_connected()
        
        try:
            if isinstance(content, str):
                content = content.encode('utf-8')
            
            normalized_path = self._normalize_path(path)
            
            # Write file from BytesIO buffer
            file_buffer = io.BytesIO(content)
            self.connection.storeFile(self.config.share_name, normalized_path, file_buffer)
            file_buffer.close()
            
            logger.info(f"Successfully wrote {len(content)} bytes to {path}")
            
        except Exception as e:
            logger.error(f"SMB file write failed for {path}: {e}")
            raise NetworkFileSystemError(f"Failed to write file {path}: {e}")
    
    def delete_file(self, path: str) -> None:
        """Delete a file."""
        self._ensure_connected()
        
        try:
            normalized_path = self._normalize_path(path)
            self.connection.deleteFiles(self.config.share_name, normalized_path)
            logger.info(f"Successfully deleted file {path}")
            
        except Exception as e:
            if "not found" in str(e).lower() or "no such file" in str(e).lower():
                raise FileNotFoundError(f"File not found: {path}")
            logger.error(f"SMB file deletion failed for {path}: {e}")
            raise NetworkFileSystemError(f"Failed to delete file {path}: {e}")
    
    def create_directory(self, path: str) -> None:
        """Create a directory."""
        self._ensure_connected()
        
        try:
            normalized_path = self._normalize_path(path)
            self.connection.createDirectory(self.config.share_name, normalized_path)
            logger.info(f"Successfully created directory {path}")
            
        except Exception as e:
            if "already exists" in str(e).lower() or "file exists" in str(e).lower():
                logger.info(f"Directory {path} already exists")
                return
            logger.error(f"SMB directory creation failed for {path}: {e}")
            raise NetworkFileSystemError(f"Failed to create directory {path}: {e}")
    
    def get_file_info(self, path: str) -> SMBFileInfo:
        """Get information about a file or directory."""
        self._ensure_connected()
        
        try:
            normalized_path = self._normalize_path(path)
            
            # Get file attributes
            attributes = self.connection.getAttributes(self.config.share_name, normalized_path)
            
            return SMBFileInfo(
                name=os.path.basename(path),
                path=path,
                is_directory=attributes.isDirectory,
                size=attributes.file_size if not attributes.isDirectory else 0,
                modified_time=attributes.last_write_time if attributes.last_write_time else None
            )
            
        except Exception as e:
            if "not found" in str(e).lower() or "no such file" in str(e).lower():
                raise FileNotFoundError(f"File or directory not found: {path}")
            logger.error(f"SMB file info query failed for {path}: {e}")
            raise NetworkFileSystemError(f"Failed to get info for {path}: {e}")


# Async wrapper for SMB operations
class AsyncSMBConnection:
    """Async wrapper for SMB connection operations."""
    
    def __init__(self, config: SMBShareConfig):
        self.smb_connection = SMBConnection(config)
    
    async def connect(self) -> None:
        """Connect to SMB share asynchronously."""
        import asyncio
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.smb_connection.connect)
    
    async def disconnect(self) -> None:
        """Disconnect from SMB share asynchronously."""
        import asyncio
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.smb_connection.disconnect)
    
    async def list_directory(self, path: str = "") -> List[SMBFileInfo]:
        """List directory contents asynchronously."""
        import asyncio
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.smb_connection.list_directory, path)
    
    async def read_file(self, path: str) -> bytes:
        """Read file contents asynchronously."""
        import asyncio
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.smb_connection.read_file, path)
    
    async def write_file(self, path: str, content: Union[str, bytes]) -> None:
        """Write file contents asynchronously."""
        import asyncio
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.smb_connection.write_file, path, content)
    
    async def delete_file(self, path: str) -> None:
        """Delete file asynchronously."""
        import asyncio
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.smb_connection.delete_file, path)
    
    async def create_directory(self, path: str) -> None:
        """Create directory asynchronously."""
        import asyncio
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.smb_connection.create_directory, path)
    
    async def get_file_info(self, path: str) -> SMBFileInfo:
        """Get file info asynchronously."""
        import asyncio
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.smb_connection.get_file_info, path)