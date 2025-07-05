/**
 * Start Node Component for Pipeline Designer
 * Represents the starting point of a pipeline
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Play, Settings } from 'lucide-react';

interface StartNodeData {
  label: string;
  trigger: 'manual' | 'webhook' | 'schedule' | 'push' | 'pr';
  schedule?: string;
  branches?: string[];
  webhookUrl?: string;
}

export const StartNode: React.FC<NodeProps<StartNodeData>> = ({ data, selected }) => {
  const getTriggerIcon = () => {
    switch (data.trigger) {
      case 'schedule':
        return '⏰';
      case 'webhook':
        return '🔗';
      case 'push':
        return '📤';
      case 'pr':
        return '🔄';
      default:
        return '▶️';
    }
  };

  const getTriggerColor = () => {
    switch (data.trigger) {
      case 'schedule':
        return '#10b981'; // green
      case 'webhook':
        return '#3b82f6'; // blue
      case 'push':
        return '#8b5cf6'; // purple
      case 'pr':
        return '#f59e0b'; // amber
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <div
      className={`pipeline-node start-node ${selected ? 'selected' : ''}`}
      style={{
        background: '#f8fafc',
        border: `2px solid ${selected ? '#3b82f6' : getTriggerColor()}`,
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
            backgroundColor: getTriggerColor(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
            fontSize: '12px',
          }}
        >
          {getTriggerIcon()}
        </div>
        <div className="node-title" style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>
          {data.label}
        </div>
      </div>

      {/* Content */}
      <div className="node-content" style={{ fontSize: '12px', color: '#6b7280' }}>
        <div className="trigger-type" style={{ marginBottom: '4px' }}>
          <strong>Trigger:</strong> {data.trigger}
        </div>
        
        {data.trigger === 'schedule' && data.schedule && (
          <div className="schedule-info">
            <strong>Schedule:</strong> {data.schedule}
          </div>
        )}
        
        {data.trigger === 'webhook' && data.webhookUrl && (
          <div className="webhook-info">
            <strong>Webhook:</strong> {data.webhookUrl}
          </div>
        )}
        
        {(data.trigger === 'push' || data.trigger === 'pr') && data.branches && (
          <div className="branches-info">
            <strong>Branches:</strong> {data.branches.join(', ')}
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
          backgroundColor: '#10b981',
          border: '2px solid white',
        }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: getTriggerColor(),
          border: '2px solid white',
          width: '12px',
          height: '12px',
        }}
      />
    </div>
  );
};