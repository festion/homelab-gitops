"""
Custom exceptions for Proxmox MCP Server.
"""


class ProxmoxMCPError(Exception):
    """Base exception for all Proxmox MCP Server errors."""
    pass


class ProxmoxConnectionError(ProxmoxMCPError):
    """Raised when connection to Proxmox server fails."""
    pass


class ProxmoxAuthenticationError(ProxmoxMCPError):
    """Raised when authentication with Proxmox server fails."""
    pass


class ProxmoxAPIError(ProxmoxMCPError):
    """Raised when Proxmox API calls fail."""
    pass


class ProxmoxOperationError(ProxmoxMCPError):
    """Raised when Proxmox operations fail or are invalid."""
    pass


class ProxmoxValidationError(ProxmoxMCPError):
    """Raised when validation of parameters or configuration fails."""
    pass


class ProxmoxSecurityError(ProxmoxMCPError):
    """Raised when security validation fails."""
    pass


class ProxmoxConfigurationError(ProxmoxMCPError):
    """Raised when configuration is invalid or missing."""
    pass