"""
Security validation for the Code Linter MCP Server.
"""

import logging
import os
import re
from pathlib import Path
from typing import List

from .config import SecurityConfig, parse_file_size
from .exceptions import SecurityError

logger = logging.getLogger(__name__)


class SecurityValidator:
    """Validates file operations against security policies."""
    
    def __init__(self, config: SecurityConfig):
        self.config = config
        self.max_file_size_bytes = parse_file_size(config.max_file_size)
        self.blocked_pattern_compiled = [
            re.compile(pattern, re.IGNORECASE) 
            for pattern in config.blocked_patterns
        ]
    
    def validate_file_extension(self, filename: str) -> bool:
        """Validate if file extension is allowed."""
        file_ext = Path(filename).suffix.lower()
        allowed = file_ext in [ext.lower() for ext in self.config.allowed_file_extensions]
        
        if not allowed:
            logger.warning(f"File extension {file_ext} not allowed for {filename}")
        
        return allowed
    
    def validate_file_path(self, file_path: str) -> bool:
        """Validate if file path is safe."""
        # Check for blocked patterns
        for pattern in self.blocked_pattern_compiled:
            if pattern.search(file_path):
                logger.warning(f"File path {file_path} matches blocked pattern")
                return False
        
        # Check for path traversal attempts
        normalized_path = os.path.normpath(file_path)
        if ".." in normalized_path or normalized_path.startswith("/"):
            logger.warning(f"Path traversal detected in {file_path}")
            return False
        
        return True
    
    def validate_file_size(self, file_path: str) -> bool:
        """Validate if file size is within limits."""
        try:
            file_size = os.path.getsize(file_path)
            if file_size > self.max_file_size_bytes:
                logger.warning(
                    f"File {file_path} size {file_size} exceeds limit {self.max_file_size_bytes}"
                )
                return False
            return True
        except OSError as e:
            logger.error(f"Error checking file size for {file_path}: {e}")
            return False
    
    def validate_content(self, content: str) -> bool:
        """Validate file content for security issues."""
        # Check for suspicious patterns
        suspicious_patterns = [
            r'eval\s*\(',          # eval() calls
            r'exec\s*\(',          # exec() calls  
            r'__import__\s*\(',    # dynamic imports
            r'subprocess\.',       # subprocess usage
            r'os\.system\(',       # system calls
            r'shell=True',         # shell execution
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                logger.warning(f"Suspicious pattern detected: {pattern}")
                if not self.config.allow_network:
                    return False
        
        return True
    
    def validate_operation(self, operation: str) -> bool:
        """Validate if operation is allowed."""
        # All linting operations are read-only, so they're generally safe
        allowed_operations = ["lint", "validate", "check", "format", "analyze"]
        return operation.lower() in allowed_operations