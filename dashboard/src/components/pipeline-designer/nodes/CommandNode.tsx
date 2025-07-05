/**
 * Command Node Component for Pipeline Designer
 * Represents a command execution step
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Terminal, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface CommandNodeData {
  label: string;
  command: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
  timeout?: number;
  retryCount?: number;
  continueOnError?: boolean;
  status?: 'idle' | 'running' | 'success' | 'failed' | 'timeout';
}

export const CommandNode: React.FC<NodeProps<CommandNodeData>> = ({ data, selected }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return '#3b82f6'; // blue
      case 'success':
        return '#10b981'; // green
      case 'failed':
        return '#ef4444'; // red
      case 'timeout':
        return '#f59e0b'; // amber
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <Clock className="w-3 h-3" />;
      case 'success':
        return <CheckCircle className="w-3 h-3" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3" />;
      case 'timeout':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Terminal className="w-3 h-3" />;
    }
  };

  const formatCommand = (cmd: string) => {
    if (cmd.length > 30) {
      return cmd.substring(0, 30) + '...';
    }
    return cmd;
  };

  return (
    <div
      className={`pipeline-node command-node ${selected ? 'selected' : ''}`}
      style={{
        background: '#ffffff',
        border: `2px solid ${selected ? '#3b82f6' : getStatusColor()}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '180px',
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

      {/* Command Preview */}
      <div className="node-content" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
        <div
          className="command-preview"
          style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '6px 8px',
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '11px',
            marginBottom: '6px',
          }}
        >
          {formatCommand(data.command)}
        </div>
        
        {/* Additional Info */}
        <div className="command-info">
          {data.workingDirectory && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Dir:</strong> {data.workingDirectory}
            </div>
          )}
          
          {data.timeout && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Timeout:</strong> {data.timeout}s
            </div>
          )}
          
          {data.retryCount && data.retryCount > 0 && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Retries:</strong> {data.retryCount}
            </div>
          )}
          
          {Object.keys(data.environment || {}).length > 0 && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Env vars:</strong> {Object.keys(data.environment || {}).length}
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      {(data.continueOnError || data.retryCount) && (
        <div className="node-options" style={{ fontSize: '10px', color: '#9ca3af' }}>
          {data.continueOnError && (
            <span
              className="option-tag"
              style={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '2px 6px',
                borderRadius: '10px',
                marginRight: '4px',
              }}
            >
              Continue on error
            </span>
          )}
          {data.retryCount && data.retryCount > 0 && (
            <span
              className="option-tag"
              style={{
                backgroundColor: '#e0e7ff',
                color: '#3730a3',
                padding: '2px 6px',
                borderRadius: '10px',
              }}
            >
              Retry: {data.retryCount}
            </span>
          )}
        </div>
      )}

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

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
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