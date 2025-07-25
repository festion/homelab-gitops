"""
Command-line interface for the Code Linter MCP Server.
"""

import argparse
import asyncio
import json
import logging
import os
import sys
from pathlib import Path

from .config import CodeLinterConfig
from .server import CodeLinterMCPServer, load_config


def create_sample_config() -> dict:
    """Generate a sample configuration file."""
    sample_config = {
        "languages": {
            "python": {
                "extensions": [".py", ".pyw"],
                "linters": {
                    "flake8": {
                        "enabled": True,
                        "args": ["--max-line-length=88", "--extend-ignore=E203,W503"],
                        "timeout": 30
                    },
                    "black": {
                        "enabled": True,
                        "args": ["--check", "--diff"],
                        "timeout": 30
                    },
                    "mypy": {
                        "enabled": True,
                        "args": ["--ignore-missing-imports"],
                        "timeout": 60
                    }
                },
                "default_linters": ["flake8", "black"]
            },
            "go": {
                "extensions": [".go"],
                "linters": {
                    "gofmt": {"enabled": True},
                    "govet": {"enabled": True}
                },
                "default_linters": ["gofmt", "govet"]
            },
            "javascript": {
                "extensions": [".js", ".jsx"],
                "linters": {
                    "eslint": {"enabled": True}
                },
                "default_linters": ["eslint"]
            },
            "yaml": {
                "extensions": [".yaml", ".yml"],
                "linters": {
                    "yamllint": {"enabled": True}
                },
                "default_linters": ["yamllint"]
            },
            "json": {
                "extensions": [".json"],
                "linters": {
                    "jsonlint": {"enabled": True}
                },
                "default_linters": ["jsonlint"]
            }
        },
        "security": {
            "allowed_file_extensions": [
                ".py", ".go", ".js", ".ts", ".jsx", ".tsx", ".json", 
                ".yaml", ".yml", ".toml", ".xml", ".html", ".css", 
                ".scss", ".sass", ".sql", ".sh", ".ps1", ".bat", 
                ".dockerfile", ".md", ".rst"
            ],
            "max_file_size": "10MB",
            "allow_network": False,
            "sandbox_mode": True
        },
        "serena_integration": {
            "block_on_error": True,
            "block_on_warning": False,
            "auto_fix": False,
            "backup_before_fix": True,
            "integration_mode": "strict"
        },
        "global_timeout": 60,
        "concurrent_linters": 4,
        "cache_results": True,
        "cache_duration": 300,
        "log_level": "INFO"
    }
    
    return sample_config


def validate_config(config_path: str) -> bool:
    """Validate a configuration file."""
    try:
        config = load_config(config_path)
        print(f"[OK] Configuration file '{config_path}' is valid", file=sys.stderr)
        
        # Check for common issues
        warnings = []
        
        # Check if any languages are configured
        if not config.languages:
            warnings.append("No languages configured - using defaults")
        
        # Check linter availability
        import shutil
        missing_linters = []
        for lang_name, lang_config in config.languages.items():
            for linter_name, linter_config in lang_config.linters.items():
                if linter_config.enabled:
                    command = linter_config.command or linter_name
                    if not shutil.which(command):
                        missing_linters.append(f"{lang_name}.{linter_name} ({command})")
        
        if missing_linters:
            warnings.append(f"Missing linters: {', '.join(missing_linters)}")
        
        if warnings:
            print("[WARNING] Warnings:", file=sys.stderr)
            for warning in warnings:
                print(f"  - {warning}", file=sys.stderr)
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Configuration validation failed: {e}", file=sys.stderr)
        return False


async def run_server(config_path: str, transport: str = "stdio://"):
    """Run the MCP server."""
    try:
        config = load_config(config_path)
        server = CodeLinterMCPServer(config)
        
        # Use stderr for all logging output to avoid conflicting with MCP JSON-RPC on stdout
        print(f"[INFO] Starting Code Linter MCP Server...", file=sys.stderr)
        print(f"[INFO] Config: {config_path}", file=sys.stderr)
        print(f"[INFO] Transport: {transport}", file=sys.stderr)
        print(f"[INFO] Languages: {', '.join(config.languages.keys())}", file=sys.stderr)
        
        # Convert transport URI to transport type
        transport_type = "stdio" if transport.startswith("stdio") else transport
        await server.run(transport_type)
        
    except Exception as e:
        print(f"[ERROR] Failed to start server: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Code Linter MCP Server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  code-linter-mcp-server run --config config.json
  code-linter-mcp-server create-config --output config.json
  code-linter-mcp-server validate-config config.json
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Run command
    run_parser = subparsers.add_parser("run", help="Start the MCP server")
    run_parser.add_argument("--config", required=True, help="Path to configuration file")
    run_parser.add_argument("--transport", default="stdio://", help="Transport URI")
    run_parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose logging")
    
    # Create config command
    config_parser = subparsers.add_parser("create-config", help="Create sample configuration")
    config_parser.add_argument("--output", "-o", default="config.json", help="Output file path")
    config_parser.add_argument("--force", "-f", action="store_true", help="Overwrite existing file")
    
    # Validate config command
    validate_parser = subparsers.add_parser("validate-config", help="Validate configuration file")
    validate_parser.add_argument("config_path", help="Path to configuration file")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Setup logging to use stderr to avoid conflicting with MCP JSON-RPC on stdout
    log_level = logging.DEBUG if getattr(args, 'verbose', False) else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        stream=sys.stderr
    )
    
    if args.command == "run":
        asyncio.run(run_server(args.config, args.transport))
    
    elif args.command == "create-config":
        if os.path.exists(args.output) and not args.force:
            print(f"[ERROR] File '{args.output}' already exists. Use --force to overwrite.", file=sys.stderr)
            sys.exit(1)
        
        sample_config = create_sample_config()
        with open(args.output, 'w') as f:
            json.dump(sample_config, f, indent=2)
        
        print(f"[OK] Sample configuration created: {args.output}", file=sys.stderr)
        print("[INFO] Edit the file to customize linters and settings", file=sys.stderr)
        print("[INFO] Run 'validate-config' to check your configuration", file=sys.stderr)
    
    elif args.command == "validate-config":
        success = validate_config(args.config_path)
        sys.exit(0 if success else 1)


def cli_main():
    """Entry point for console script."""
    try:
        main()
    except KeyboardInterrupt:
        print("\n[INFO] Interrupted by user", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    cli_main()