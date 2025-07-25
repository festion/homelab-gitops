"""
Custom exceptions for the Code Linter MCP Server.
"""


class CodeLinterError(Exception):
    """Base exception for all code linter MCP errors."""
    pass


class ValidationError(CodeLinterError):
    """Raised when code validation fails."""
    
    def __init__(self, message: str, file_path: str = None, line_number: int = None, errors: list = None):
        super().__init__(message)
        self.file_path = file_path
        self.line_number = line_number
        self.errors = errors or []


class UnsupportedLanguageError(CodeLinterError):
    """Raised when attempting to lint an unsupported language."""
    pass


class LinterNotFoundError(CodeLinterError):
    """Raised when a required linter tool is not available."""
    pass


class ConfigurationError(CodeLinterError):
    """Raised when there are configuration issues."""
    pass


class SecurityError(CodeLinterError):
    """Raised when security validation fails."""
    pass