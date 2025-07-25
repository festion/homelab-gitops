"""
Command-line interface for Proxmox MCP Server.
"""

import argparse
import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from typing import Optional

from .config import ProxmoxMCPConfig, create_sample_config
from .server import ProxmoxMCPServer
from .exceptions import ProxmoxConfigurationError

logger = logging.getLogger(__name__)


def setup_logging(log_level: str = "INFO") -> None:
    """Setup logging configuration."""
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )


def load_config(config_path: str) -> ProxmoxMCPConfig:
    """Load and validate configuration."""
    try:
        config = ProxmoxMCPConfig.from_file(config_path)
        logger.info(f"Configuration loaded successfully from {config_path}")
        return config
    except ProxmoxConfigurationError as e:
        logger.error(f"Configuration error: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error loading configuration: {e}")
        sys.exit(1)


def create_config_command(args) -> None:
    """Create sample configuration file."""
    config_path = args.output or "proxmox_mcp_config.json"
    
    if os.path.exists(config_path) and not args.force:
        logger.error(f"Configuration file already exists: {config_path}")
        logger.error("Use --force to overwrite")
        sys.exit(1)
    
    try:
        sample_config = create_sample_config()
        
        with open(config_path, 'w') as f:
            json.dump(sample_config, f, indent=2)
        
        logger.info(f"Sample configuration created: {config_path}")
        logger.info("Please edit the configuration file with your Proxmox server details")
        logger.info("Remember to set environment variables for sensitive data:")
        logger.info("  export PROXMOX_PASSWORD='your_password'")
        
    except Exception as e:
        logger.error(f"Failed to create configuration file: {e}")
        sys.exit(1)


def validate_config_command(args) -> None:
    """Validate configuration file."""
    try:
        config = load_config(args.config)
        logger.info("✅ Configuration is valid")
        
        # Test connection to default server if requested
        if args.test_connection:
            asyncio.run(test_connection(config))
            
    except Exception as e:
        logger.error(f"❌ Configuration validation failed: {e}")
        sys.exit(1)


async def test_connection(config: ProxmoxMCPConfig) -> None:
    """Test connection to Proxmox server."""
    from .proxmox_client import ProxmoxClient
    
    try:
        server_config = config.get_server_config()
        logger.info(f"Testing connection to {server_config.host}:{server_config.port}...")
        
        async with ProxmoxClient(server_config) as client:
            version_info = await client.get_version()
            logger.info(f"✅ Connection successful")
            logger.info(f"Proxmox VE version: {version_info.get('data', {}).get('version', 'Unknown')}")
            
    except Exception as e:
        logger.error(f"❌ Connection test failed: {e}")
        raise


async def run_server(config: ProxmoxMCPConfig) -> None:
    """Run the MCP server."""
    try:
        server = ProxmoxMCPServer(config)
        await server.run()
    except KeyboardInterrupt:
        logger.info("Server shutdown requested")
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise


def run_command(args) -> None:
    """Run the MCP server."""
    config = load_config(args.config)
    
    # Setup logging with config level
    setup_logging(config.log_level)
    
    try:
        asyncio.run(run_server(config))
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server failed: {e}")
        sys.exit(1)


