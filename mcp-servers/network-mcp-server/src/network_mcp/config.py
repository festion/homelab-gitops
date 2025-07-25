"""Configuration models for the Network MCP Server."""

from typing import Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field


import os
from .exceptions import NetworkMCPError

class SMBShareConfig(BaseModel):
    """Configuration for SMB/CIFS share."""
    
    type: Literal["smb"] = "smb"
    host: str = Field(..., description="SMB server hostname or IP address")
    share_name: str = Field(..., description="Name of the SMB share")
    username: str = Field(..., description="Username for authentication")
    password: Optional[str] = Field(default=None, description="Password for authentication")
    domain: str = Field(default="", description="Domain for authentication")
    port: int = Field(default=445, description="SMB port (usually 445)")
    use_ntlm_v2: bool = Field(default=True, description="Use NTLMv2 authentication")
    timeout: int = Field(default=30, description="Connection timeout in seconds")
    
    # Environment variable overrides
    host_env_var: Optional[str] = Field(default=None, description="Environment variable for host")
    username_env_var: Optional[str] = Field(default=None, description="Environment variable for username")
    password_env_var: Optional[str] = Field(default=None, description="Environment variable for password")
    
    def get_connection_params(self) -> Dict[str, Union[str, int, bool]]:
        """Get connection parameters with environment variable resolution."""
        params = {
            'host': os.getenv(self.host_env_var, self.host) if self.host_env_var else self.host,
            'share_name': self.share_name,
            'username': os.getenv(self.username_env_var, self.username) if self.username_env_var else self.username,
            'domain': self.domain,
            'port': self.port,
            'use_ntlm_v2': self.use_ntlm_v2,
            'timeout': self.timeout,
        }
        
        # Handle password from environment or direct configuration
        if self.password_env_var:
            password = os.getenv(self.password_env_var)
            if not password:
                raise NetworkMCPError(f"Password environment variable {self.password_env_var} not set")
            params['password'] = password
        elif self.password:
            params['password'] = self.password
        else:
            raise NetworkMCPError("No password configured - either set password or password_env_var")
            
        return params


class NFSShareConfig(BaseModel):
    """Configuration for NFS share (future implementation)."""
    
    type: Literal["nfs"] = "nfs"
    host: str = Field(..., description="NFS server hostname or IP address")
    export_path: str = Field(..., description="NFS export path")
    version: str = Field(default="3", description="NFS version")
    mount_options: List[str] = Field(default_factory=list, description="NFS mount options")


class SecurityConfig(BaseModel):
    """Security configuration for the server."""
    
    allowed_extensions: List[str] = Field(
        default_factory=lambda: [".txt", ".py", ".json", ".md", ".yaml", ".yml", ".xml", ".csv"],
        description="Allowed file extensions"
    )
    blocked_extensions: List[str] = Field(
        default_factory=lambda: [".exe", ".bat", ".cmd", ".ps1", ".sh"],
        description="Blocked file extensions"
    )
    max_file_size: str = Field(default="100MB", description="Maximum file size")
    allowed_paths: List[str] = Field(
        default_factory=list,
        description="Allowed paths (empty means all paths allowed)"
    )
    blocked_paths: List[str] = Field(
        default_factory=lambda: ["/etc", "/root", "/sys", "/proc"],
        description="Blocked paths"
    )
    enable_write: bool = Field(default=True, description="Enable write operations")
    enable_delete: bool = Field(default=False, description="Enable delete operations")


class NetworkMCPConfig(BaseModel):
    """Main configuration for the Network MCP Server."""
    
    shares: Dict[str, Union[SMBShareConfig, NFSShareConfig]] = Field(
        ..., description="Configured network shares"
    )
    security: SecurityConfig = Field(
        default_factory=SecurityConfig, description="Security settings"
    )
    logging_level: str = Field(default="INFO", description="Logging level")
    max_connections: int = Field(default=10, description="Maximum concurrent connections")


def parse_file_size(size_str: str) -> int:
    """Parse file size string like '100MB' to bytes."""
    size_str = size_str.upper().strip()
    
    if size_str.endswith('KB'):
        return int(size_str[:-2]) * 1024
    elif size_str.endswith('MB'):
        return int(size_str[:-2]) * 1024 * 1024
    elif size_str.endswith('GB'):
        return int(size_str[:-2]) * 1024 * 1024 * 1024
    elif size_str.endswith('B'):
        return int(size_str[:-1])
    else:
        # Assume bytes if no unit
        return int(size_str)