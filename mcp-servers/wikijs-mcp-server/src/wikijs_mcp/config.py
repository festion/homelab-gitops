"""Configuration models for WikiJS MCP Server."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl
import json


class WikiJSConfig(BaseModel):
    """Configuration for WikiJS connection."""
    
    url: HttpUrl = Field(..., description="WikiJS instance URL")
    api_key: str = Field(..., description="WikiJS API key")
    default_locale: str = Field(default="en", description="Default locale for pages")
    default_editor: str = Field(default="markdown", description="Default editor type")
    default_tags: List[str] = Field(default_factory=list, description="Default tags for new pages")
    timeout: int = Field(default=30, description="API request timeout in seconds")
    retry_attempts: int = Field(default=3, description="Number of retry attempts for failed requests")


class DocumentDiscoveryConfig(BaseModel):
    """Configuration for document discovery and scanning."""
    
    search_paths: List[str] = Field(default_factory=list, description="Base paths to search for documents")
    include_patterns: List[str] = Field(default_factory=lambda: ["*.md"], description="File patterns to include")
    exclude_patterns: List[str] = Field(
        default_factory=lambda: ["node_modules/**", ".git/**", "**/.git/**", "**/node_modules/**"],
        description="File patterns to exclude"
    )
    max_file_size: str = Field(default="10MB", description="Maximum file size to process")
    max_files_per_scan: int = Field(default=1000, description="Maximum files to process in single scan")
    follow_symlinks: bool = Field(default=False, description="Whether to follow symbolic links")
    extract_frontmatter: bool = Field(default=True, description="Extract YAML frontmatter from documents")
    extract_links: bool = Field(default=True, description="Extract internal and external links")


class SecurityConfig(BaseModel):
    """Security configuration for file operations."""
    
    allowed_extensions: List[str] = Field(
        default_factory=lambda: [".md", ".txt", ".json", ".yaml", ".yml"],
        description="Allowed file extensions for processing"
    )
    blocked_paths: List[str] = Field(
        default_factory=lambda: ["/etc", "/usr", "/bin", "/sbin", "/sys", "/proc"],
        description="Blocked paths for security"
    )
    max_path_depth: int = Field(default=20, description="Maximum directory depth to traverse")
    sandbox_mode: bool = Field(default=True, description="Enable sandbox mode for file operations")


class AIProcessingConfig(BaseModel):
    """Configuration for AI-based content processing."""
    
    enable_content_enhancement: bool = Field(default=True, description="Enable AI content enhancement")
    enable_metadata_extraction: bool = Field(default=True, description="Enable AI metadata extraction")
    enable_topic_classification: bool = Field(default=True, description="Enable AI topic classification")
    max_content_length: int = Field(default=50000, description="Maximum content length for AI processing")
    temperature: float = Field(default=0.3, description="AI model temperature")
    max_tokens: int = Field(default=4000, description="Maximum tokens for AI responses")


class ServerConfig(BaseModel):
    """Main server configuration."""
    
    wikijs: WikiJSConfig
    document_discovery: DocumentDiscoveryConfig = Field(default_factory=DocumentDiscoveryConfig)
    security: SecurityConfig = Field(default_factory=SecurityConfig)
    ai_processing: AIProcessingConfig = Field(default_factory=AIProcessingConfig)
    
    @classmethod
    def from_file(cls, config_path: str) -> "ServerConfig":
        """Load configuration from JSON file."""
        with open(config_path, 'r') as f:
            config_data = json.load(f)
        return cls(**config_data)
    
    def to_file(self, config_path: str) -> None:
        """Save configuration to JSON file."""
        with open(config_path, 'w') as f:
            json.dump(self.model_dump(), f, indent=2)