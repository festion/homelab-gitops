/**
 * Script Node Component for Pipeline Designer
 * Represents a script execution step
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ScriptNodeData {
  label: string;
  script: string;
  scriptType: 'bash' | 'python' | 'node' | 'powershell' | 'sh';
  workingDirectory?: string;
  environment?: Record<string, string>;
  timeout?: number;
  status?: 'idle' | 'running' | 'success' | 'failed' | 'timeout';
}

export const ScriptNode: React.FC<NodeProps<ScriptNodeData>> = ({ data, selected }) => {
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
        return '#7c3aed'; // purple (default for scripts)
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
        return <FileText className="w-3 h-3" />;
    }
  };

  const getScriptTypeColor = () => {
    switch (data.scriptType) {
      case 'python':
        return '#3776ab';
      case 'node':
        return '#339933';
      case 'bash':
      case 'sh':
        return '#4eaa25';
      case 'powershell':
        return '#5391fe';
      default:
        return '#6b7280';
    }
  };

  const getScriptTypeIcon = () => {
    switch (data.scriptType) {
      case 'python':
        return '🐍';
      case 'node':
        return '📗';
      case 'bash':
      case 'sh':
        return '📟';
      case 'powershell':
        return '💙';
      default:
        return '📄';
    }
  };

  const formatScript = (script: string) => {
    const lines = script.split('\n');
    if (lines.length > 3) {
      return lines.slice(0, 3).join('\n') + '\n...';
    }
    return script;
  };

  const getLineCount = (script: string) => {
    return script.split('\n').length;
  };

  return (
    <div
      className={`pipeline-node script-node ${selected ? 'selected' : ''}`}
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
          className="script-type-badge"
          style={{
            backgroundColor: getScriptTypeColor(),
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{getScriptTypeIcon()}</span>
          {data.scriptType}
        </div>
      </div>

      {/* Script Preview */}
      <div className="node-content" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
        <div
          className="script-preview"
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '8px',
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '10px',
            marginBottom: '6px',
            maxHeight: '80px',
            overflow: 'hidden',
            lineHeight: '1.4',
          }}
        >
          {formatScript(data.script)}
        </div>
        
        {/* Script Info */}
        <div className="script-info" style={{ fontSize: '11px' }}>
          <div style={{ marginBottom: '2px' }}>
            <strong>Lines:</strong> {getLineCount(data.script)}
          </div>
          
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
          
          {Object.keys(data.environment || {}).length > 0 && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Env vars:</strong> {Object.keys(data.environment || {}).length}
            </div>
          )}
        </div>
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