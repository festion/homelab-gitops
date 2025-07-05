/**
 * Docker Node Component for Pipeline Designer
 * Represents a Docker container execution step
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Container, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface DockerNodeData {
  label: string;
  image: string;
  command?: string;
  volumes?: string[];
  environment?: Record<string, string>;
  ports?: string[];
  workingDirectory?: string;
  network?: string;
  pull?: 'always' | 'missing' | 'never';
  status?: 'idle' | 'running' | 'success' | 'failed' | 'timeout';
}

export const DockerNode: React.FC<NodeProps<DockerNodeData>> = ({ data, selected }) => {
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
        return '#0ea5e9'; // sky blue (default for docker)
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
        return <Container className="w-3 h-3" />;
    }
  };

  const formatImage = (image: string) => {
    if (image.length > 25) {
      return image.substring(0, 25) + '...';
    }
    return image;
  };

  const formatCommand = (cmd: string) => {
    if (cmd && cmd.length > 30) {
      return cmd.substring(0, 30) + '...';
    }
    return cmd;
  };

  const getImageTag = (image: string) => {
    const parts = image.split(':');
    return parts.length > 1 ? parts[parts.length - 1] : 'latest';
  };

  const getImageName = (image: string) => {
    const parts = image.split(':');
    return parts[0];
  };

  return (
    <div
      className={`pipeline-node docker-node ${selected ? 'selected' : ''}`}
      style={{
        background: '#ffffff',
        border: `2px solid ${selected ? '#3b82f6' : getStatusColor()}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '200px',
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
        <div style={{ flex: 1 }}>
          <div className="node-title" style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>
            {data.label}
          </div>
        </div>
        <div
          className="docker-badge"
          style={{
            backgroundColor: '#0ea5e9',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
          }}
        >
          🐳 DOCKER
        </div>
      </div>

      {/* Image Info */}
      <div className="node-content" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
        <div
          className="image-info"
          style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '6px 8px',
            marginBottom: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: '11px',
                fontWeight: '600',
                color: '#1f2937',
              }}
            >
              {formatImage(getImageName(data.image))}
            </div>
            <div
              style={{
                backgroundColor: '#e0e7ff',
                color: '#3730a3',
                padding: '1px 4px',
                borderRadius: '3px',
                fontSize: '9px',
                fontWeight: '600',
              }}
            >
              {getImageTag(data.image)}
            </div>
          </div>
        </div>

        {/* Command */}
        {data.command && (
          <div
            className="command-preview"
            style={{
              backgroundColor: '#fafafa',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '4px 6px',
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: '10px',
              marginBottom: '6px',
            }}
          >
            {formatCommand(data.command)}
          </div>
        )}

        {/* Docker Info */}
        <div className="docker-info" style={{ fontSize: '11px' }}>
          {data.volumes && data.volumes.length > 0 && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Volumes:</strong> {data.volumes.length}
            </div>
          )}
          
          {data.ports && data.ports.length > 0 && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Ports:</strong> {data.ports.join(', ')}
            </div>
          )}
          
          {data.network && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Network:</strong> {data.network}
            </div>
          )}
          
          {data.workingDirectory && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Workdir:</strong> {data.workingDirectory}
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
      <div className="node-options" style={{ fontSize: '10px', color: '#9ca3af' }}>
        {data.pull && data.pull !== 'missing' && (
          <span
            className="option-tag"
            style={{
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              padding: '2px 6px',
              borderRadius: '10px',
              marginRight: '4px',
            }}
          >
            Pull: {data.pull}
          </span>
        )}
        
        {data.volumes && data.volumes.length > 0 && (
          <span
            className="option-tag"
            style={{
              backgroundColor: '#f3e8ff',
              color: '#7c3aed',
              padding: '2px 6px',
              borderRadius: '10px',
              marginRight: '4px',
            }}
          >
            📁 {data.volumes.length} vol
          </span>
        )}
        
        {data.ports && data.ports.length > 0 && (
          <span
            className="option-tag"
            style={{
              backgroundColor: '#ecfccb',
              color: '#365314',
              padding: '2px 6px',
              borderRadius: '10px',
            }}
          >
            🔌 {data.ports.length} port
          </span>
        )}
      </div>

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