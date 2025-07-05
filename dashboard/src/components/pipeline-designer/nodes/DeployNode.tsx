/**
 * Deploy Node Component for Pipeline Designer
 * Represents a deployment step
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Rocket, AlertCircle, CheckCircle, Clock, Upload } from 'lucide-react';

interface DeployNodeData {
  label: string;
  deployType: 'kubernetes' | 'docker' | 'heroku' | 'aws' | 'azure' | 'gcp' | 'github-pages' | 'custom';
  target: string;
  environment: 'development' | 'staging' | 'production' | 'test';
  strategy?: 'rolling' | 'blue-green' | 'canary' | 'recreate';
  replicas?: number;
  healthCheck?: {
    enabled: boolean;
    path?: string;
    timeout?: number;
  };
  rollback?: boolean;
  approvalRequired?: boolean;
  notifications?: string[];
  status?: 'idle' | 'running' | 'success' | 'failed' | 'timeout' | 'pending-approval';
}

export const DeployNode: React.FC<NodeProps<DeployNodeData>> = ({ data, selected }) => {
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
      case 'pending-approval':
        return '#f59e0b'; // amber
      default:
        return '#ec4899'; // pink (default for deploy)
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
      case 'pending-approval':
        return <Upload className="w-3 h-3" />;
      default:
        return <Rocket className="w-3 h-3" />;
    }
  };

  const getEnvironmentColor = () => {
    switch (data.environment) {
      case 'production':
        return '#dc2626'; // red
      case 'staging':
        return '#f59e0b'; // amber
      case 'development':
        return '#10b981'; // green
      case 'test':
        return '#3b82f6'; // blue
      default:
        return '#6b7280'; // gray
    }
  };

  const getEnvironmentIcon = () => {
    switch (data.environment) {
      case 'production':
        return '🚀';
      case 'staging':
        return '🎭';
      case 'development':
        return '🛠️';
      case 'test':
        return '🧪';
      default:
        return '📦';
    }
  };

  const getDeployTypeColor = () => {
    switch (data.deployType) {
      case 'kubernetes':
        return '#326ce5';
      case 'docker':
        return '#0ea5e9';
      case 'heroku':
        return '#6762a6';
      case 'aws':
        return '#ff9900';
      case 'azure':
        return '#0078d4';
      case 'gcp':
        return '#4285f4';
      case 'github-pages':
        return '#24292e';
      default:
        return '#6b7280';
    }
  };

  const getDeployTypeIcon = () => {
    switch (data.deployType) {
      case 'kubernetes':
        return '☸️';
      case 'docker':
        return '🐳';
      case 'heroku':
        return '🟣';
      case 'aws':
        return '🟠';
      case 'azure':
        return '🔵';
      case 'gcp':
        return '🟡';
      case 'github-pages':
        return '📄';
      default:
        return '🚀';
    }
  };

  const getStrategyColor = () => {
    switch (data.strategy) {
      case 'rolling':
        return '#10b981';
      case 'blue-green':
        return '#3b82f6';
      case 'canary':
        return '#f59e0b';
      case 'recreate':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      className={`pipeline-node deploy-node ${selected ? 'selected' : ''}`}
      style={{
        background: '#ffffff',
        border: `2px solid ${selected ? '#3b82f6' : getStatusColor()}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '220px',
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
          className="environment-badge"
          style={{
            backgroundColor: getEnvironmentColor(),
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
          <span>{getEnvironmentIcon()}</span>
          {data.environment}
        </div>
      </div>

      {/* Deploy Info */}
      <div className="node-content" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
        {/* Platform and Target */}
        <div
          className="deploy-info"
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '6px 8px',
            marginBottom: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span
              style={{
                color: getDeployTypeColor(),
                fontSize: '12px',
                marginRight: '6px',
              }}
            >
              {getDeployTypeIcon()}
            </span>
            <span style={{ fontWeight: '600', fontSize: '11px' }}>
              {data.deployType}
            </span>
          </div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>
            <strong>Target:</strong> {data.target}
          </div>
        </div>

        {/* Deployment Details */}
        <div className="deploy-details" style={{ fontSize: '11px' }}>
          {data.strategy && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Strategy:</strong>{' '}
              <span style={{ color: getStrategyColor() }}>{data.strategy}</span>
            </div>
          )}
          
          {data.replicas && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Replicas:</strong> {data.replicas}
            </div>
          )}
          
          {data.healthCheck?.enabled && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Health Check:</strong> {data.healthCheck.path || 'enabled'}
            </div>
          )}
          
          {data.notifications && data.notifications.length > 0 && (
            <div style={{ marginBottom: '2px' }}>
              <strong>Notifications:</strong> {data.notifications.length}
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="node-options" style={{ fontSize: '10px', color: '#9ca3af' }}>
        {data.approvalRequired && (
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
            🔐 Approval Required
          </span>
        )}
        
        {data.rollback && (
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
            ⏪ Rollback enabled
          </span>
        )}
        
        {data.healthCheck?.enabled && (
          <span
            className="option-tag"
            style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              padding: '2px 6px',
              borderRadius: '10px',
              marginRight: '4px',
            }}
          >
            💚 Health check
          </span>
        )}
        
        {data.strategy && (
          <span
            className="option-tag"
            style={{
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              padding: '2px 6px',
              borderRadius: '10px',
            }}
          >
            📋 {data.strategy}
          </span>
        )}
      </div>

      {/* Approval Warning */}
      {data.status === 'pending-approval' && (
        <div
          className="approval-warning"
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '4px',
            padding: '6px 8px',
            marginTop: '8px',
            fontSize: '10px',
            color: '#92400e',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          ⏳ Pending approval for {data.environment} deployment
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