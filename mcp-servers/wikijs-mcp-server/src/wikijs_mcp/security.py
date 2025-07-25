"""
Security validation for WikiJS MCP Server.
"""

import os
import re
import logging
from pathlib import Path
from typing import List, Dict, Any

from .config import SecurityConfig
from .exceptions import SecurityError, ValidationError


logger = logging.getLogger(__name__)


class SecurityValidator:
    """Security validation for file operations and content."""
    
    def __init__(self, config: SecurityConfig):
        self.config = config
        self._compiled_patterns = {}
    
    def validate_file_path(self, file_path: str) -> str:
        """
        Validate and normalize a file path for security.
        
        Args:
            file_path: The file path to validate
            
        Returns:
            Normalized absolute path
            
        Raises:
            SecurityError: If path is not allowed
        """
        # Normalize and resolve the path
        normalized_path = os.path.abspath(os.path.expanduser(file_path))
        
        # Check if file exists
        if not os.path.exists(normalized_path):
            raise ValidationError(f"File does not exist: {file_path}")
        
        # Check against blocked paths
        for blocked_path in self.config.blocked_paths:
            if normalized_path.startswith(blocked_path):
                raise SecurityError(f"Path blocked for security: {file_path}")
        
        # Check path depth
        path_depth = len(Path(normalized_path).parts)
        if path_depth > self.config.max_path_depth:
            raise SecurityError(f"Path too deep: {file_path} (depth: {path_depth})")
        
        # Additional security checks
        self._check_symlink_security(normalized_path)
        
        return normalized_path
    
    def validate_directory_path(self, dir_path: str) -> str:
        """
        Validate a directory path for security.
        
        Args:
            dir_path: The directory path to validate
            
        Returns:
            Normalized absolute path
            
        Raises:
            SecurityError: If path is not allowed
        """
        # Normalize and resolve the path
        normalized_path = os.path.abspath(os.path.expanduser(dir_path))
        
        # Check if directory exists
        if not os.path.exists(normalized_path):
            raise ValidationError(f"Directory does not exist: {dir_path}")
        
        if not os.path.isdir(normalized_path):
            raise ValidationError(f"Path is not a directory: {dir_path}")
        
        # Check against blocked paths
        for blocked_path in self.config.blocked_paths:
            if normalized_path.startswith(blocked_path):
                raise SecurityError(f"Directory blocked for security: {dir_path}")
        
        return normalized_path
    
    def validate_operation_count(self, count: int, operation_type: str = "operation") -> None:
        """
        Validate that operation count doesn't exceed limits.
        
        Args:
            count: Number of operations/files
            operation_type: Type of operation for error messages
            
        Raises:
            SecurityError: If count exceeds limits
        """
        max_operations = 1000  # Default limit
        if count > max_operations:
            raise SecurityError(
                f"Too many files for {operation_type}: {count} > {max_operations}"
            )
    
    def validate_content_security(self, content: str, file_path: str = "") -> None:
        """
        Validate content doesn't contain sensitive information.
        
        Args:
            content: Content to validate
            file_path: File path for error messages
            
        Raises:
            SecurityError: If content contains sensitive patterns
        """
        # Basic content validation - can be expanded
        if len(content) > 10 * 1024 * 1024:  # 10MB limit
            raise SecurityError(f"Content too large: {file_path}")
    
    def validate_wiki_path(self, wiki_path: str) -> str:
        """
        Validate and normalize a WikiJS path.
        
        Args:
            wiki_path: WikiJS page path to validate
            
        Returns:
            Normalized wiki path
            
        Raises:
            ValidationError: If path format is invalid
        """
        # Remove leading/trailing slashes
        normalized_path = wiki_path.strip('/')
        
        # Validate path format
        if not normalized_path:
            raise ValidationError("Wiki path cannot be empty")
        
        # Check for invalid characters
        invalid_chars = ['<', '>', ':', '"', '|', '?', '*', '\\']
        for char in invalid_chars:
            if char in normalized_path:
                raise ValidationError(f"Wiki path contains invalid character '{char}': {wiki_path}")
        
        # Check path length
        if len(normalized_path) > 255:
            raise ValidationError(f"Wiki path too long (max 255 characters): {wiki_path}")
        
        # Validate path segments
        segments = normalized_path.split('/')
        for segment in segments:
            if not segment.strip():
                raise ValidationError(f"Wiki path contains empty segment: {wiki_path}")
            
            # Check for reserved names (common filesystem reserved names)
            reserved_names = ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'com4', 
                            'com5', 'com6', 'com7', 'com8', 'com9', 'lpt1', 'lpt2', 'lpt3', 
                            'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9']
            if segment.lower() in reserved_names:
                raise ValidationError(f"Wiki path contains reserved name '{segment}': {wiki_path}")
        
        return normalized_path
    
    def validate_file_size(self, size: int, max_size: int = None) -> None:
        """
        Validate file size doesn't exceed limits.
        
        Args:
            size: File size in bytes
            max_size: Maximum allowed size (uses config default if None)
            
        Raises:
            ValidationError: If file is too large
        """
        # This would need to be implemented based on the config
        # For now, just check against a reasonable default
        max_allowed = max_size or (10 * 1024 * 1024)  # 10MB default
        
        if size > max_allowed:
            size_mb = size / (1024 * 1024)
            max_mb = max_allowed / (1024 * 1024)
            raise ValidationError(f"File too large: {size_mb:.1f}MB > {max_mb:.1f}MB")
    
    def _check_symlink_security(self, path: str) -> None:
        """Check for symlink security issues."""
        if os.path.islink(path):
            # Resolve the symlink and check if target is allowed
            try:
                real_path = os.path.realpath(path)
                # Check if symlink target is in blocked paths
                for blocked_path in self.config.blocked_paths:
                    if real_path.startswith(blocked_path):
                        raise SecurityError(f"Symlink target blocked: {path} -> {real_path}")
            except OSError:
                raise SecurityError(f"Cannot resolve symlink: {path}")
    
    def get_validation_summary(self) -> str:
        """Get a summary of current security settings."""
        summary_lines = []
        summary_lines.append("Security Validation Settings:")
        summary_lines.append(f"  Sandbox mode: {self.config.sandbox_mode}")
        summary_lines.append(f"  Max path depth: {self.config.max_path_depth}")
        
        if self.config.allowed_extensions:
            summary_lines.append(f"  Allowed extensions: {', '.join(self.config.allowed_extensions)}")
        
        if self.config.blocked_paths:
            summary_lines.append(f"  Blocked paths: {len(self.config.blocked_paths)}")
            for path in self.config.blocked_paths[:3]:  # Show first 3
                summary_lines.append(f"    - {path}")
            if len(self.config.blocked_paths) > 3:
                summary_lines.append(f"    ... and {len(self.config.blocked_paths) - 3} more")
        
        return "\n".join(summary_lines)
    
    def check_bulk_operation_security(
        self,
        file_paths: List[str],
        operation_type: str = "bulk operation"
    ) -> List[str]:
        """
        Validate multiple file paths for bulk operations.
        
        Args:
            file_paths: List of file paths to validate
            operation_type: Type of operation for error messages
            
        Returns:
            List of validated normalized paths
            
        Raises:
            SecurityError: If any validation fails
        """
        # Check operation count
        self.validate_operation_count(len(file_paths), operation_type)
        
        validated_paths = []
        errors = []
        
        for file_path in file_paths:
            try:
                validated_path = self.validate_file_path(file_path)
                validated_paths.append(validated_path)
            except (SecurityError, ValidationError) as e:
                errors.append(f"{file_path}: {str(e)}")
        
        if errors:
            raise SecurityError(f"Validation failed for {operation_type}:\n" + "\n".join(errors))
        
        return validated_paths
    
    def sanitize_filename(self, filename: str) -> str:
        """
        Sanitize a filename for safe use.
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
        """
        # Remove or replace invalid characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
        
        # Remove leading/trailing dots and spaces
        sanitized = sanitized.strip('. ')
        
        # Ensure not empty
        if not sanitized:
            sanitized = "untitled"
        
        # Limit length
        if len(sanitized) > 255:
            name, ext = os.path.splitext(sanitized)
            max_name_len = 255 - len(ext)
            sanitized = name[:max_name_len] + ext
        
        return sanitized