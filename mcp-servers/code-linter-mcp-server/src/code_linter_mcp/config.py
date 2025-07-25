"""
Configuration models for the Code Linter MCP Server.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, validator
import re


class LinterConfig(BaseModel):
    """Configuration for a specific linter."""
    
    enabled: bool = True
    command: Optional[str] = None  # Custom command path
    args: List[str] = Field(default_factory=list)  # Additional arguments
    config_file: Optional[str] = None  # Custom config file path
    severity_levels: List[str] = Field(default_factory=lambda: ["error", "warning"])
    max_line_length: Optional[int] = None
    timeout: int = 30  # Timeout in seconds


class LanguageConfig(BaseModel):
    """Configuration for a programming language."""
    
    extensions: List[str]
    linters: Dict[str, LinterConfig]
    default_linters: List[str] = Field(default_factory=list)
    custom_rules: Dict[str, Any] = Field(default_factory=dict)


class SecurityConfig(BaseModel):
    """Security configuration for the linter."""
    
    allowed_file_extensions: List[str] = Field(default_factory=lambda: [
        ".py", ".go", ".js", ".ts", ".jsx", ".tsx", ".json", ".yaml", ".yml",
        ".toml", ".xml", ".html", ".css", ".scss", ".sass", ".sql", ".sh",
        ".ps1", ".bat", ".dockerfile", ".md", ".rst", ".ini", ".cfg", ".conf"
    ])
    blocked_patterns: List[str] = Field(default_factory=lambda: [
        r".*\.exe$", r".*\.dll$", r".*\.so$", r".*\.dylib$"
    ])
    max_file_size: str = "10MB"
    allow_network: bool = False  # Whether linters can access network
    sandbox_mode: bool = True   # Run linters in restricted environment


class SerenaIntegrationConfig(BaseModel):
    """Configuration for Serena integration."""
    
    block_on_error: bool = True     # Block file saves on linting errors
    block_on_warning: bool = False  # Block file saves on warnings
    auto_fix: bool = False          # Attempt automatic fixes
    backup_before_fix: bool = True  # Create backup before auto-fix
    integration_mode: str = "strict"  # strict, permissive, advisory


class CodeLinterConfig(BaseModel):
    """Main configuration for the Code Linter MCP Server."""
    
    languages: Dict[str, LanguageConfig] = Field(default_factory=dict)
    security: SecurityConfig = Field(default_factory=SecurityConfig)
    serena_integration: SerenaIntegrationConfig = Field(default_factory=SerenaIntegrationConfig)
    global_timeout: int = 60
    concurrent_linters: int = 4
    cache_results: bool = True
    cache_duration: int = 300  # 5 minutes
    log_level: str = "INFO"
    
    @validator('languages')
    def validate_languages(cls, v):
        """Validate language configurations."""
        if not v:
            # Provide default language configurations
            return cls._get_default_languages()
        return v
    
    @staticmethod
    def _get_default_languages() -> Dict[str, LanguageConfig]:
        """Get default language configurations."""
        return {
            "python": LanguageConfig(
                extensions=[".py", ".pyw"],
                linters={
                    "flake8": LinterConfig(
                        args=["--max-line-length=88", "--extend-ignore=E203,W503"]
                    ),
                    "black": LinterConfig(
                        args=["--check", "--diff"]
                    ),
                    "mypy": LinterConfig(
                        args=["--ignore-missing-imports"]
                    ),
                    "pylint": LinterConfig(
                        enabled=False  # Can be resource intensive
                    )
                },
                default_linters=["flake8", "black", "mypy"]
            ),
            "go": LanguageConfig(
                extensions=[".go"],
                linters={
                    "gofmt": LinterConfig(),
                    "golint": LinterConfig(),
                    "govet": LinterConfig(),
                    "staticcheck": LinterConfig()
                },
                default_linters=["gofmt", "govet"]
            ),
            "javascript": LanguageConfig(
                extensions=[".js", ".jsx"],
                linters={
                    "eslint": LinterConfig(),
                    "prettier": LinterConfig(args=["--check"])
                },
                default_linters=["eslint"]
            ),
            "typescript": LanguageConfig(
                extensions=[".ts", ".tsx"],
                linters={
                    "eslint": LinterConfig(args=["--parser=@typescript-eslint/parser"]),
                    "tsc": LinterConfig(args=["--noEmit"]),
                    "prettier": LinterConfig(args=["--check"])
                },
                default_linters=["eslint", "tsc"]
            ),
            "yaml": LanguageConfig(
                extensions=[".yaml", ".yml"],
                linters={
                    "yamllint": LinterConfig()
                },
                default_linters=["yamllint"]
            ),
            "json": LanguageConfig(
                extensions=[".json"],
                linters={
                    "jsonlint": LinterConfig()
                },
                default_linters=["jsonlint"]
            )
        }


def parse_file_size(size_str: str) -> int:
    """Parse file size string (e.g., '10MB') to bytes."""
    size_str = size_str.upper().strip()
    
    multipliers = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024
    }
    
    pattern = r'^(\d+(?:\.\d+)?)\s*([KMGT]?B)$'
    match = re.match(pattern, size_str)
    
    if not match:
        raise ValueError(f"Invalid file size format: {size_str}")
    
    value, unit = match.groups()
    return int(float(value) * multipliers[unit])