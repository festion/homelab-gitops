"""
Security validation and access control for Proxmox MCP Server.
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from .config import SecurityConfig
from .exceptions import ProxmoxSecurityError, ProxmoxValidationError

logger = logging.getLogger(__name__)


class SecurityValidator:
    """Security validation and access control for Proxmox operations."""
    
    def __init__(self, security_config: SecurityConfig):
        self.config = security_config
        self.operation_log: List[Dict[str, Any]] = []
    
    def validate_operation(self, operation: str, params: Optional[Dict[str, Any]] = None) -> bool:
        """Validate if an operation is allowed based on security configuration."""
        params = params or {}
        
        # Check operation permissions
        operation_permissions = {
            'vm': self.config.allow_vm_operations,
            'storage': self.config.allow_storage_operations,
            'snapshot': self.config.allow_snapshot_operations,
            'backup': self.config.allow_backup_operations,
            'system': self.config.allow_system_operations,
        }
        
        # Determine operation category
        operation_category = self._get_operation_category(operation)
        
        if operation_category and not operation_permissions.get(operation_category, False):
            raise ProxmoxSecurityError(f"Operation category '{operation_category}' is not allowed by security configuration")
        
        # Validate specific operation parameters
        self._validate_operation_params(operation, params)
        
        # Log the operation attempt
        self._log_operation(operation, params, 'validated')
        
        return True
    
    def validate_resource_limits(self, operation: str, resource_data: Dict[str, Any]) -> bool:
        """Validate resource usage against configured limits."""
        
        # Memory usage validation
        if 'memory' in resource_data:
            memory_usage = resource_data['memory'].get('usage_percent', 0)
            if memory_usage > self.config.memory_usage_threshold:
                logger.warning(f"Memory usage {memory_usage}% exceeds threshold {self.config.memory_usage_threshold}%")
                if operation in ['vm_start', 'container_start']:
                    raise ProxmoxSecurityError(f"Cannot start VM/container: memory usage {memory_usage}% exceeds threshold")
        
        # Storage usage validation
        if 'storage' in resource_data:
            for storage_name, storage_info in resource_data['storage'].items():
                usage_percent = storage_info.get('usage_percent', 0)
                if usage_percent > self.config.storage_usage_threshold:
                    logger.warning(f"Storage '{storage_name}' usage {usage_percent}% exceeds threshold {self.config.storage_usage_threshold}%")
                    if operation in ['vm_create', 'container_create', 'backup_create']:
                        raise ProxmoxSecurityError(f"Cannot perform operation: storage '{storage_name}' usage {usage_percent}% exceeds threshold")
        
        return True
    
    def validate_cleanup_operation(self, operation: str, items_count: int, items_data: List[Dict[str, Any]]) -> bool:
        """Validate cleanup operations for safety."""
        
        # Check item count limits
        if items_count > self.config.max_cleanup_items_per_operation:
            raise ProxmoxSecurityError(
                f"Cleanup operation would affect {items_count} items, exceeding limit of {self.config.max_cleanup_items_per_operation}"
            )
        
        # Validate age-based cleanup operations
        if operation == 'snapshot_cleanup':
            min_age = timedelta(days=self.config.max_snapshot_age_days)
            current_time = datetime.now()
            
            for item in items_data:
                if 'created' in item:
                    item_age = current_time - datetime.fromisoformat(item['created'].replace('Z', '+00:00'))
                    if item_age < min_age:
                        raise ProxmoxSecurityError(
                            f"Snapshot '{item.get('name', 'unknown')}' is only {item_age.days} days old, below minimum age of {self.config.max_snapshot_age_days} days"
                        )
        
        elif operation == 'backup_cleanup':
            min_age = timedelta(days=self.config.max_backup_age_days)
            current_time = datetime.now()
            
            for item in items_data:
                if 'created' in item:
                    item_age = current_time - datetime.fromisoformat(item['created'].replace('Z', '+00:00'))
                    if item_age < min_age:
                        raise ProxmoxSecurityError(
                            f"Backup '{item.get('name', 'unknown')}' is only {item_age.days} days old, below minimum age of {self.config.max_backup_age_days} days"
                        )
        
        return True
    
    def validate_destructive_operation(self, operation: str, params: Dict[str, Any]) -> bool:
        """Validate destructive operations that require confirmation."""
        
        destructive_operations = [
            'vm_delete', 'container_delete', 'snapshot_delete', 'backup_delete',
            'storage_cleanup', 'snapshot_cleanup', 'backup_cleanup'
        ]
        
        if operation in destructive_operations:
            if self.config.require_confirmation_for_destructive_ops:
                confirmed = params.get('confirm', False)
                if not confirmed:
                    raise ProxmoxSecurityError(
                        f"Destructive operation '{operation}' requires explicit confirmation. Set 'confirm': true in parameters."
                    )
        
        return True
    
    def is_dry_run_enabled(self) -> bool:
        """Check if dry run mode is enabled."""
        return self.config.enable_dry_run_mode
    
    def _get_operation_category(self, operation: str) -> Optional[str]:
        """Determine the category of an operation."""
        
        operation_categories = {
            'vm': ['vm_list', 'vm_status', 'vm_start', 'vm_stop', 'vm_restart', 'vm_delete', 'vm_create'],
            'storage': ['storage_list', 'storage_status', 'storage_cleanup', 'storage_optimize'],
            'snapshot': ['snapshot_list', 'snapshot_create', 'snapshot_delete', 'snapshot_cleanup'],
            'backup': ['backup_list', 'backup_create', 'backup_delete', 'backup_cleanup'],
            'system': ['system_info', 'node_status', 'health_assessment', 'system_update'],
        }
        
        for category, operations in operation_categories.items():
            if operation in operations:
                return category
        
        return None
    
    def _validate_operation_params(self, operation: str, params: Dict[str, Any]) -> None:
        """Validate specific parameters for different operations."""
        
        # VM ID validation
        if operation.startswith('vm_') and 'vmid' in params:
            vmid = params['vmid']
            if not isinstance(vmid, int) or vmid < 100 or vmid > 999999999:
                raise ProxmoxValidationError(f"Invalid VM ID: {vmid}. Must be integer between 100 and 999999999")
        
        # Container ID validation
        if operation.startswith('container_') and 'vmid' in params:
            vmid = params['vmid']
            if not isinstance(vmid, int) or vmid < 100 or vmid > 999999999:
                raise ProxmoxValidationError(f"Invalid container ID: {vmid}. Must be integer between 100 and 999999999")
        
        # Node name validation
        if 'node' in params:
            node = params['node']
            if not isinstance(node, str) or not node.strip():
                raise ProxmoxValidationError(f"Invalid node name: {node}")
        
        # Storage name validation
        if 'storage' in params:
            storage = params['storage']
            if not isinstance(storage, str) or not storage.strip():
                raise ProxmoxValidationError(f"Invalid storage name: {storage}")
    
    def _log_operation(self, operation: str, params: Dict[str, Any], status: str) -> None:
        """Log operation for audit trail."""
        
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'operation': operation,
            'params': params,
            'status': status
        }
        
        self.operation_log.append(log_entry)
        logger.info(f"Operation {operation} {status}", extra={'operation_log': log_entry})
        
        # Keep only last 1000 log entries in memory
        if len(self.operation_log) > 1000:
            self.operation_log = self.operation_log[-1000:]
    
    def get_operation_log(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get operation log for audit purposes."""
        if limit:
            return self.operation_log[-limit:]
        return self.operation_log.copy()
    
    def clear_operation_log(self) -> None:
        """Clear the operation log."""
        self.operation_log.clear()
        logger.info("Operation log cleared")