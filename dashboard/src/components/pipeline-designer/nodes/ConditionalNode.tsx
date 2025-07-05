/**
 * Conditional Node Component for Pipeline Designer
 * Represents a conditional branching step
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ConditionalNodeData {
  label: string;
  condition: string;
  conditionType: 'success' | 'failure' | 'always' | 'custom' | 'expression';
  expression?: string;
  trueLabel: string;
  falseLabel: string;
  status?: 'idle' | 'running' | 'success' | 'failed';
  result?: 'true' | 'false' | null;
}

export const ConditionalNode: React.FC<NodeProps<ConditionalNodeData>> = ({ data, selected }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return '#3b82f6'; // blue
      case 'success':
        return '#10b981'; // green
      case 'failed':
        return '#ef4444'; // red
      default:
        return '#f59e0b'; // amber (default for conditional)
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <AlertCircle className="w-3 h-3" />;
      case 'success':
        return <CheckCircle className="w-3 h-3" />;
      case 'failed':
        return <XCircle className="w-3 h-3" />;
      default:
        return <GitBranch className="w-3 h-3" />;
    }
  };

  const getConditionTypeColor = () => {
    switch (data.conditionType) {
      case 'success':
        return '#10b981';
      case 'failure':
        return '#ef4444';
      case 'always':
        return '#6b7280';
      case 'custom':
        return '#8b5cf6';
      case 'expression':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getConditionTypeIcon = () => {
    switch (data.conditionType) {
      case 'success':
        return '✅';
      case 'failure':
        return '❌';
      case 'always':
        return '🔄';
      case 'custom':
        return '⚙️';
      case 'expression':
        return '🧮';
      default:
        return '❓';
    }
  };

  const formatCondition = (condition: string) => {
    if (condition.length > 25) {
      return condition.substring(0, 25) + '...';
    }
    return condition;
  };

  return (
    <div
      className={`pipeline-node conditional-node ${selected ? 'selected' : ''}`}
      style={{
        background: '#ffffff',
        border: `2px solid ${selected ? '#3b82f6' : getStatusColor()}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '180px',
        boxShadow: selected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        position: 'relative',
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
          className="condition-type-badge"
          style={{
            backgroundColor: getConditionTypeColor(),
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
          <span>{getConditionTypeIcon()}</span>
          {data.conditionType}
        </div>
      </div>

      {/* Condition */}
      <div className="node-content" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
        <div
          className="condition-preview"
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '6px 8px',
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '11px',
            marginBottom: '6px',
          }}
        >
          {data.conditionType === 'expression' && data.expression 
            ? formatCondition(data.expression)
            : formatCondition(data.condition)
          }
        </div>

        {/* Result Display */}
        {data.result !== null && (
          <div
            className="condition-result"
            style={{
              backgroundColor: data.result === 'true' ? '#dcfce7' : '#fee2e2',
              border: `1px solid ${data.result === 'true' ? '#10b981' : '#ef4444'}`,
              borderRadius: '4px',
              padding: '4px 6px',
              fontSize: '10px',
              fontWeight: '600',
              color: data.result === 'true' ? '#166534' : '#991b1b',
              textAlign: 'center',
              marginBottom: '6px',
            }}
          >
            Result: {data.result === 'true' ? 'TRUE' : 'FALSE'}
          </div>
        )}
      </div>

      {/* Branch Labels */}
      <div className="branch-labels" style={{ fontSize: '10px', color: '#9ca3af' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              padding: '2px 6px',
              borderRadius: '10px',
            }}
          >
            ✓ {data.trueLabel}
          </span>
          <span
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '2px 6px',
              borderRadius: '10px',
            }}
          >
            ✗ {data.falseLabel}
          </span>
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

      {/* True Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{
          background: '#10b981',
          border: '2px solid white',
          width: '12px',
          height: '12px',
          top: '30%',
        }}
      />

      {/* False Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{
          background: '#ef4444',
          border: '2px solid white',
          width: '12px',
          height: '12px',
          top: '70%',
        }}
      />

      {/* Handle Labels */}
      <div
        style={{
          position: 'absolute',
          right: '-50px',
          top: '25%',
          fontSize: '9px',
          color: '#10b981',
          fontWeight: '600',
        }}
      >
        TRUE
      </div>
      <div
        style={{
          position: 'absolute',
          right: '-50px',
          top: '65%',
          fontSize: '9px',
          color: '#ef4444',
          fontWeight: '600',
        }}
      >
        FALSE
      </div>
    </div>
  );
};