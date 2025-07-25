"""Custom exceptions for the Network MCP Server."""


class NetworkMCPError(Exception):
    """Base exception for Network MCP Server."""
    pass


class NetworkFileSystemError(NetworkMCPError):
    """Error in network filesystem operations."""
    pass


class AuthenticationError(NetworkMCPError):
    """Authentication failed."""
    pass


class FileNotFoundError(NetworkFileSystemError):
    """File or directory not found."""
    pass


class PermissionError(NetworkFileSystemError):
    """Permission denied."""
    pass


class ConfigurationError(NetworkMCPError):
    """Configuration error."""
    pass


class ValidationError(NetworkMCPError):
    """Validation error."""
    pass