"""Command-line interface for the Network MCP Server."""

import argparse
import asyncio
import json
import logging
import sys
from pathlib import Path

from .server import NetworkMCPServer, load_config
from .config import NetworkMCPConfig, SMBShareConfig, SecurityConfig
from .exceptions import ConfigurationError


def create_sample_config(output_path: str) -> None:
    """Create a sample configuration file."""
    sample_config = {
        "shares": {
            "example_smb": {
                "type": "smb",
                "host": "192.168.1.100",
                "share_name": "shared_folder",
                "username": "your_username",
                "password": "your_password",
                "domain": "WORKGROUP",
                "port": 445,
                "use_ntlm_v2": True,
                "timeout": 30
            }
        },
        "security": {
            "allowed_extensions": [".txt", ".py", ".json", ".md", ".yaml", ".yml", ".xml", ".csv"],
            "blocked_extensions": [".exe", ".bat", ".cmd", ".ps1", ".sh"],
            "max_file_size": "100MB",
            "allowed_paths": [],
            "blocked_paths": ["/etc", "/root", "/sys", "/proc"],
            "enable_write": True,
            "enable_delete": False
        },
        "logging_level": "INFO",
        "max_connections": 10
    }
    
    with open(output_path, 'w') as f:
        json.dump(sample_config, f, indent=2)
    
    print(f"Sample configuration created at: {output_path}")
    print("Please edit this file with your actual network share credentials.")


def validate_config(config_path: str) -> None:
    """Validate configuration file."""
    try:
        config = load_config(config_path)
        print("OK - Configuration is valid!")
        
        print(f"\nConfigured shares ({len(config.shares)}):")
        for name, share_config in config.shares.items():
            print(f"  - {name} ({share_config.type.upper()}): {share_config.host}")
        
        print(f"\nSecurity settings:")
        print(f"  - Write operations: {'enabled' if config.security.enable_write else 'disabled'}")
        print(f"  - Delete operations: {'enabled' if config.security.enable_delete else 'disabled'}")
        print(f"  - Max file size: {config.security.max_file_size}")
        
        if config.security.allowed_extensions:
            print(f"  - Allowed extensions: {', '.join(config.security.allowed_extensions)}")
        
        if config.security.blocked_extensions:
            print(f"  - Blocked extensions: {', '.join(config.security.blocked_extensions)}")
            
    except Exception as e:
        print(f"ERROR - Configuration validation failed: {e}")
        sys.exit(1)


async def main() -> None:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Network MCP Server - Access network filesystems via MCP"
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Run server command
    run_parser = subparsers.add_parser('run', help='Run the MCP server')
    run_parser.add_argument(
        '--config', '-c',
        required=True,
        help='Path to configuration file'
    )
    run_parser.add_argument(
        '--transport', '-t',
        default='stdio',
        choices=['stdio'],
        help='Transport type (currently only stdio supported)'
    )
    
    # Create sample config command
    sample_parser = subparsers.add_parser(
        'create-config',
        help='Create a sample configuration file'
    )
    sample_parser.add_argument(
        'output_path',
        help='Path where to create the sample configuration'
    )
    
    # Validate config command
    validate_parser = subparsers.add_parser(
        'validate-config',
        help='Validate a configuration file'
    )
    validate_parser.add_argument(
        'config_path',
        help='Path to configuration file to validate'
    )
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    try:
        if args.command == 'run':
            config = load_config(args.config)
            server = NetworkMCPServer(config)
            await server.run(transport=args.transport)
        
        elif args.command == 'create-config':
            create_sample_config(args.output_path)
        
        elif args.command == 'validate-config':
            validate_config(args.config_path)
            
    except ConfigurationError as e:
        print(f"Configuration error: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


def cli_main() -> None:
    """Entry point for the CLI script."""
    asyncio.run(main())


if __name__ == '__main__':
    cli_main()