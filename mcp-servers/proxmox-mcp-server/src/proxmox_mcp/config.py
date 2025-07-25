"""
Configuration management for Proxmox MCP Server using Pydantic models.
"""

import os
from typing import Dict, List, Optional, Union
from pydantic import BaseModel, Field, validator, SecretStr
from .exceptions import ProxmoxConfigurationError


class SecurityConfig(BaseModel):
    """Security configuration for Proxmox operations."""
    
    # Operation restrictions
    allow_vm_operations: bool = True
    allow_storage_operations: bool = True
    allow_snapshot_operations: bool = True
    allow_backup_operations: bool = True
    allow_system_operations: bool = True
    
    # Safety limits
    max_snapshot_age_days: int = Field(default=90, ge=1, le=365)
    max_backup_age_days: int = Field(default=30, ge=1, le=365)
    max_cleanup_items_per_operation: int = Field(default=50, ge=1, le=1000)
    
    # Resource limits
    memory_usage_threshold: float = Field(default=90.0, ge=0.0, le=100.0)
    storage_usage_threshold: float = Field(default=85.0, ge=0.0, le=100.0)
    
    # Validation settings
    require_confirmation_for_destructive_ops: bool = True
    enable_dry_run_mode: bool = False


class MonitoringConfig(BaseModel):
    """Monitoring and alerting configuration."""
    
    enable_monitoring: bool = True
    check_interval_seconds: int = Field(default=300, ge=60, le=3600)
    
    # Thresholds
    cpu_threshold: float = Field(default=80.0, ge=0.0, le=100.0)
    memory_threshold: float = Field(default=85.0, ge=0.0, le=100.0)
    storage_threshold: float = Field(default=90.0, ge=0.0, le=100.0)
    
    # Notification settings
    enable_notifications: bool = False
    notification_endpoints: List[str] = Field(default_factory=list)


class ProxmoxServerConfig(BaseModel):
    """Configuration for a single Proxmox server."""
    
    # Connection settings
    host: str = Field(..., description="Proxmox server hostname or IP")
    port: int = Field(default=8006, ge=1, le=65535)
    
    # Authentication
    username: str = Field(..., description="Proxmox username")
    password: Optional[SecretStr] = Field(default=None, description="Proxmox password")
    realm: str = Field(default="pam", description="Authentication realm")
    
    # API Token authentication (preferred for production)
    token: Optional[SecretStr] = Field(default=None, description="Proxmox API token")
    
    # Connection options
    verify_ssl: bool = Field(default=False, description="Verify SSL certificates")
    timeout: int = Field(default=30, ge=5, le=300, description="Request timeout in seconds")
    
    # Environment variable overrides
    host_env_var: Optional[str] = Field(default=None, description="Environment variable for host")
    username_env_var: Optional[str] = Field(default=None, description="Environment variable for username")
    password_env_var: Optional[str] = Field(default=None, description="Environment variable for password")
    token_env_var: Optional[str] = Field(default=None, description="Environment variable for API token")
    
    @validator('password_env_var', always=True)
    def validate_auth_config(cls, v, values):
        """Validate that either password/password_env_var or token/token_env_var is provided."""
        password = values.get('password')
        token = values.get('token')
        token_env_var = values.get('token_env_var')
        
        # Check if we have any authentication method
        has_password = password is not None or v is not None
        has_token = token is not None or token_env_var is not None
        
        if not has_password and not has_token:
            raise ValueError("Either password/password_env_var or token/token_env_var must be provided")
        return v
    
    def get_connection_params(self) -> Dict[str, Union[str, int, bool]]:
        """Get connection parameters with environment variable resolution."""
        params = {
            'host': os.getenv(self.host_env_var, self.host) if self.host_env_var else self.host,
            'port': self.port,
            'username': os.getenv(self.username_env_var, self.username) if self.username_env_var else self.username,
            'realm': self.realm,
            'verify_ssl': self.verify_ssl,
            'timeout': self.timeout,
        }
        
        # Handle API token first (preferred method)
        if self.token_env_var:
            token = os.getenv(self.token_env_var)
            if token:
                params['token'] = token
                params['auth_method'] = 'token'
                return params
        elif self.token:
            params['token'] = self.token.get_secret_value()
            params['auth_method'] = 'token'
            return params
        
        # Fall back to password authentication
        if self.password_env_var:
            password = os.getenv(self.password_env_var)
            if not password:
                raise ProxmoxConfigurationError(f"Password environment variable {self.password_env_var} not set")
            params['password'] = password
        elif self.password:
            params['password'] = self.password.get_secret_value()
        else:
            raise ProxmoxConfigurationError("No authentication configured")
        
        params['auth_method'] = 'password'
        return params


