"""
Main MCP Server for WikiJS integration.
"""

import asyncio
import json
import logging
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

import mcp.server.stdio
from mcp import types
from mcp.server import Server
from mcp.server.models import InitializationOptions

from .config import ServerConfig
from .wikijs_client import WikiJSClient
from .document_scanner import DocumentScanner, ScanResult
from .security import SecurityValidator
from .exceptions import WikiJSMCPError, WikiJSAPIError, SecurityError, ValidationError, ConfigurationError
from .ai_processor import AIContentProcessor, DEFAULT_AI_CONFIG


logger = logging.getLogger(__name__)


class WikiJSMCPServer:
    """WikiJS MCP Server for document management and WikiJS integration."""
    
    def __init__(self, config: ServerConfig):
        self.config = config
        self.server = Server("wikijs-mcp-server")
        self.security = SecurityValidator(config.security)
        self.scanner = DocumentScanner(config.document_discovery, config.security)
        self.wikijs_client = WikiJSClient(config.wikijs)
        
        # Initialize AI processor
        ai_config = getattr(config, 'ai_processing', DEFAULT_AI_CONFIG)
        self.ai_processor = AIContentProcessor(ai_config)
        
        self._setup_logging()
        self._register_tools()
    
    def _setup_logging(self) -> None:
        """Configure logging."""
        log_level = logging.INFO
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    def _register_tools(self) -> None:
        """Register MCP tools."""
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[types.Tool]:
            """List available tools."""
            return [
                # Document Discovery Tools
                types.Tool(
                    name="find_markdown_documents",
                    description="Search for Markdown documents in a directory",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "search_path": {
                                "type": "string",
                                "description": "Directory path to search for documents"
                            },
                            "recursive": {
                                "type": "boolean",
                                "description": "Whether to search subdirectories recursively",
                                "default": True
                            },
                            "include_patterns": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "File patterns to include (e.g., ['*.md', '*.markdown'])",
                                "default": ["*.md"]
                            },
                            "exclude_patterns": {
                                "type": "array", 
                                "items": {"type": "string"},
                                "description": "File patterns to exclude",
                                "default": ["node_modules/**", ".git/**"]
                            }
                        },
                        "required": ["search_path"]
                    }
                ),
                types.Tool(
                    name="analyze_document",
                    description="Analyze a single Markdown document and extract metadata",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Path to the document to analyze"
                            }
                        },
                        "required": ["file_path"]
                    }
                ),
                types.Tool(
                    name="get_file_stats",
                    description="Get statistics about files in a directory",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "search_path": {
                                "type": "string",
                                "description": "Directory path to analyze"
                            }
                        },
                        "required": ["search_path"]
                    }
                ),
                
                # WikiJS Integration Tools
                types.Tool(
                    name="test_wikijs_connection",
                    description="Test connection to WikiJS and return system information",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                ),
                types.Tool(
                    name="upload_document_to_wiki",
                    description="Upload a Markdown document to WikiJS",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Path to the Markdown file to upload"
                            },
                            "wiki_path": {
                                "type": "string", 
                                "description": "Target path in WikiJS (e.g., '/documentation/project')"
                            },
                            "title": {
                                "type": "string",
                                "description": "Page title (optional, will be extracted from content if not provided)"
                            },
                            "description": {
                                "type": "string",
                                "description": "Page description (optional)",
                                "default": ""
                            },
                            "tags": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Tags for the page (optional)",
                                "default": []
                            },
                            "overwrite_existing": {
                                "type": "boolean",
                                "description": "Whether to overwrite existing pages",
                                "default": False
                            }
                        },
                        "required": ["file_path", "wiki_path"]
                    }
                ),
                types.Tool(
                    name="get_wiki_page_info",
                    description="Get information about a WikiJS page",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "wiki_path": {
                                "type": "string",
                                "description": "Path to the WikiJS page"
                            },
                            "locale": {
                                "type": "string",
                                "description": "Page locale (optional, uses default if not provided)"
                            }
                        },
                        "required": ["wiki_path"]
                    }
                ),
                types.Tool(
                    name="update_wiki_page",
                    description="Update an existing WikiJS page",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "wiki_path": {
                                "type": "string",
                                "description": "Path to the WikiJS page to update"
                            },
                            "content": {
                                "type": "string",
                                "description": "New content for the page (optional if updating from file)"
                            },
                            "file_path": {
                                "type": "string",
                                "description": "Path to file to read content from (optional if content provided)"
                            },
                            "title": {
                                "type": "string",
                                "description": "New title for the page (optional)"
                            },
                            "description": {
                                "type": "string",
                                "description": "New description for the page (optional)"
                            },
                            "tags": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "New tags for the page (optional)"
                            }
                        },
                        "required": ["wiki_path"]
                    }
                ),
                types.Tool(
                    name="search_wiki_pages",
                    description="Search for pages in WikiJS",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query"
                            },
                            "locale": {
                                "type": "string",
                                "description": "Locale to search in (optional)"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Maximum number of results",
                                "default": 20
                            }
                        },
                        "required": ["query"]
                    }
                ),
                types.Tool(
                    name="migrate_directory_to_wiki",
                    description="Migrate an entire directory of Markdown files to WikiJS",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "source_path": {
                                "type": "string",
                                "description": "Source directory containing Markdown files"
                            },
                            "target_wiki_path": {
                                "type": "string",
                                "description": "Target path in WikiJS (e.g., '/migrated-docs')"
                            },
                            "preserve_structure": {
                                "type": "boolean",
                                "description": "Whether to preserve directory structure",
                                "default": True
                            },
                            "update_existing": {
                                "type": "boolean",
                                "description": "Whether to update existing pages",
                                "default": False
                            },
                            "dry_run": {
                                "type": "boolean",
                                "description": "Preview changes without uploading",
                                "default": False
                            }
                        },
                        "required": ["source_path", "target_wiki_path"]
                    }
                ),
                
                # Configuration and Info Tools
                types.Tool(
                    name="get_wikijs_connection_info",
                    description="Get current WikiJS connection configuration",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                ),
                types.Tool(
                    name="validate_document_path",
                    description="Validate that a file path is allowed for operations",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "File path to validate"
                            }
                        },
                        "required": ["file_path"]
                    }
                ),
                
                # AI-Enhanced Document Processing Tools
                types.Tool(
                    name="enhance_document_content",
                    description="Enhance document content using AI for improved clarity, grammar, and structure",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Path to the document to enhance"
                            },
                            "content": {
                                "type": "string",
                                "description": "Document content to enhance (optional if file_path provided)"
                            },
                            "enhancement_type": {
                                "type": "string",
                                "description": "Type of enhancement: general, technical, user_guide, api_docs",
                                "default": "general"
                            },
                            "target_audience": {
                                "type": "string",
                                "description": "Target audience: developers, users, administrators, general",
                                "default": "general"
                            },
                            "preserve_technical_details": {
                                "type": "boolean",
                                "description": "Whether to preserve all technical details",
                                "default": True
                            }
                        }
                    }
                ),
                types.Tool(
                    name="generate_document_toc",
                    description="Generate automatic table of contents for a document",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Path to the document"
                            },
                            "content": {
                                "type": "string",
                                "description": "Document content (optional if file_path provided)"
                            },
                            "min_headings": {
                                "type": "integer",
                                "description": "Minimum number of headings required to generate TOC",
                                "default": 3
                            },
                            "max_depth": {
                                "type": "integer",
                                "description": "Maximum heading depth to include",
                                "default": 4
                            },
                            "insert_toc": {
                                "type": "boolean",
                                "description": "Whether to insert TOC into the document",
                                "default": False
                            }
                        }
                    }
                ),
                types.Tool(
                    name="categorize_document",
                    description="Automatically categorize and tag a document using AI",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Path to the document to categorize"
                            },
                            "content": {
                                "type": "string",
                                "description": "Document content (optional if file_path provided)"
                            },
                            "suggest_wiki_path": {
                                "type": "boolean",
                                "description": "Whether to suggest optimal WikiJS path based on categorization",
                                "default": True
                            }
                        }
                    }
                ),
                types.Tool(
                    name="detect_cross_document_links",
                    description="Detect and suggest cross-document links and references",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Path to the document to analyze"
                            },
                            "content": {
                                "type": "string",
                                "description": "Document content (optional if file_path provided)"
                            },
                            "search_directory": {
                                "type": "string",
                                "description": "Directory to search for related documents",
                                "default": "."
                            },
                            "create_links": {
                                "type": "boolean",
                                "description": "Whether to automatically insert suggested links",
                                "default": False
                            }
                        }
                    }
                ),
                types.Tool(
                    name="assess_document_quality",
                    description="Perform comprehensive quality assessment of a document",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Path to the document to assess"
                            },
                            "content": {
                                "type": "string",
                                "description": "Document content (optional if file_path provided)"
                            },
                            "template_type": {
                                "type": "string",
                                "description": "Document template type for compliance checking: api_documentation, user_guide, technical_reference",
                                "default": None
                            },
                            "detailed_report": {
                                "type": "boolean",
                                "description": "Whether to include detailed issues and suggestions",
                                "default": True
                            }
                        }
                    }
                ),
                types.Tool(
                    name="improve_document_readability",
                    description="Improve document readability while preserving technical accuracy",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Path to the document to improve"
                            },
                            "content": {
                                "type": "string",
                                "description": "Document content (optional if file_path provided)"
                            },
                            "target_audience": {
                                "type": "string",
                                "description": "Target audience for readability optimization",
                                "default": "general"
                            },
                            "complexity_level": {
                                "type": "string",
                                "description": "Target complexity level: beginner, intermediate, advanced",
                                "default": "intermediate"
                            }
                        }
                    }
                ),
                types.Tool(
                    name="batch_process_documents",
                    description="Process multiple documents with AI enhancements in batch",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "source_directory": {
                                "type": "string",
                                "description": "Directory containing documents to process"
                            },
                            "file_patterns": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "File patterns to include",
                                "default": ["*.md"]
                            },
                            "processing_options": {
                                "type": "object",
                                "properties": {
                                    "enhance_content": {"type": "boolean", "default": True},
                                    "generate_toc": {"type": "boolean", "default": True},
                                    "categorize": {"type": "boolean", "default": True},
                                    "assess_quality": {"type": "boolean", "default": True},
                                    "detect_links": {"type": "boolean", "default": True},
                                    "enhancement_type": {"type": "string", "default": "general"},
                                    "target_audience": {"type": "string", "default": "general"},
                                    "rate_limit_delay": {"type": "number", "default": 1.0}
                                },
                                "description": "Processing options for batch operation"
                            },
                            "output_directory": {
                                "type": "string",
                                "description": "Directory to save processed documents (optional)"
                            },
                            "dry_run": {
                                "type": "boolean",
                                "description": "Preview processing without making changes",
                                "default": False
                            }
                        },
                        "required": ["source_directory"]
                    }
                ),
                types.Tool(
                    name="create_navigation_structure",
                    description="Generate intelligent navigation structure for document collections",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "source_directory": {
                                "type": "string",
                                "description": "Directory containing documents to organize"
                            },
                            "structure_type": {
                                "type": "string",
                                "description": "Type of navigation: hierarchical, topic_based, audience_based",
                                "default": "hierarchical"
                            },
                            "include_breadcrumbs": {
                                "type": "boolean",
                                "description": "Whether to generate breadcrumb navigation",
                                "default": True
                            },
                            "generate_sitemap": {
                                "type": "boolean",
                                "description": "Whether to generate a site map",
                                "default": True
                            }
                        },
                        "required": ["source_directory"]
                    }
                )
            ]
        
        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> List[types.TextContent]:
            """Handle tool calls."""
            try:
                if name == "find_markdown_documents":
                    return await self._handle_find_documents(**arguments)
                elif name == "analyze_document":
                    return await self._handle_analyze_document(**arguments)
                elif name == "get_file_stats":
                    return await self._handle_get_file_stats(**arguments)
                elif name == "test_wikijs_connection":
                    return await self._handle_test_connection(**arguments)
                elif name == "upload_document_to_wiki":
                    return await self._handle_upload_document(**arguments)
                elif name == "get_wiki_page_info":
                    return await self._handle_get_page_info(**arguments)
                elif name == "update_wiki_page":
                    return await self._handle_update_page(**arguments)
                elif name == "search_wiki_pages":
                    return await self._handle_search_pages(**arguments)
                elif name == "migrate_directory_to_wiki":
                    return await self._handle_migrate_directory(**arguments)
                elif name == "get_wikijs_connection_info":
                    return await self._handle_get_connection_info(**arguments)
                elif name == "validate_document_path":
                    return await self._handle_validate_path(**arguments)
                
                # AI Processing Tool Handlers
                elif name == "enhance_document_content":
                    return await self._handle_enhance_content(**arguments)
                elif name == "generate_document_toc":
                    return await self._handle_generate_toc(**arguments)
                elif name == "categorize_document":
                    return await self._handle_categorize_document(**arguments)
                elif name == "detect_cross_document_links":
                    return await self._handle_detect_links(**arguments)
                elif name == "assess_document_quality":
                    return await self._handle_assess_quality(**arguments)
                elif name == "improve_document_readability":
                    return await self._handle_improve_readability(**arguments)
                elif name == "batch_process_documents":
                    return await self._handle_batch_process(**arguments)
                elif name == "create_navigation_structure":
                    return await self._handle_create_navigation(**arguments)
                else:
                    raise ValueError(f"Unknown tool: {name}")
            
            except WikiJSMCPError as e:
                logger.error(f"WikiJS MCP error in {name}: {e}")
                return [types.TextContent(type="text", text=f"Error: {str(e)}")]
            except Exception as e:
                logger.error(f"Unexpected error in {name}: {e}", exc_info=True)
                return [types.TextContent(type="text", text=f"Unexpected error: {str(e)}")]
    
    # Document Discovery Handlers
    
    async def _handle_find_documents(
        self,
        search_path: str,
        recursive: bool = True,
        include_patterns: Optional[List[str]] = None,
        exclude_patterns: Optional[List[str]] = None
    ) -> List[types.TextContent]:
        """Handle document finding."""
        result = self.scanner.find_documents(search_path, recursive, include_patterns, exclude_patterns)
        
        # Format results
        response_lines = []
        response_lines.append(f"Document Scan Results for: {search_path}")
        response_lines.append("=" * 60)
        response_lines.append(f"Files Found: {result.total_files_found}")
        response_lines.append(f"Files Processed: {result.total_files_processed}")
        response_lines.append(f"Scan Duration: {result.scan_duration:.2f} seconds")
        response_lines.append("")
        
        if result.errors:
            response_lines.append("⚠️ Errors:")
            for error in result.errors[:5]:  # Show first 5 errors
                response_lines.append(f"  - {error}")
            if len(result.errors) > 5:
                response_lines.append(f"  ... and {len(result.errors) - 5} more errors")
            response_lines.append("")
        
        if result.warnings:
            response_lines.append("🔔 Warnings:")
            for warning in result.warnings[:3]:  # Show first 3 warnings
                response_lines.append(f"  - {warning}")
            if len(result.warnings) > 3:
                response_lines.append(f"  ... and {len(result.warnings) - 3} more warnings")
            response_lines.append("")
        
        response_lines.append("📄 Documents Found:")
        for doc in result.documents[:10]:  # Show first 10 documents
            response_lines.append(f"  📝 {doc.title}")
            response_lines.append(f"     Path: {doc.relative_path}")
            response_lines.append(f"     Size: {self._format_file_size(doc.size)}")
            if doc.tags:
                response_lines.append(f"     Tags: {', '.join(doc.tags[:3])}")
            response_lines.append(f"     Preview: {doc.content_preview[:100]}...")
            response_lines.append("")
        
        if len(result.documents) > 10:
            response_lines.append(f"... and {len(result.documents) - 10} more documents")
        
        # Add JSON data for programmatic access
        response_lines.append("\n" + "="*60)
        response_lines.append("JSON Data:")
        response_lines.append(json.dumps(result.to_dict(), indent=2, default=str))
        
        return [types.TextContent(type="text", text="\n".join(response_lines))]
    
    async def _handle_analyze_document(self, file_path: str) -> List[types.TextContent]:
        """Handle single document analysis."""
        doc_metadata = self.scanner.analyze_single_document(file_path)
        
        # Format results
        response_lines = []
        response_lines.append(f"Document Analysis: {doc_metadata.title}")
        response_lines.append("=" * 60)
        response_lines.append(f"File Path: {doc_metadata.file_path}")
        response_lines.append(f"Size: {self._format_file_size(doc_metadata.size)}")
        response_lines.append(f"Modified: {doc_metadata.modified_time}")
        response_lines.append(f"Content Hash: {doc_metadata.content_hash}")
        response_lines.append("")
        
        if doc_metadata.frontmatter:
            response_lines.append("📋 Frontmatter:")
            for key, value in doc_metadata.frontmatter.items():
                response_lines.append(f"  {key}: {value}")
            response_lines.append("")
        
        if doc_metadata.tags:
            response_lines.append(f"🏷️ Tags: {', '.join(doc_metadata.tags)}")
            response_lines.append("")
        
        if doc_metadata.links:
            response_lines.append(f"🔗 Links Found: {len(doc_metadata.links)}")
            for link in doc_metadata.links[:5]:
                response_lines.append(f"  - {link}")
            if len(doc_metadata.links) > 5:
                response_lines.append(f"  ... and {len(doc_metadata.links) - 5} more")
            response_lines.append("")
        
        if doc_metadata.images:
            response_lines.append(f"🖼️ Images Found: {len(doc_metadata.images)}")
            for image in doc_metadata.images[:3]:
                response_lines.append(f"  - {image}")
            if len(doc_metadata.images) > 3:
                response_lines.append(f"  ... and {len(doc_metadata.images) - 3} more")
            response_lines.append("")
        
        response_lines.append("📄 Content Preview:")
        response_lines.append(doc_metadata.content_preview)
        
        # Add JSON data
        response_lines.append("\n" + "="*60)
        response_lines.append("JSON Data:")
        response_lines.append(json.dumps(doc_metadata.to_dict(), indent=2, default=str))
        
        return [types.TextContent(type="text", text="\n".join(response_lines))]
    
    async def _handle_get_file_stats(self, search_path: str) -> List[types.TextContent]:
        """Handle file statistics gathering."""
        stats = self.scanner.get_file_stats(search_path)
        
        response_lines = []
        response_lines.append(f"File Statistics for: {search_path}")
        response_lines.append("=" * 60)
        response_lines.append(f"Total Files: {stats['total_files']}")
        response_lines.append(f"Markdown Files: {stats['markdown_files']}")
        response_lines.append(f"Total Size: {self._format_file_size(stats['total_size'])}")
        response_lines.append("")
        
        response_lines.append("📊 File Types:")
        for ext, count in sorted(stats['file_types'].items(), key=lambda x: x[1], reverse=True)[:10]:
            response_lines.append(f"  {ext or '(no extension)'}: {count}")
        response_lines.append("")
        
        if stats['largest_file']['path']:
            response_lines.append("📈 Largest File:")
            response_lines.append(f"  {stats['largest_file']['path']}")
            response_lines.append(f"  Size: {self._format_file_size(stats['largest_file']['size'])}")
            response_lines.append("")
        
        if stats['newest_file']['path']:
            response_lines.append("🕒 Newest File:")
            response_lines.append(f"  {stats['newest_file']['path']}")
            response_lines.append(f"  Modified: {stats['newest_file']['modified']}")
        
        return [types.TextContent(type="text", text="\n".join(response_lines))]
    
    # WikiJS Integration Handlers
    
    async def _handle_test_connection(self) -> List[types.TextContent]:
        """Handle WikiJS connection test."""
        async with self.wikijs_client as client:
            system_info = await client.test_connection()
            
            response_lines = []
            response_lines.append("WikiJS Connection Test - SUCCESS ✅")
            response_lines.append("=" * 50)
            response_lines.append(f"WikiJS Version: {system_info.get('currentVersion', 'Unknown')}")
            response_lines.append(f"Database Type: {system_info.get('dbType', 'Unknown')}")
            response_lines.append(f"Total Pages: {system_info.get('pagesTotal', 0)}")
            response_lines.append(f"Total Users: {system_info.get('usersTotal', 0)}")
            response_lines.append(f"Total Groups: {system_info.get('groupsTotal', 0)}")
            response_lines.append("")
            response_lines.append(f"Server URL: {self.config.wikijs.url}")
            response_lines.append(f"Default Locale: {self.config.wikijs.default_locale}")
            response_lines.append(f"Default Editor: {self.config.wikijs.default_editor}")
            
            return [types.TextContent(type="text", text="\n".join(response_lines))]
    
    # Placeholder handlers for remaining methods
    async def _handle_upload_document(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Upload document handler not implemented")]
    
    async def _handle_get_page_info(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Get page info handler not implemented")]
    
    async def _handle_update_page(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Update page handler not implemented")]
    
    async def _handle_search_pages(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Search pages handler not implemented")]
    
    async def _handle_migrate_directory(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Migrate directory handler not implemented")]
    
    async def _handle_get_connection_info(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Get connection info handler not implemented")]
    
    async def _handle_validate_path(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Validate path handler not implemented")]
    
    async def _handle_enhance_content(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Enhance content handler not implemented")]
    
    async def _handle_generate_toc(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Generate TOC handler not implemented")]
    
    async def _handle_categorize_document(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Categorize document handler not implemented")]
    
    async def _handle_detect_links(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Detect links handler not implemented")]
    
    async def _handle_assess_quality(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Assess quality handler not implemented")]
    
    async def _handle_improve_readability(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Improve readability handler not implemented")]
    
    async def _handle_batch_process(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Batch process handler not implemented")]
    
    async def _handle_create_navigation(self, **kwargs) -> List[types.TextContent]:
        return [types.TextContent(type="text", text="Create navigation handler not implemented")]
    
    # Utility Methods
    
    def _format_file_size(self, size_bytes: int) -> str:
        """Format file size in human-readable format."""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.1f} MB"
        else:
            return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"
    
    def _generate_title_from_filename(self, file_path: str) -> str:
        """Generate a title from filename."""
        filename = os.path.splitext(os.path.basename(file_path))[0]
        title = filename.replace('_', ' ').replace('-', ' ')
        return ' '.join(word.capitalize() for word in title.split())
    
    async def cleanup(self) -> None:
        """Cleanup resources."""
        if hasattr(self.wikijs_client, 'session') and self.wikijs_client.session:
            await self.wikijs_client.disconnect()
        
        # Cleanup AI processor
        if hasattr(self, 'ai_processor') and self.ai_processor:
            await self.ai_processor.cleanup()
    
    async def run(self, transport: str = "stdio") -> None:
        """Run the MCP server."""
        try:
            if transport == "stdio":
                async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
                    initialization_options = InitializationOptions(
                        server_name="wikijs-mcp-server",
                        server_version="0.1.0",
                        capabilities=types.ServerCapabilities(
                            tools=types.ToolsCapability(listChanged=True)
                        )
                    )
                    await self.server.run(read_stream, write_stream, initialization_options)
            else:
                raise ValueError(f"Unsupported transport: {transport}")
        
        except KeyboardInterrupt:
            logger.info("Server interrupted by user")
        except Exception as e:
            logger.error(f"Server error: {e}", exc_info=True)
        finally:
            await self.cleanup()


def load_config(config_path: str) -> ServerConfig:
    """Load configuration from file."""
    try:
        with open(config_path, 'r') as f:
            config_data = json.load(f)
        return ServerConfig(**config_data)
    except FileNotFoundError:
        raise ConfigurationError(f"Configuration file not found: {config_path}")
    except json.JSONDecodeError as e:
        raise ConfigurationError(f"Invalid JSON in configuration file: {e}")
    except Exception as e:
        raise ConfigurationError(f"Failed to load configuration: {e}")


async def main():
    """Main entry point."""
    import sys
    
    if len(sys.argv) > 1:
        config_path = sys.argv[1]
    else:
        config_path = "wikijs_mcp_config.json"
    
    try:
        config = load_config(config_path)
        server = WikiJSMCPServer(config)
        await server.run()
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())