"""
Proxmox MCP Server - Main server implementation.

Provides comprehensive Proxmox VE management through Model Context Protocol tools.
"""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional, Sequence
from datetime import datetime, timedelta

from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.types import (
    Resource, Tool, TextContent, ImageContent, EmbeddedResource
)

from .config import ProxmoxMCPConfig
from .proxmox_client import ProxmoxClient
from .security import SecurityValidator
from .exceptions import (
    ProxmoxMCPError, ProxmoxConnectionError, ProxmoxAuthenticationError,
    ProxmoxAPIError, ProxmoxOperationError, ProxmoxValidationError,
    ProxmoxSecurityError
)

logger = logging.getLogger(__name__)


class ProxmoxMCPServer:
    """Proxmox MCP Server providing comprehensive Proxmox VE management capabilities."""
    
    def __init__(self, config: ProxmoxMCPConfig):
        self.config = config
        self.security = SecurityValidator(config.security)
        self.app = Server("proxmox-mcp-server")
        self._clients: Dict[str, ProxmoxClient] = {}
        
        # Setup logging
        logging.basicConfig(level=getattr(logging, config.log_level))
        logger.info(f"Initializing Proxmox MCP Server with {len(config.servers)} configured servers")
        
        self._setup_tools()
    
    def _setup_tools(self):
        """Register all MCP tools."""
        
        # System Information Tools
        @self.app.list_tools()
        async def handle_list_tools() -> List[Tool]:
            """List available tools."""
            return [
                Tool(
                    name="get_system_info",
                    description="Get basic Proxmox system information including version, nodes, and cluster status",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "server": {
                                "type": "string",
                                "description": "Proxmox server name (optional, uses default if not specified)"
                            }
                        }
                    }
                ),
                Tool(
                    name="get_node_status",
                    description="Get detailed status information for a specific node",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "node": {
                                "type": "string",
                                "description": "Node name"
                            },
                            "server": {
                                "type": "string", 
                                "description": "Proxmox server name (optional)"
                            }
                        },
                        "required": ["node"]
                    }
                ),
                Tool(
                    name="list_virtual_machines",
                    description="List all virtual machines with their status and basic information",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "node": {
                                "type": "string",
                                "description": "Node name (optional, lists VMs from all nodes if not specified)"
                            },
                            "server": {
                                "type": "string",
                                "description": "Proxmox server name (optional)"
                            },
                            "status_filter": {
                                "type": "string",
                                "enum": ["running", "stopped", "paused"],
                                "description": "Filter VMs by status (optional)"
                            }
                        }
                    }
                ),
                Tool(
                    name="list_containers",
                    description="List all LXC containers with their status and basic information",
                    inputSchema={
                        "type": "object", 
                        "properties": {
                            "node": {
                                "type": "string",
                                "description": "Node name (optional, lists containers from all nodes if not specified)"
                            },
                            "server": {
                                "type": "string",
                                "description": "Proxmox server name (optional)"
                            },
                            "status_filter": {
                                "type": "string",
                                "enum": ["running", "stopped", "paused"],
                                "description": "Filter containers by status (optional)"
                            }
                        }
                    }
                ),
                Tool(
                    name="run_health_assessment",
                    description="Perform comprehensive health assessment of the Proxmox environment",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "server": {
                                "type": "string",
                                "description": "Proxmox server name (optional)"
                            },
                            "include_recommendations": {
                                "type": "boolean",
                                "default": True,
                                "description": "Include optimization recommendations in the report"
                            }
                        }
                    }
                ),
                Tool(
                    name="get_storage_status",
                    description="Get comprehensive storage utilization and health analysis",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "node": {
                                "type": "string",
                                "description": "Node name (optional, gets storage for all nodes if not specified)"
                            },
                            "server": {
                                "type": "string",
                                "description": "Proxmox server name (optional)"
                            },
                            "storage_name": {
                                "type": "string",
                                "description": "Specific storage name to analyze (optional)"
                            }
                        }
                    }
                ),
                Tool(
                    name="monitor_resource_usage",
                    description="Get real-time resource monitoring data (CPU, memory, storage)",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "node": {
                                "type": "string",
                                "description": "Node name (optional, monitors all nodes if not specified)"
                            },
                            "server": {
                                "type": "string",
                                "description": "Proxmox server name (optional)"
                            },
                            "include_thresholds": {
                                "type": "boolean",
                                "default": True,
                                "description": "Include threshold warnings in the response"
                            }
                        }
                    }
                ),
                Tool(
                    name="manage_snapshots",
                    description="Manage VM and container snapshots (list, analyze, cleanup)",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "operation": {
                                "type": "string",
                                "enum": ["list", "analyze", "cleanup"],
                                "description": "Operation to perform"
                            },
                            "node": {
                                "type": "string",
                                "description": "Node name (optional)"
                            },
                            "vmid": {
                                "type": "integer",
                                "description": "VM/Container ID (optional, processes all if not specified)"
                            },
                            "server": {
                                "type": "string",
                                "description": "Proxmox server name (optional)"
                            },
                            "max_age_days": {
                                "type": "integer",
                                "default": 90,
                                "description": "Maximum age in days for cleanup operation"
                            },
                            "confirm": {
                                "type": "boolean",
                                "default": False,
                                "description": "Confirm destructive operations"
                            }
                        },
                        "required": ["operation"]
                    }
                ),
                Tool(
                    name="manage_backups",
                    description="Manage backup files (list, analyze, cleanup)",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "operation": {
                                "type": "string",
                                "enum": ["list", "analyze", "cleanup"],
                                "description": "Operation to perform"
                            },
                            "node": {
                                "type": "string",
                                "description": "Node name (optional)"
                            },
                            "storage": {
                                "type": "string",
                                "description": "Storage name (optional)"
                            },
                            "server": {
                                "type": "string",
                                "description": "Proxmox server name (optional)"
                            },
                            "max_age_days": {
                                "type": "integer",
                                "default": 30,
                                "description": "Maximum age in days for cleanup operation"
                            },
                            "confirm": {
                                "type": "boolean",
                                "default": False,
                                "description": "Confirm destructive operations"
                            }
                        },
                        "required": ["operation"]
                    }
                ),
                Tool(
                    name="optimize_storage",
                    description="Analyze and optimize storage usage across the Proxmox environment",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "node": {
                                "type": "string",
                                "description": "Node name (optional)"
                            },
                            "server": {
                                "type": "string",
                                "description": "Proxmox server name (optional)"
                            },
                            "operation": {
                                "type": "string",
                                "enum": ["analyze", "optimize"],
                                "default": "analyze",
                                "description": "Operation mode"
                            },
                            "confirm": {
                                "type": "boolean",
                                "default": False,
                                "description": "Confirm optimization actions"
                            }
                        }
                    }
                ),
                Tool(
                    name="execute_maintenance",
                    description="Execute automated maintenance tasks",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "tasks": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "enum": ["snapshot_cleanup", "backup_cleanup", "storage_optimization", "health_check"]
                                },
                                "description": "List of maintenance tasks to execute"
                            },
                            "server": {
                                "type": "string",
                                "description": "Proxmox server name (optional)"
                            },
                            "dry_run": {
                                "type": "boolean",
                                "default": True,
                                "description": "Perform dry run without making changes"
                            },
                            "confirm": {
                                "type": "boolean",
                                "default": False,
                                "description": "Confirm execution of maintenance tasks"
                            }
                        },
                        "required": ["tasks"]
                    }
                ),
                Tool(
                    name="get_audit_report",
                    description="Generate comprehensive environment audit report",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "server": {
                                "type": "string",
                                "description": "Proxmox server name (optional)"
                            },
                            "include_detailed_analysis": {
                                "type": "boolean",
                                "default": True,
                                "description": "Include detailed analysis and recommendations"
                            },
                            "format": {
                                "type": "string",
                                "enum": ["json", "text"],
                                "default": "json",
                                "description": "Report format"
                            }
                        }
                    }
                )
            ]
        
        # Tool Implementations
        
        @self.app.call_tool()
        async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> Sequence[TextContent]:
            """Handle tool calls."""
            try:
                # Validate operation with security validator
                self.security.validate_operation(name, arguments)
                
                if name == "get_system_info":
                    return await self._get_system_info(arguments)
                elif name == "get_node_status":
                    return await self._get_node_status(arguments)
                elif name == "list_virtual_machines":
                    return await self._list_virtual_machines(arguments)
                elif name == "list_containers":
                    return await self._list_containers(arguments)
                elif name == "run_health_assessment":
                    return await self._run_health_assessment(arguments)
                elif name == "get_storage_status":
                    return await self._get_storage_status(arguments)
                elif name == "monitor_resource_usage":
                    return await self._monitor_resource_usage(arguments)
                elif name == "manage_snapshots":
                    return await self._manage_snapshots(arguments)
                elif name == "manage_backups":
                    return await self._manage_backups(arguments)
                elif name == "optimize_storage":
                    return await self._optimize_storage(arguments)
                elif name == "execute_maintenance":
                    return await self._execute_maintenance(arguments)
                elif name == "get_audit_report":
                    return await self._get_audit_report(arguments)
                else:
                    return [TextContent(type="text", text=f"Unknown tool: {name}")]
                    
            except ProxmoxSecurityError as e:
                return [TextContent(type="text", text=f"Security validation failed: {e}")]
            except ProxmoxMCPError as e:
                return [TextContent(type="text", text=f"Proxmox operation failed: {e}")]
            except Exception as e:
                logger.error(f"Unexpected error in tool {name}: {e}")
                return [TextContent(type="text", text=f"Unexpected error: {e}")]
    
    async def _get_client(self, server_name: Optional[str] = None) -> ProxmoxClient:
        """Get or create Proxmox client for specified server."""
        target_server = server_name or self.config.default_server
        
        if target_server not in self._clients:
            server_config = self.config.get_server_config(target_server)
            client = ProxmoxClient(server_config)
            await client.connect()
            self._clients[target_server] = client
            
        return self._clients[target_server]
    
    # Tool Implementation Methods
    
    async def _get_system_info(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Get basic system information."""
        client = await self._get_client(args.get('server'))
        
        try:
            system_info = await client.gather_system_info()
            
            result = {
                "timestamp": datetime.now().isoformat(),
                "server": client.get_connection_info(),
                "system_info": system_info
            }
            
            return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
            
        except Exception as e:
            raise ProxmoxOperationError(f"Failed to get system info: {e}")
    
    async def _get_node_status(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Get detailed node status."""
        client = await self._get_client(args.get('server'))
        node = args['node']
        
        try:
            node_details = await client.get_node_details(node)
            
            result = {
                "timestamp": datetime.now().isoformat(),
                "node": node,
                "details": node_details
            }
            
            return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
            
        except Exception as e:
            raise ProxmoxOperationError(f"Failed to get node status for {node}: {e}")
    
    async def _list_virtual_machines(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """List virtual machines."""
        client = await self._get_client(args.get('server'))
        
        try:
            if args.get('node'):
                # Get VMs for specific node
                vms = await client.get_node_vms(args['node'])
                nodes_data = {args['node']: vms}
            else:
                # Get VMs for all nodes
                nodes = await client.get_nodes()
                nodes_data = {}
                for node in nodes:
                    node_name = node['node']
                    vms = await client.get_node_vms(node_name)
                    nodes_data[node_name] = vms
            
            # Apply status filter if specified
            status_filter = args.get('status_filter')
            if status_filter:
                for node_name in nodes_data:
                    nodes_data[node_name] = [
                        vm for vm in nodes_data[node_name] 
                        if vm.get('status') == status_filter
                    ]
            
            result = {
                "timestamp": datetime.now().isoformat(),
                "virtual_machines": nodes_data,
                "total_vms": sum(len(vms) for vms in nodes_data.values())
            }
            
            return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
            
        except Exception as e:
            raise ProxmoxOperationError(f"Failed to list virtual machines: {e}")
    
    async def _list_containers(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """List LXC containers."""
        client = await self._get_client(args.get('server'))
        
        try:
            if args.get('node'):
                # Get containers for specific node
                containers = await client.get_node_containers(args['node'])
                nodes_data = {args['node']: containers}
            else:
                # Get containers for all nodes
                nodes = await client.get_nodes()
                nodes_data = {}
                for node in nodes:
                    node_name = node['node']
                    containers = await client.get_node_containers(node_name)
                    nodes_data[node_name] = containers
            
            # Apply status filter if specified
            status_filter = args.get('status_filter')
            if status_filter:
                for node_name in nodes_data:
                    nodes_data[node_name] = [
                        ct for ct in nodes_data[node_name] 
                        if ct.get('status') == status_filter
                    ]
            
            result = {
                "timestamp": datetime.now().isoformat(),
                "containers": nodes_data,
                "total_containers": sum(len(containers) for containers in nodes_data.values())
            }
            
            return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
            
        except Exception as e:
            raise ProxmoxOperationError(f"Failed to list containers: {e}")
    
    async def _run_health_assessment(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Run comprehensive health assessment."""
        client = await self._get_client(args.get('server'))
        include_recommendations = args.get('include_recommendations', True)
        
        try:
            # Gather all system information
            system_info = await client.gather_system_info()
            
            # Get details for all nodes
            nodes_details = {}
            if system_info.get('nodes'):
                for node in system_info['nodes']:
                    node_name = node['node']
                    nodes_details[node_name] = await client.get_node_details(node_name)
            
            # Analyze health issues
            health_issues = []
            recommendations = []
            
            # Check node status
            for node_name, details in nodes_details.items():
                if details and details.get('status'):
                    status = details['status']
                    
                    # Memory usage check
                    memory = status.get('memory', {})
                    if memory.get('total') and memory.get('used'):
                        mem_usage = (memory['used'] / memory['total']) * 100
                        if mem_usage > self.config.monitoring.memory_threshold:
                            health_issues.append(f"Node {node_name}: High memory usage {mem_usage:.1f}%")
                            if include_recommendations:
                                recommendations.append(f"Consider reducing VM memory allocation on {node_name}")
                    
                    # CPU usage check
                    cpu_usage = status.get('cpu', 0) * 100
                    if cpu_usage > self.config.monitoring.cpu_threshold:
                        health_issues.append(f"Node {node_name}: High CPU usage {cpu_usage:.1f}%")
                
                # Storage check
                if details and details.get('storage'):
                    for storage in details['storage']:
                        if storage.get('total') and storage.get('used'):
                            usage_pct = (storage['used'] / storage['total']) * 100
                            if usage_pct > self.config.monitoring.storage_threshold:
                                health_issues.append(f"Storage {storage['storage']} on {node_name}: {usage_pct:.1f}% usage")
                                if include_recommendations:
                                    recommendations.append(f"Clean up storage {storage['storage']} on {node_name}")
            
            health_score = max(0, 100 - len(health_issues) * 10)
            
            result = {
                "timestamp": datetime.now().isoformat(),
                "health_score": health_score,
                "status": "healthy" if health_score >= 80 else "warning" if health_score >= 60 else "critical",
                "issues_found": len(health_issues),
                "health_issues": health_issues,
                "system_info": system_info,
                "nodes_details": nodes_details
            }
            
            if include_recommendations:
                result["recommendations"] = recommendations
            
            return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
            
        except Exception as e:
            raise ProxmoxOperationError(f"Failed to run health assessment: {e}")
    
    async def _get_storage_status(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Get storage status and analysis."""
        client = await self._get_client(args.get('server'))
        
        try:
            storage_data = {}
            
            if args.get('node'):
                # Get storage for specific node
                node_storage = await client.get_node_storage(args['node'])
                storage_data[args['node']] = node_storage
            else:
                # Get storage for all nodes
                nodes = await client.get_nodes()
                for node in nodes:
                    node_name = node['node']
                    node_storage = await client.get_node_storage(node_name)
                    storage_data[node_name] = node_storage
            
            # Filter by specific storage if requested
            storage_name = args.get('storage_name')
            if storage_name:
                filtered_data = {}
                for node_name, storages in storage_data.items():
                    filtered_storages = [s for s in storages if s.get('storage') == storage_name]
                    if filtered_storages:
                        filtered_data[node_name] = filtered_storages
                storage_data = filtered_data
            
            # Calculate summary statistics
            total_storage = 0
            total_used = 0
            critical_storages = []
            
            for node_name, storages in storage_data.items():
                for storage in storages:
                    if storage.get('total') and storage.get('used'):
                        total_storage += storage['total']
                        total_used += storage['used']
                        
                        usage_pct = (storage['used'] / storage['total']) * 100
                        if usage_pct > self.config.monitoring.storage_threshold:
                            critical_storages.append({
                                'node': node_name,
                                'storage': storage['storage'],
                                'usage_percent': usage_pct
                            })
            
            result = {
                "timestamp": datetime.now().isoformat(),
                "storage_data": storage_data,
                "summary": {
                    "total_storage_bytes": total_storage,
                    "total_used_bytes": total_used,
                    "total_storage_formatted": client.format_bytes(total_storage),
                    "total_used_formatted": client.format_bytes(total_used),
                    "overall_usage_percent": (total_used / total_storage * 100) if total_storage > 0 else 0,
                    "critical_storages": critical_storages
                }
            }
            
            return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
            
        except Exception as e:
            raise ProxmoxOperationError(f"Failed to get storage status: {e}")
    
    async def _monitor_resource_usage(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Monitor real-time resource usage."""
        client = await self._get_client(args.get('server'))
        include_thresholds = args.get('include_thresholds', True)
        
        try:
            monitoring_data = {}
            threshold_violations = []
            
            if args.get('node'):
                # Monitor specific node
                node_status = await client.get_node_status(args['node'])
                monitoring_data[args['node']] = node_status
            else:
                # Monitor all nodes
                nodes = await client.get_nodes()
                for node in nodes:
                    node_name = node['node']
                    node_status = await client.get_node_status(node_name)
                    monitoring_data[node_name] = node_status
            
            # Check thresholds if requested
            if include_thresholds:
                for node_name, status in monitoring_data.items():
                    # CPU threshold check
                    cpu_usage = status.get('cpu', 0) * 100
                    if cpu_usage > self.config.monitoring.cpu_threshold:
                        threshold_violations.append({
                            'node': node_name,
                            'metric': 'cpu',
                            'value': cpu_usage,
                            'threshold': self.config.monitoring.cpu_threshold,
                            'severity': 'warning' if cpu_usage < 95 else 'critical'
                        })
                    
                    # Memory threshold check
                    memory = status.get('memory', {})
                    if memory.get('total') and memory.get('used'):
                        mem_usage = (memory['used'] / memory['total']) * 100
                        if mem_usage > self.config.monitoring.memory_threshold:
                            threshold_violations.append({
                                'node': node_name,
                                'metric': 'memory',
                                'value': mem_usage,
                                'threshold': self.config.monitoring.memory_threshold,
                                'severity': 'warning' if mem_usage < 95 else 'critical'
                            })
            
            result = {
                "timestamp": datetime.now().isoformat(),
                "monitoring_data": monitoring_data,
                "threshold_violations": threshold_violations if include_thresholds else None,
                "thresholds": {
                    "cpu_threshold": self.config.monitoring.cpu_threshold,
                    "memory_threshold": self.config.monitoring.memory_threshold,
                    "storage_threshold": self.config.monitoring.storage_threshold
                } if include_thresholds else None
            }
            
            return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
            
        except Exception as e:
            raise ProxmoxOperationError(f"Failed to monitor resource usage: {e}")
    
    async def _manage_snapshots(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Manage snapshots (list, analyze, cleanup)."""
        client = await self._get_client(args.get('server'))
        operation = args['operation']
        
        try:
            if operation == "list":
                return await self._list_snapshots(client, args)
            elif operation == "analyze":
                return await self._analyze_snapshots(client, args)
            elif operation == "cleanup":
                return await self._cleanup_snapshots(client, args)
            else:
                raise ProxmoxValidationError(f"Unknown snapshot operation: {operation}")
                
        except Exception as e:
            raise ProxmoxOperationError(f"Failed to manage snapshots: {e}")
    
    async def _list_snapshots(self, client: ProxmoxClient, args: Dict[str, Any]) -> Sequence[TextContent]:
        """List all snapshots."""
        snapshots_data = {}
        
        if args.get('node') and args.get('vmid'):
            # List snapshots for specific VM/container
            node = args['node']
            vmid = args['vmid']
            
            vm_snapshots = await client.get_vm_snapshots(node, vmid)
            container_snapshots = await client.get_container_snapshots(node, vmid)
            
            snapshots_data[f"{node}:{vmid}"] = {
                'vm_snapshots': vm_snapshots,
                'container_snapshots': container_snapshots
            }
        else:
            # List snapshots for all VMs/containers
            nodes = await client.get_nodes()
            
            for node in nodes:
                node_name = node['node']
                
                # Get VMs and their snapshots
                vms = await client.get_node_vms(node_name)
                for vm in vms:
                    vmid = vm['vmid']
                    snapshots = await client.get_vm_snapshots(node_name, vmid)
                    if snapshots:
                        snapshots_data[f"{node_name}:vm:{vmid}"] = snapshots
                
                # Get containers and their snapshots
                containers = await client.get_node_containers(node_name)
                for container in containers:
                    vmid = container['vmid']
                    snapshots = await client.get_container_snapshots(node_name, vmid)
                    if snapshots:
                        snapshots_data[f"{node_name}:ct:{vmid}"] = snapshots
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "operation": "list",
            "snapshots": snapshots_data,
            "total_snapshots": sum(len(snaps) if isinstance(snaps, list) else 
                                 len(snaps.get('vm_snapshots', [])) + len(snaps.get('container_snapshots', []))
                                 for snaps in snapshots_data.values())
        }
        
        return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
    
    async def _analyze_snapshots(self, client: ProxmoxClient, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Analyze snapshots for cleanup recommendations."""
        max_age_days = args.get('max_age_days', 90)
        cutoff_date = datetime.now() - timedelta(days=max_age_days)
        
        old_snapshots = []
        analysis_data = {}
        
        nodes = await client.get_nodes()
        
        for node in nodes:
            node_name = node['node']
            node_snapshots = {'vms': {}, 'containers': {}}
            
            # Analyze VM snapshots
            vms = await client.get_node_vms(node_name)
            for vm in vms:
                vmid = vm['vmid']
                snapshots = await client.get_vm_snapshots(node_name, vmid)
                
                vm_old_snapshots = []
                for snapshot in snapshots:
                    # Parse snapshot creation time (this would need to be adapted based on Proxmox API response format)
                    if 'snaptime' in snapshot:
                        snap_time = datetime.fromtimestamp(snapshot['snaptime'])
                        if snap_time < cutoff_date:
                            vm_old_snapshots.append({
                                'node': node_name,
                                'type': 'vm',
                                'vmid': vmid,
                                'snapshot': snapshot,
                                'age_days': (datetime.now() - snap_time).days
                            })
                
                if vm_old_snapshots:
                    node_snapshots['vms'][vmid] = vm_old_snapshots
                    old_snapshots.extend(vm_old_snapshots)
            
            # Analyze container snapshots
            containers = await client.get_node_containers(node_name)
            for container in containers:
                vmid = container['vmid']
                snapshots = await client.get_container_snapshots(node_name, vmid)
                
                ct_old_snapshots = []
                for snapshot in snapshots:
                    if 'snaptime' in snapshot:
                        snap_time = datetime.fromtimestamp(snapshot['snaptime'])
                        if snap_time < cutoff_date:
                            ct_old_snapshots.append({
                                'node': node_name,
                                'type': 'container',
                                'vmid': vmid,
                                'snapshot': snapshot,
                                'age_days': (datetime.now() - snap_time).days
                            })
                
                if ct_old_snapshots:
                    node_snapshots['containers'][vmid] = ct_old_snapshots
                    old_snapshots.extend(ct_old_snapshots)
            
            if node_snapshots['vms'] or node_snapshots['containers']:
                analysis_data[node_name] = node_snapshots
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "operation": "analyze",
            "max_age_days": max_age_days,
            "cutoff_date": cutoff_date.isoformat(),
            "old_snapshots_count": len(old_snapshots),
            "analysis_data": analysis_data,
            "old_snapshots": old_snapshots[:50]  # Limit output size
        }
        
        return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
    
    async def _cleanup_snapshots(self, client: ProxmoxClient, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Cleanup old snapshots."""
        if not args.get('confirm', False):
            return [TextContent(type="text", text="Snapshot cleanup requires confirmation. Set 'confirm': true to proceed.")]
        
        # Validate with security
        self.security.validate_destructive_operation('snapshot_cleanup', args)
        
        max_age_days = args.get('max_age_days', 90)
        
        # First analyze to get old snapshots
        analyze_result = await self._analyze_snapshots(client, args)
        analyze_data = json.loads(analyze_result[0].text)
        
        old_snapshots = analyze_data['old_snapshots']
        
        # Validate cleanup limits
        self.security.validate_cleanup_operation('snapshot_cleanup', len(old_snapshots), old_snapshots)
        
        cleanup_results = []
        
        if not self.security.is_dry_run_enabled():
            for snapshot_info in old_snapshots:
                try:
                    node = snapshot_info['node']
                    vmid = snapshot_info['vmid']
                    snapshot_name = snapshot_info['snapshot']['name']
                    
                    if snapshot_info['type'] == 'vm':
                        await client.delete_vm_snapshot(node, vmid, snapshot_name)
                    else:
                        await client.delete_container_snapshot(node, vmid, snapshot_name)
                    
                    cleanup_results.append({
                        'status': 'success',
                        'snapshot': snapshot_info
                    })
                    
                except Exception as e:
                    cleanup_results.append({
                        'status': 'failed',
                        'snapshot': snapshot_info,
                        'error': str(e)
                    })
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "operation": "cleanup",
            "dry_run": self.security.is_dry_run_enabled(),
            "max_age_days": max_age_days,
            "snapshots_processed": len(old_snapshots),
            "cleanup_results": cleanup_results
        }
        
        return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
    
    async def _manage_backups(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Manage backup files."""
        client = await self._get_client(args.get('server'))
        operation = args['operation']
        
        try:
            if operation == "list":
                return await self._list_backups(client, args)
            elif operation == "analyze":
                return await self._analyze_backups(client, args)
            elif operation == "cleanup":
                return await self._cleanup_backups(client, args)
            else:
                raise ProxmoxValidationError(f"Unknown backup operation: {operation}")
                
        except Exception as e:
            raise ProxmoxOperationError(f"Failed to manage backups: {e}")
    
    async def _list_backups(self, client: ProxmoxClient, args: Dict[str, Any]) -> Sequence[TextContent]:
        """List all backup files."""
        backups_data = {}
        
        if args.get('node'):
            nodes_to_check = [{'node': args['node']}]
        else:
            nodes_to_check = await client.get_nodes()
        
        for node in nodes_to_check:
            node_name = node['node']
            
            if args.get('storage'):
                backups = await client.get_backups(node_name, args['storage'])
                backups_data[f"{node_name}:{args['storage']}"] = backups
            else:
                backups = await client.get_backups(node_name)
                backups_data[node_name] = backups
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "operation": "list",
            "backups": backups_data,
            "total_backups": sum(len(backups) for backups in backups_data.values())
        }
        
        return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
    
    async def _analyze_backups(self, client: ProxmoxClient, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Analyze backups for cleanup."""
        max_age_days = args.get('max_age_days', 30)
        cutoff_date = datetime.now() - timedelta(days=max_age_days)
        
        old_backups = []
        analysis_data = {}
        
        if args.get('node'):
            nodes_to_check = [{'node': args['node']}]
        else:
            nodes_to_check = await client.get_nodes()
        
        for node in nodes_to_check:
            node_name = node['node']
            backups = await client.get_backups(node_name, args.get('storage'))
            
            node_old_backups = []
            for backup in backups:
                # Parse backup creation time
                if 'ctime' in backup:
                    backup_time = datetime.fromtimestamp(backup['ctime'])
                    if backup_time < cutoff_date:
                        node_old_backups.append({
                            'node': node_name,
                            'backup': backup,
                            'age_days': (datetime.now() - backup_time).days
                        })
            
            if node_old_backups:
                analysis_data[node_name] = node_old_backups
                old_backups.extend(node_old_backups)
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "operation": "analyze",
            "max_age_days": max_age_days,
            "cutoff_date": cutoff_date.isoformat(),
            "old_backups_count": len(old_backups),
            "analysis_data": analysis_data,
            "old_backups": old_backups[:50]
        }
        
        return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
    
    async def _cleanup_backups(self, client: ProxmoxClient, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Cleanup old backup files."""
        if not args.get('confirm', False):
            return [TextContent(type="text", text="Backup cleanup requires confirmation. Set 'confirm': true to proceed.")]
        
        # Validate with security
        self.security.validate_destructive_operation('backup_cleanup', args)
        
        # Get old backups to clean
        analyze_result = await self._analyze_backups(client, args)
        analyze_data = json.loads(analyze_result[0].text)
        
        old_backups = analyze_data['old_backups']
        
        # Validate cleanup limits
        self.security.validate_cleanup_operation('backup_cleanup', len(old_backups), old_backups)
        
        cleanup_results = []
        
        if not self.security.is_dry_run_enabled():
            for backup_info in old_backups:
                try:
                    node = backup_info['node']
                    backup = backup_info['backup']
                    storage = backup['storage']
                    volid = backup['volid']
                    
                    await client.delete_backup(node, storage, volid)
                    
                    cleanup_results.append({
                        'status': 'success',
                        'backup': backup_info
                    })
                    
                except Exception as e:
                    cleanup_results.append({
                        'status': 'failed',
                        'backup': backup_info,
                        'error': str(e)
                    })
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "operation": "cleanup",
            "dry_run": self.security.is_dry_run_enabled(),
            "backups_processed": len(old_backups),
            "cleanup_results": cleanup_results
        }
        
        return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
    
    async def _optimize_storage(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Optimize storage usage."""
        client = await self._get_client(args.get('server'))
        operation = args.get('operation', 'analyze')
        
        try:
            # Get current storage status
            storage_result = await self._get_storage_status(args)
            storage_data = json.loads(storage_result[0].text)
            
            optimization_recommendations = []
            
            # Analyze storage usage and generate recommendations
            for node_name, storages in storage_data['storage_data'].items():
                for storage in storages:
                    if storage.get('total') and storage.get('used'):
                        usage_pct = (storage['used'] / storage['total']) * 100
                        
                        if usage_pct > 90:
                            optimization_recommendations.append({
                                'priority': 'high',
                                'node': node_name,
                                'storage': storage['storage'],
                                'current_usage': usage_pct,
                                'recommendation': 'Immediate cleanup required - consider snapshot/backup cleanup'
                            })
                        elif usage_pct > 80:
                            optimization_recommendations.append({
                                'priority': 'medium',
                                'node': node_name,
                                'storage': storage['storage'],
                                'current_usage': usage_pct,
                                'recommendation': 'Monitor closely and plan cleanup'
                            })
            
            result = {
                "timestamp": datetime.now().isoformat(),
                "operation": operation,
                "storage_analysis": storage_data,
                "optimization_recommendations": optimization_recommendations,
                "total_recommendations": len(optimization_recommendations)
            }
            
            if operation == 'optimize' and args.get('confirm', False):
                # Actually perform optimization actions
                result['optimization_actions'] = []
                
                for rec in optimization_recommendations:
                    if rec['priority'] == 'high':
                        # Perform automated cleanup for high priority items
                        try:
                            # Cleanup snapshots for this storage
                            snapshot_cleanup = await self._cleanup_snapshots(client, {
                                'node': rec['node'],
                                'max_age_days': 30,
                                'confirm': True
                            })
                            
                            result['optimization_actions'].append({
                                'action': 'snapshot_cleanup',
                                'target': f"{rec['node']}:{rec['storage']}",
                                'status': 'completed'
                            })
                            
                        except Exception as e:
                            result['optimization_actions'].append({
                                'action': 'snapshot_cleanup',
                                'target': f"{rec['node']}:{rec['storage']}",
                                'status': 'failed',
                                'error': str(e)
                            })
            
            return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
            
        except Exception as e:
            raise ProxmoxOperationError(f"Failed to optimize storage: {e}")
    
    async def _execute_maintenance(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Execute automated maintenance tasks."""
        tasks = args['tasks']
        dry_run = args.get('dry_run', True)
        confirm = args.get('confirm', False)
        
        if not dry_run and not confirm:
            return [TextContent(type="text", text="Maintenance execution requires confirmation. Set 'confirm': true to proceed.")]
        
        maintenance_results = []
        
        for task in tasks:
            try:
                if task == 'snapshot_cleanup':
                    result = await self._cleanup_snapshots(
                        await self._get_client(args.get('server')),
                        {'max_age_days': 90, 'confirm': confirm and not dry_run}
                    )
                elif task == 'backup_cleanup':
                    result = await self._cleanup_backups(
                        await self._get_client(args.get('server')),
                        {'max_age_days': 30, 'confirm': confirm and not dry_run}
                    )
                elif task == 'storage_optimization':
                    result = await self._optimize_storage({
                        'operation': 'optimize',
                        'confirm': confirm and not dry_run,
                        'server': args.get('server')
                    })
                elif task == 'health_check':
                    result = await self._run_health_assessment({
                        'include_recommendations': True,
                        'server': args.get('server')
                    })
                else:
                    raise ProxmoxValidationError(f"Unknown maintenance task: {task}")
                
                maintenance_results.append({
                    'task': task,
                    'status': 'completed',
                    'result': json.loads(result[0].text) if result else None
                })
                
            except Exception as e:
                maintenance_results.append({
                    'task': task,
                    'status': 'failed',
                    'error': str(e)
                })
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "operation": "maintenance",
            "dry_run": dry_run,
            "tasks_executed": len(tasks),
            "maintenance_results": maintenance_results
        }
        
        return [TextContent(type="text", text=json.dumps(result, indent=2, default=str))]
    
    async def _get_audit_report(self, args: Dict[str, Any]) -> Sequence[TextContent]:
        """Generate comprehensive audit report."""
        client = await self._get_client(args.get('server'))
        include_detailed = args.get('include_detailed_analysis', True)
        format_type = args.get('format', 'json')
        
        try:
            # Gather comprehensive data
            audit_data = {
                "timestamp": datetime.now().isoformat(),
                "server_info": client.get_connection_info(),
                "system_info": await client.gather_system_info()
            }
            
            # Get node details
            nodes_details = {}
            if audit_data['system_info'].get('nodes'):
                for node in audit_data['system_info']['nodes']:
                    node_name = node['node']
                    nodes_details[node_name] = await client.get_node_details(node_name)
            
            audit_data["nodes_details"] = nodes_details
            
            if include_detailed:
                # Run health assessment
                health_result = await self._run_health_assessment({'include_recommendations': True, 'server': args.get('server')})
                audit_data["health_assessment"] = json.loads(health_result[0].text)
                
                # Get storage analysis
                storage_result = await self._get_storage_status({'server': args.get('server')})
                audit_data["storage_analysis"] = json.loads(storage_result[0].text)
                
                # Get snapshot analysis
                snapshot_result = await self._analyze_snapshots(client, {'max_age_days': 90})
                audit_data["snapshot_analysis"] = json.loads(snapshot_result[0].text)
                
                # Get backup analysis
                backup_result = await self._analyze_backups(client, {'max_age_days': 30})
                audit_data["backup_analysis"] = json.loads(backup_result[0].text)
            
            if format_type == 'json':
                return [TextContent(type="text", text=json.dumps(audit_data, indent=2, default=str))]
            else:
                # Generate text format report
                text_report = f"""
PROXMOX ENVIRONMENT AUDIT REPORT
Generated: {audit_data['timestamp']}
Server: {audit_data['server_info']['host']}:{audit_data['server_info']['port']}

=== SYSTEM OVERVIEW ===
Nodes: {len(audit_data['system_info'].get('nodes', []))}
VMs: {sum(len(details.get('vms', [])) for details in nodes_details.values())}
Containers: {sum(len(details.get('containers', [])) for details in nodes_details.values())}

=== HEALTH STATUS ===
"""
                if include_detailed:
                    health = audit_data['health_assessment']
                    text_report += f"Health Score: {health['health_score']}/100\n"
                    text_report += f"Status: {health['status']}\n"
                    text_report += f"Issues Found: {health['issues_found']}\n"
                
                return [TextContent(type="text", text=text_report)]
            
        except Exception as e:
            raise ProxmoxOperationError(f"Failed to generate audit report: {e}")
    
    async def run(self):
        """Run the MCP server."""
        try:
            logger.info("Starting Proxmox MCP Server...")
            
            # Initialize any required connections
            default_client = await self._get_client()
            logger.info(f"Connected to default Proxmox server: {default_client.host}")
            
            # Start the MCP server
            from mcp.server.stdio import stdio_server
            async with stdio_server() as (read_stream, write_stream):
                await self.app.run(
                    read_stream,
                    write_stream,
                    InitializationOptions(
                        server_name="proxmox-mcp-server",
                        server_version="1.0.0",
                        capabilities=self.app.get_capabilities(
                            notification_options=NotificationOptions(),
                            experimental_capabilities={}
                        )
                    )
                )
                
        except Exception as e:
            logger.error(f"Failed to start Proxmox MCP Server: {e}")
            raise
        finally:
            # Cleanup connections
            for client in self._clients.values():
                await client.disconnect()
            logger.info("Proxmox MCP Server stopped")