class AutomationConfig(BaseModel):
    """Configuration for automated operations."""
    
    enable_automation: bool = Field(default=False, description="Enable automated operations")
    
    # Snapshot management
    enable_snapshot_cleanup: bool = Field(default=False, description="Enable automatic snapshot cleanup")
    snapshot_retention_days: int = Field(default=90, ge=1, le=365)
    
    # Backup management  
    enable_backup_cleanup: bool = Field(default=False, description="Enable automatic backup cleanup")
    backup_retention_days: int = Field(default=30, ge=1, le=365)
    
    # Storage optimization
    enable_storage_optimization: bool = Field(default=False, description="Enable automatic storage optimization")
    storage_cleanup_threshold: float = Field(default=85.0, ge=50.0, le=95.0)
    
    # Safety settings
    max_operations_per_run: int = Field(default=25, ge=1, le=100)
    require_manual_confirmation: bool = Field(default=True, description="Require manual confirmation for operations")


class ProxmoxMCPConfig(BaseModel):
    """Main configuration for Proxmox MCP Server."""
    
    # Server definitions (support multiple Proxmox servers)
    servers: Dict[str, ProxmoxServerConfig] = Field(
        ..., 
        description="Proxmox servers configuration",
        min_items=1
    )
    
    # Default server for operations
    default_server: str = Field(
        ..., 
        description="Default server name to use for operations"
    )
    
    # Feature configurations
    security: SecurityConfig = Field(default_factory=SecurityConfig)
    monitoring: MonitoringConfig = Field(default_factory=MonitoringConfig) 
    automation: AutomationConfig = Field(default_factory=AutomationConfig)
    
    # Global settings
    log_level: str = Field(default="INFO", pattern="^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$")
    enable_metrics: bool = Field(default=True, description="Enable performance metrics collection")
    
    @validator('default_server')
    def validate_default_server(cls, v, values):
        """Validate that default_server exists in servers configuration."""
        if 'servers' in values and v not in values['servers']:
            raise ValueError(f"Default server '{v}' not found in servers configuration")
        return v
    
    def get_server_config(self, server_name: Optional[str] = None) -> ProxmoxServerConfig:
        """Get configuration for a specific server or the default server."""
        target_server = server_name or self.default_server
        
        if target_server not in self.servers:
            raise ProxmoxConfigurationError(f"Server '{target_server}' not found in configuration")
            
        return self.servers[target_server]
    
    @classmethod
    def from_file(cls, config_path: str) -> "ProxmoxMCPConfig":
        """Load configuration from JSON file."""
        import json
        
        try:
            with open(config_path, 'r') as f:
                config_data = json.load(f)
            return cls(**config_data)
        except FileNotFoundError:
            raise ProxmoxConfigurationError(f"Configuration file not found: {config_path}")
        except json.JSONDecodeError as e:
            raise ProxmoxConfigurationError(f"Invalid JSON in configuration file: {e}")
        except Exception as e:
            raise ProxmoxConfigurationError(f"Failed to load configuration: {e}")


def create_sample_config() -> Dict:
    """Create a sample configuration dictionary."""
    return {
        "servers": {
            "main": {
                "host": "proxmox.example.com",
                "port": 8006,
                "username": "root",
                "password_env_var": "PROXMOX_PASSWORD",
                "realm": "pam",
                "verify_ssl": False,
                "timeout": 30
            }
        },
        "default_server": "main",
        "security": {
            "allow_vm_operations": True,
            "allow_storage_operations": True,
            "allow_snapshot_operations": True,
            "allow_backup_operations": True,
            "allow_system_operations": True,
            "max_snapshot_age_days": 90,
            "max_backup_age_days": 30,
            "max_cleanup_items_per_operation": 50,
            "memory_usage_threshold": 90.0,
            "storage_usage_threshold": 85.0,
            "require_confirmation_for_destructive_ops": True,
            "enable_dry_run_mode": False
        },
        "monitoring": {
            "enable_monitoring": True,
            "check_interval_seconds": 300,
            "cpu_threshold": 80.0,
            "memory_threshold": 85.0,
            "storage_threshold": 90.0,
            "enable_notifications": False,
            "notification_endpoints": []
        },
        "automation": {
            "enable_automation": False,
            "enable_snapshot_cleanup": False,
            "snapshot_retention_days": 90,
            "enable_backup_cleanup": False,
            "backup_retention_days": 30,
            "enable_storage_optimization": False,
            "storage_cleanup_threshold": 85.0,
            "max_operations_per_run": 25,
            "require_manual_confirmation": True
        },
        "log_level": "INFO",
        "enable_metrics": True
    }