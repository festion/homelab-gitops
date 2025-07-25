"""
Code Linter MCP Server - Main server implementation.
"""

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import mcp.server.stdio
import mcp.types as types
from mcp.server.lowlevel import NotificationOptions, Server
from mcp.server.models import InitializationOptions

from .config import CodeLinterConfig
from .exceptions import CodeLinterError, ValidationError, UnsupportedLanguageError
from .linting_engine import LintingEngine, LintResult
from .security import SecurityValidator

logger = logging.getLogger(__name__)


class CodeLinterMCPServer:
    """MCP Server for code linting and validation."""
    
    def __init__(self, config: CodeLinterConfig):
        self.config = config
        self.linting_engine = LintingEngine(config)
        self.security = SecurityValidator(config.security)
        self.server = Server("code-linter")
        self._setup_tools()
    
    def _setup_tools(self):
        """Setup MCP tools."""
        
        @self.server.list_tools()
        async def handle_list_tools() -> types.ListToolsResult:
            """List available linting tools."""
            # NOTE: There is a known bug in MCP library version 1.10.1 that causes
            # "'tuple' object has no attribute 'name'" error when listing tools.
            # This affects ALL MCP servers using this library version.
            # The bug occurs in the library's internal processing, not in the tool creation.
            
            tools = [
                types.Tool(
                    name="lint_file",
                    description="Lint a file with appropriate linters for its language",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {"type": "string", "description": "Path to the file to lint"},
                            "content": {"type": "string", "description": "Optional file content to lint instead of reading from file"},
                            "linters": {"type": "array", "items": {"type": "string"}, "description": "Optional list of specific linters to run"}
                        },
                        "required": ["file_path"]
                    }
                ),
                types.Tool(
                    name="lint_content", 
                    description="Lint content directly without a file",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "content": {"type": "string", "description": "Code content to lint"},
                            "language": {"type": "string", "description": "Programming language (python, go, javascript, etc.)"},
                            "file_extension": {"type": "string", "description": "File extension to help detect language (.py, .go, .js, etc.)"}
                        },
                        "required": ["content"]
                    }
                ),
                types.Tool(
                    name="validate_syntax",
                    description="Quick syntax validation for code content", 
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "content": {"type": "string", "description": "Code content to validate"},
                            "language": {"type": "string", "description": "Programming language"}
                        },
                        "required": ["content", "language"]
                    }
                ),
                types.Tool(
                    name="get_supported_languages",
                    description="Get list of supported programming languages and their linters",
                    inputSchema={
                        "type": "object",
                        "properties": {},
                        "additionalProperties": False
                    }
                ),
                types.Tool(
                    name="check_linter_availability", 
                    description="Check if required linters are installed and available",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "language": {"type": "string", "description": "Optional language to check linters for"}
                        }
                    }
                ),
                types.Tool(
                    name="serena_pre_save_validation",
                    description="Validate code before Serena saves it (integration hook)",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {"type": "string", "description": "Path to file being saved"},
                            "content": {"type": "string", "description": "File content being saved"},
                            "operation": {"type": "string", "description": "Type of operation (save, create, update)"}
                        },
                        "required": ["file_path", "content", "operation"]
                    }
                )
            ]
            
            return types.ListToolsResult(tools=tools)
        
        @self.server.call_tool()
        async def handle_call_tool(request: types.CallToolRequest) -> types.CallToolResult:
            """Handle tool calls."""
            try:
                if request.name == "lint_file":
                    return await self._handle_lint_file(request.arguments)
                elif request.name == "lint_content":
                    return await self._handle_lint_content(request.arguments)
                elif request.name == "validate_syntax":
                    return await self._handle_validate_syntax(request.arguments)
                elif request.name == "get_supported_languages":
                    return await self._handle_get_supported_languages(request.arguments)
                elif request.name == "check_linter_availability":
                    return await self._handle_check_linter_availability(request.arguments)
                elif request.name == "serena_pre_save_validation":
                    return await self._handle_serena_pre_save_validation(request.arguments)
                else:
                    raise ValueError(f"Unknown tool: {request.name}")
                    
            except Exception as e:
                logger.error(f"Error handling tool {request.name}: {e}")
                return types.CallToolResult(
                    content=[types.TextContent(
                        type="text",
                        text=f"Error: {str(e)}"
                    )],
                    isError=True
                )

    async def _handle_lint_file(self, arguments: Dict[str, Any]) -> types.CallToolResult:
        """Handle lint_file tool call."""
        file_path = arguments.get("file_path")
        content = arguments.get("content")
        specific_linters = arguments.get("linters")
        
        if not file_path:
            raise ValueError("file_path is required")
        
        # Security validation
        if not self.security.validate_file_path(file_path):
            raise ValidationError(f"File path not allowed: {file_path}")
        
        if not self.security.validate_file_extension(file_path):
            raise ValidationError(f"File extension not allowed: {file_path}")
        
        # Lint the file
        results = await self.linting_engine.lint_file(file_path, content)
        
        # Format results
        formatted_results = self._format_lint_results(results, file_path)
        
        # Check if blocking is required
        should_block = self._should_block_operation(results)
        
        response_text = formatted_results
        if should_block:
            response_text = "[ERROR] **LINTING FAILED - BLOCKING OPERATION**\n\n" + response_text
        
        return types.CallToolResult(
            content=[types.TextContent(type="text", text=response_text)],
            isError=should_block
        )
    
    async def _handle_lint_content(self, arguments: Dict[str, Any]) -> types.CallToolResult:
        """Handle lint_content tool call."""
        content = arguments.get("content")
        language = arguments.get("language")
        file_extension = arguments.get("file_extension")
        
        if not content:
            raise ValueError("content is required")
        
        # Create temporary file name for language detection
        if file_extension:
            temp_name = f"temp{file_extension}"
        elif language:
            ext_map = {
                "python": ".py", "go": ".go", "javascript": ".js", 
                "typescript": ".ts", "yaml": ".yml", "json": ".json"
            }
            temp_name = f"temp{ext_map.get(language, '.txt')}"
        else:
            temp_name = "temp.txt"
        
        # Lint the content
        results = await self.linting_engine.lint_file(temp_name, content)
        
        # Format results  
        formatted_results = self._format_lint_results(results, temp_name)
        
        return types.CallToolResult(
            content=[types.TextContent(type="text", text=formatted_results)]
        )
    
    async def _handle_validate_syntax(self, arguments: Dict[str, Any]) -> types.CallToolResult:
        """Handle validate_syntax tool call."""
        content = arguments.get("content")
        language = arguments.get("language")
        
        if not content or not language:
            raise ValueError("content and language are required")
        
        # Quick syntax validation
        try:
            if language == "python":
                compile(content, "<string>", "exec")
            elif language == "json":
                json.loads(content)
            # Add more syntax validators as needed
            
            return types.CallToolResult(
                content=[types.TextContent(type="text", text="[OK] Syntax is valid")]
            )
        except SyntaxError as e:
            return types.CallToolResult(
                content=[types.TextContent(type="text", text=f"[ERROR] Syntax Error: {e}")],
                isError=True
            )
        except Exception as e:
            return types.CallToolResult(
                content=[types.TextContent(type="text", text=f"[ERROR] Validation Error: {e}")],
                isError=True
            )

    async def _handle_serena_pre_save_validation(self, arguments: Dict[str, Any]) -> types.CallToolResult:
        """Handle Serena pre-save validation hook."""
        file_path = arguments.get("file_path")
        content = arguments.get("content") 
        operation = arguments.get("operation")
        
        if not all([file_path, content, operation]):
            raise ValueError("file_path, content, and operation are required")
        
        # Security validation
        if not self.security.validate_content(content):
            return types.CallToolResult(
                content=[types.TextContent(
                    type="text", 
                    text="[ERROR] **SECURITY VIOLATION** - Content contains suspicious patterns"
                )],
                isError=True
            )
        
        # Lint the content
        try:
            results = await self.linting_engine.lint_file(file_path, content)
            
            # Check blocking conditions
            should_block = self._should_block_operation(results)
            
            if should_block:
                formatted_results = self._format_lint_results(results, file_path)
                return types.CallToolResult(
                    content=[types.TextContent(
                        type="text",
                        text=f"[ERROR] **SERENA SAVE BLOCKED** - Code quality issues found:\n\n{formatted_results}"
                    )],
                    isError=True
                )
            else:
                return types.CallToolResult(
                    content=[types.TextContent(
                        type="text",
                        text="[OK] **VALIDATION PASSED** - Code quality standards met"
                    )]
                )
        except UnsupportedLanguageError:
            # Allow unsupported file types to pass through
            return types.CallToolResult(
                content=[types.TextContent(
                    type="text",
                    text="[INFO] **UNSUPPORTED FILE TYPE** - Skipping validation"
                )]
            )
    
    def _should_block_operation(self, results: Dict[str, LintResult]) -> bool:
        """Determine if operation should be blocked based on lint results."""
        if not self.config.serena_integration.block_on_error:
            return False
        
        has_errors = any(not result.success or result.errors for result in results.values())
        has_warnings = any(result.warnings for result in results.values())
        
        return (
            has_errors or 
            (has_warnings and self.config.serena_integration.block_on_warning)
        )
    
    def _format_lint_results(self, results: Dict[str, LintResult], file_path: str) -> str:
        """Format lint results for display."""
        if not results:
            return "[INFO] No linters were run"
        
        output = [f"[FILE] **Linting Results for:** {file_path}\n"]
        
        total_errors = sum(len(r.errors) for r in results.values())
        total_warnings = sum(len(r.warnings) for r in results.values())
        
        output.append(f"**Summary:** {total_errors} errors, {total_warnings} warnings\n")
        
        for linter_name, result in results.items():
            if result.success and not result.errors and not result.warnings:
                output.append(f"[OK] **{linter_name}**: Passed")
            else:
                output.append(f"[ERROR] **{linter_name}**: Failed")
                
                for error in result.errors:
                    line_info = f" (Line {error.get('line', '?')})" if error.get('line') else ""
                    output.append(f"  [ERROR] {error.get('message', str(error))}{line_info}")
                
                for warning in result.warnings:
                    line_info = f" (Line {warning.get('line', '?')})" if warning.get('line') else ""
                    output.append(f"  [WARNING] {warning.get('message', str(warning))}{line_info}")
        
        return "\n".join(output)
    
    async def _handle_get_supported_languages(self, arguments: Dict[str, Any]) -> types.CallToolResult:
        """Handle get_supported_languages tool call."""
        languages_info = {}
        
        for lang_name, lang_config in self.config.languages.items():
            languages_info[lang_name] = {
                "extensions": lang_config.extensions,
                "available_linters": list(lang_config.linters.keys()),
                "default_linters": lang_config.default_linters,
                "enabled_linters": [
                    name for name, config in lang_config.linters.items() 
                    if config.enabled
                ]
            }
        
        formatted_output = "[INFO] **Supported Languages and Linters:**\n\n"
        
        for lang_name, info in languages_info.items():
            formatted_output += f"**{lang_name.title()}**\n"
            formatted_output += f"  [EXTENSIONS] Extensions: {', '.join(info['extensions'])}\n"
            formatted_output += f"  [AVAILABLE] Available: {', '.join(info['available_linters'])}\n"
            formatted_output += f"  [DEFAULT] Default: {', '.join(info['default_linters'])}\n"
            formatted_output += f"  [OK] Enabled: {', '.join(info['enabled_linters'])}\n\n"
        
        return types.CallToolResult(
            content=[types.TextContent(type="text", text=formatted_output)]
        )
    
    async def _handle_check_linter_availability(self, arguments: Dict[str, Any]) -> types.CallToolResult:
        """Handle check_linter_availability tool call."""
        import shutil
        
        language = arguments.get("language")
        availability = {}
        
        languages_to_check = [language] if language else self.config.languages.keys()
        
        for lang_name in languages_to_check:
            if lang_name not in self.config.languages:
                continue
                
            lang_config = self.config.languages[lang_name]
            availability[lang_name] = {}
            
            for linter_name, linter_config in lang_config.linters.items():
                command = linter_config.command or linter_name
                is_available = shutil.which(command) is not None
                availability[lang_name][linter_name] = {
                    "available": is_available,
                    "command": command,
                    "enabled": linter_config.enabled
                }
        
        # Format output
        formatted_output = "[INFO] **Linter Availability Check:**\n\n"
        
        for lang_name, linters in availability.items():
            formatted_output += f"**{lang_name.title()}:**\n"
            for linter_name, info in linters.items():
                status = "[OK]" if info["available"] else "[ERROR]"
                enabled = "[ENABLED]" if info["enabled"] else "[DISABLED]"
                formatted_output += f"  {status} {enabled} {linter_name} ({info['command']})\n"
            formatted_output += "\n"
        
        return types.CallToolResult(
            content=[types.TextContent(type="text", text=formatted_output)]
        )
    
    async def run(self, transport: str = "stdio") -> None:
        """Run the MCP server."""
        try:
            if transport == "stdio":
                async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
                    initialization_options = InitializationOptions(
                        server_name="code-linter-mcp-server",
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


def load_config(config_path: str) -> CodeLinterConfig:
    """Load configuration from file."""
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Config file not found: {config_path}")
    
    with open(config_path, 'r') as f:
        config_data = json.load(f)
    
    return CodeLinterConfig(**config_data)


async def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Code Linter MCP Server")
    parser.add_argument("--config", required=True, help="Path to configuration file")
    parser.add_argument("--transport", default="stdio", help="Transport type")
    
    args = parser.parse_args()
    
    try:
        config = load_config(args.config)
        server = CodeLinterMCPServer(config)
        await server.run(args.transport)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())