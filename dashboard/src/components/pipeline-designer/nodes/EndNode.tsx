/**
 * End Node Component for Pipeline Designer
 * Represents the end point of a pipeline
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Square, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface EndNodeData {
  label: string;
  action: 'complete' | 'notify' | 'archive' | 'cleanup';
  notifications?: string[];
  cleanup?: {
    artifacts: boolean;
    workspace: boolean;
    cache: boolean;
  };
  archiveArtifacts?: boolean;
  status?: 'idle' | 'running' | 'success' | 'failed';
}

export const EndNode: React.FC<NodeProps<EndNodeData>> = ({ data, selected }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return '#3b82f6'; // blue
      case 'success':
        return '#10b981'; // green
      case 'failed':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray (default for end)
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'success':
        return <CheckCircle className="w-3 h-3" />;
      case 'failed':
        return <XCircle className="w-3 h-3" />;
      case 'running':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Square className="w-3 h-3" />;
    }
  };

  const getActionIcon = () => {
    switch (data.action) {
      case 'notify':
        return '🔔';
      case 'archive':
        return '📦';
      case 'cleanup':
        return '🧹';
      default:
        return '🏁';
    }
  };

  const getActionColor = () => {
    switch (data.action) {
      case 'notify':
        return '#3b82f6';
      case 'archive':
        return '#8b5cf6';
      case 'cleanup':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  return (
    <div
      className={`pipeline-node end-node ${selected ? 'selected' : ''}`}
      style={{
        background: '#f9fafb',
        border: `2px solid ${selected ? '#3b82f6' : getStatusColor()}`,
        borderRadius: '12px',
        padding: '12px',
        minWidth: '160px',
        boxShadow: selected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div className="node-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <div
          className="node-icon"
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            backgroundColor: getStatusColor(),
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
          }}
        >
          {getStatusIcon()}
        </div>
        <div className="node-title" style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>
          {data.label}
        </div>
      </div>

      {/* Content */}
      <div className="node-content" style={{ fontSize: '12px', color: '#6b7280' }}>
        <div className="action-type" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '6px', fontSize: '14px' }}>{getActionIcon()}</span>
          <span style={{ fontWeight: '600', color: getActionColor() }}>{data.action}</span>
        </div>
        
        {data.notifications && data.notifications.length > 0 && (
          <div className="notifications-info" style={{ marginBottom: '4px' }}>
            <strong>Notifications:</strong> {data.notifications.length} channels
          </div>
        )}
        
        {data.cleanup && (
          <div className="cleanup-info" style={{ marginBottom: '4px' }}>
            <strong>Cleanup:</strong>{' '}
            {[
              data.cleanup.artifacts && 'artifacts',
              data.cleanup.workspace && 'workspace',
              data.cleanup.cache && 'cache'
            ].filter(Boolean).join(', ')}
          </div>
        )}
        
        {data.archiveArtifacts && (
          <div className="archive-info">
            <strong>Archive:</strong> artifacts enabled
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div
        className="status-indicator"
        style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          border: '2px solid white',
        }}
      />

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: getStatusColor(),
          border: '2px solid white',
          width: '12px',
          height: '12px',
        }}
      />
    </div>
  );
};