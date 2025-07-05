/**
 * Parallel Node Component for Pipeline Designer
 * Represents a parallel execution step
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ParallelNodeData {
  label: string;
  branches: string[];
  strategy: 'all' | 'any' | 'majority' | 'first';
  maxConcurrency?: number;
  failFast?: boolean;
  timeout?: number;
  status?: 'idle' | 'running' | 'success' | 'failed' | 'partial';
  branchStatus?: Record<string, 'idle' | 'running' | 'success' | 'failed'>;
}

export const ParallelNode: React.FC<NodeProps<ParallelNodeData>> = ({ data, selected }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return '#3b82f6'; // blue
      case 'success':
        return '#10b981'; // green
      case 'failed':
        return '#ef4444'; // red
      case 'partial':
        return '#f59e0b'; // amber
      default:
        return '#8b5cf6'; // purple (default for parallel)
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <Clock className="w-3 h-3" />;
      case 'success':
        return <CheckCircle className="w-3 h-3" />;
      case 'failed':
        return <XCircle className="w-3 h-3" />;
      case 'partial':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const getStrategyColor = () => {
    switch (data.strategy) {
      case 'all':
        return '#10b981';
      case 'any':
        return '#f59e0b';
      case 'majority':
        return '#3b82f6';
      case 'first':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStrategyIcon = () => {
    switch (data.strategy) {
      case 'all':
        return '💯';
      case 'any':
        return '🎯';
      case 'majority':
        return '🗳️';
      case 'first':
        return '🏃';
      default:
        return '⚡';
    }
  };

  const getBranchStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return '🔄';
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏸️';
    }
  };

  const getBranchStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#3b82f6';
      case 'success':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getCompletedBranches = () => {
    if (!data.branchStatus) return 0;
    return Object.values(data.branchStatus).filter(status => 
      status === 'success' || status === 'failed'
    ).length;
  };

  const getSuccessfulBranches = () => {
    if (!data.branchStatus) return 0;
    return Object.values(data.branchStatus).filter(status => status === 'success').length;
  };

  return (
    <div
      className={`pipeline-node parallel-node ${selected ? 'selected' : ''}`}
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
          className="strategy-badge"
          style={{
            backgroundColor: getStrategyColor(),
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
          <span>{getStrategyIcon()}</span>
          {data.strategy}
        </div>
      </div>

      {/* Progress */}
      {data.branchStatus && (
        <div className="progress-bar" style={{ marginBottom: '8px' }}>
          <div
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              height: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                backgroundColor: getStatusColor(),
                height: '100%',
                width: `${(getCompletedBranches() / data.branches.length) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', textAlign: 'center' }}>
            {getCompletedBranches()}/{data.branches.length} completed
            {getSuccessfulBranches() > 0 && ` (${getSuccessfulBranches()} successful)`}
          </div>
        </div>
      )}

      {/* Branches */}
      <div className="node-content" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
        <div className="branches-list" style={{ maxHeight: '120px', overflowY: 'auto' }}>
          {data.branches.map((branch, index) => {
            const branchStatus = data.branchStatus?.[branch] || 'idle';
            return (
              <div
                key={index}
                className="branch-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '3px 6px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  marginBottom: '3px',
                  fontSize: '11px',
                }}
              >
                <span style={{ marginRight: '6px', fontSize: '10px' }}>
                  {getBranchStatusIcon(branchStatus)}
                </span>
                <span style={{ flex: 1, color: '#1f2937' }}>{branch}</span>
                <span
                  style={{
                    color: getBranchStatusColor(branchStatus),
                    fontSize: '9px',
                    fontWeight: '600',
                  }}
                >
                  {branchStatus.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration */}
      <div className="node-config" style={{ fontSize: '11px', color: '#6b7280' }}>
        <div style={{ marginBottom: '2px' }}>
          <strong>Branches:</strong> {data.branches.length}
        </div>
        
        {data.maxConcurrency && (
          <div style={{ marginBottom: '2px' }}>
            <strong>Max concurrent:</strong> {data.maxConcurrency}
          </div>
        )}
        
        {data.timeout && (
          <div style={{ marginBottom: '2px' }}>
            <strong>Timeout:</strong> {data.timeout}s
          </div>
        )}
      </div>

      {/* Options */}
      <div className="node-options" style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px' }}>
        {data.failFast && (
          <span
            className="option-tag"
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '2px 6px',
              borderRadius: '10px',
              marginRight: '4px',
            }}
          >
            ⚡ Fail fast
          </span>
        )}
        
        {data.maxConcurrency && (
          <span
            className="option-tag"
            style={{
              backgroundColor: '#e0e7ff',
              color: '#3730a3',
              padding: '2px 6px',
              borderRadius: '10px',
              marginRight: '4px',
            }}
          >
            🔢 Max: {data.maxConcurrency}
          </span>
        )}
        
        <span
          className="option-tag"
          style={{
            backgroundColor: '#f0fdf4',
            color: '#166534',
            padding: '2px 6px',
            borderRadius: '10px',
          }}
        >
          {getStrategyIcon()} {data.strategy}
        </span>
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

      {/* Output Handles for each branch */}
      {data.branches.map((branch, index) => (
        <Handle
          key={branch}
          type="source"
          position={Position.Right}
          id={branch}
          style={{
            background: getBranchStatusColor(data.branchStatus?.[branch] || 'idle'),
            border: '2px solid white',
            width: '8px',
            height: '8px',
            top: `${30 + (index * (40 / Math.max(data.branches.length - 1, 1)))}%`,
          }}
        />
      ))}

      {/* Main output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          background: getStatusColor(),
          border: '2px solid white',
          width: '12px',
          height: '12px',
          top: '85%',
        }}
      />
    </div>
  );
};