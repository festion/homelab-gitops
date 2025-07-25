"""
Code Linter MCP Server

A Model Context Protocol server that provides comprehensive code linting and validation
for multiple programming languages including Python, Go, YAML, JSON, JavaScript, TypeScript,
and more. Integrates with Serena's workflow to ensure all code meets quality standards
before being saved.
"""

__version__ = "0.1.0"
__all__ = [
    "CodeLinterMCPServer",
    "CodeLinterConfig", 
    "LintingEngine",
    "CodeLinterError",
    "ValidationError",
    "UnsupportedLanguageError"
]