def info_command(args) -> None:
    """Display information about the server and configuration."""
    if args.config:
        config = load_config(args.config)
        
        print("\n🔧 PROXMOX MCP SERVER CONFIGURATION")
        print("=" * 50)
        print(f"Configured servers: {len(config.servers)}")
        print(f"Default server: {config.default_server}")
        
        for name, server_config in config.servers.items():
            print(f"\n📡 Server: {name}")
            print(f"   Host: {server_config.host}:{server_config.port}")
            print(f"   Username: {server_config.username}@{server_config.realm}")
            print(f"   SSL Verification: {server_config.verify_ssl}")
        
        print(f"\n🔒 Security Configuration:")
        print(f"   VM Operations: {config.security.allow_vm_operations}")
        print(f"   Storage Operations: {config.security.allow_storage_operations}")
        print(f"   Snapshot Operations: {config.security.allow_snapshot_operations}")
        print(f"   Backup Operations: {config.security.allow_backup_operations}")
        print(f"   Destructive Ops Confirmation: {config.security.require_confirmation_for_destructive_ops}")
        
        print(f"\n📊 Monitoring Configuration:")
        print(f"   Enabled: {config.monitoring.enable_monitoring}")
        print(f"   CPU Threshold: {config.monitoring.cpu_threshold}%")
        print(f"   Memory Threshold: {config.monitoring.memory_threshold}%")
        print(f"   Storage Threshold: {config.monitoring.storage_threshold}%")
        
        print(f"\n🤖 Automation Configuration:")
        print(f"   Enabled: {config.automation.enable_automation}")
        print(f"   Snapshot Cleanup: {config.automation.enable_snapshot_cleanup}")
        print(f"   Backup Cleanup: {config.automation.enable_backup_cleanup}")
        print(f"   Storage Optimization: {config.automation.enable_storage_optimization}")
        
    else:
        print("\n🚀 PROXMOX MCP SERVER")
        print("=" * 50)
        print("Version: 1.0.0")
        print("Description: Comprehensive Proxmox VE management through Model Context Protocol")
        print("\nAvailable Tools:")
        
        tools = [
            "get_system_info - Get basic Proxmox system information",
            "get_node_status - Get detailed node status and resource usage",
            "list_virtual_machines - List all VMs with status information",
            "list_containers - List all LXC containers with status information",
            "run_health_assessment - Perform comprehensive health assessment",
            "get_storage_status - Get storage utilization and health analysis",
            "monitor_resource_usage - Get real-time resource monitoring",
            "manage_snapshots - Manage VM and container snapshots",
            "manage_backups - Manage backup files and retention",
            "optimize_storage - Analyze and optimize storage usage",
            "execute_maintenance - Execute automated maintenance tasks",
            "get_audit_report - Generate comprehensive audit report"
        ]
        
        for tool in tools:
            print(f"  • {tool}")
        
        print(f"\nFor configuration details, use: {sys.argv[0]} info --config <config_file>")


def main() -> None:
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Proxmox MCP Server - Comprehensive Proxmox VE management through Model Context Protocol",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s create-config                    # Create sample configuration
  %(prog)s validate-config config.json     # Validate configuration
  %(prog)s run config.json                 # Run MCP server
  %(prog)s info                            # Show server information
  %(prog)s info --config config.json      # Show configuration details

For more information, visit: https://github.com/your-repo/mcp-servers
        """
    )
    
    parser.add_argument(
        "--version",
        action="version", 
        version="Proxmox MCP Server 1.0.0"
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Create config command
    create_parser = subparsers.add_parser(
        'create-config',
        help='Create sample configuration file'
    )
    create_parser.add_argument(
        '--output', '-o',
        default='proxmox_mcp_config.json',
        help='Output configuration file path (default: proxmox_mcp_config.json)'
    )
    create_parser.add_argument(
        '--force', '-f',
        action='store_true',
        help='Overwrite existing configuration file'
    )
    create_parser.set_defaults(func=create_config_command)
    
    # Validate config command
    validate_parser = subparsers.add_parser(
        'validate-config',
        help='Validate configuration file'
    )
    validate_parser.add_argument(
        'config',
        help='Configuration file path'
    )
    validate_parser.add_argument(
        '--test-connection',
        action='store_true',
        help='Test connection to Proxmox server'
    )
    validate_parser.set_defaults(func=validate_config_command)
    
    # Run server command  
    run_parser = subparsers.add_parser(
        'run',
        help='Run the MCP server'
    )
    run_parser.add_argument(
        'config',
        help='Configuration file path'
    )
    run_parser.set_defaults(func=run_command)
    
    # Info command
    info_parser = subparsers.add_parser(
        'info',
        help='Display server and configuration information'
    )
    info_parser.add_argument(
        '--config', '-c',
        help='Configuration file to analyze (optional)'
    )
    info_parser.set_defaults(func=info_command)
    
    # Parse arguments
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Setup basic logging
    setup_logging()
    
    # Execute command
    args.func(args)


def cli_main() -> None:
    """CLI entry point for setuptools console script."""
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Operation cancelled by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    cli_main()