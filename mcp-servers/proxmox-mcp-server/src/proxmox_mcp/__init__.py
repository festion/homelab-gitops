"""
Proxmox MCP Server - Model Context Protocol server for Proxmox VE management.

This package provides comprehensive Proxmox VE management capabilities through
the Model Context Protocol, including system assessment, resource monitoring,
storage management, and automated maintenance operations.
"""

__version__ = "1.0.0"
__author__ = "MCP Servers Project"
__description__ = "Proxmox VE management through Model Context Protocol"

from .config import ProxmoxMCPConfig
from .exceptions import ProxmoxMCPError

# Conditional imports to avoid dependency issues during development
try:
    from .server import ProxmoxMCPServer
    __all__ = ["ProxmoxMCPServer", "ProxmoxMCPConfig", "ProxmoxMCPError"]
except ImportError:
    # Dependencies not installed, skip server import
    __all__ = ["ProxmoxMCPConfig", "ProxmoxMCPError"]