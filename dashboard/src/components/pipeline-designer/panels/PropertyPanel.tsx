/**
 * Property Panel Component for Pipeline Designer
 * Allows editing of selected node properties
 */

import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { Settings, Trash2, Save } from 'lucide-react';

interface PropertyPanelProps {
  node: Node;
  onNodeUpdate: (nodeId: string, newData: any) => void;
  onNodeDelete: () => void;
  className?: string;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  node,
  onNodeUpdate,
  onNodeDelete,
  className = ''
}) => {
  const [formData, setFormData] = useState(node.data);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(node.data);
    setHasChanges(false);
  }, [node]);

  const handleInputChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    setHasChanges(true);
  };

  const handleSave = () => {
    onNodeUpdate(node.id, formData);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData(node.data);
    setHasChanges(false);
  };

  const renderFieldsByNodeType = () => {
    switch (node.type) {
      case 'start':
        return (
          <>
            <div className="form-group">
              <label>Trigger Type</label>
              <select
                value={formData.trigger || 'manual'}
                onChange={(e) => handleInputChange('trigger', e.target.value)}
              >
                <option value="manual">Manual</option>
                <option value="webhook">Webhook</option>
                <option value="schedule">Schedule</option>
                <option value="push">Push</option>
                <option value="pr">Pull Request</option>
              </select>
            </div>
            
            {formData.trigger === 'schedule' && (
              <div className="form-group">
                <label>Schedule (Cron)</label>
                <input
                  type="text"
                  value={formData.schedule || ''}
                  onChange={(e) => handleInputChange('schedule', e.target.value)}
                  placeholder="0 0 * * *"
                />
              </div>
            )}
            
            {(formData.trigger === 'push' || formData.trigger === 'pr') && (
              <div className="form-group">
                <label>Branches</label>
                <input
                  type="text"
                  value={(formData.branches || []).join(', ')}
                  onChange={(e) => handleInputChange('branches', e.target.value.split(',').map(b => b.trim()))}
                  placeholder="main, develop"
                />
              </div>
            )}
          </>
        );
        
      case 'command':
        return (
          <>
            <div className="form-group">
              <label>Command</label>
              <textarea
                value={formData.command || ''}
                onChange={(e) => handleInputChange('command', e.target.value)}
                placeholder="echo 'Hello World'"
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label>Working Directory</label>
              <input
                type="text"
                value={formData.workingDirectory || ''}
                onChange={(e) => handleInputChange('workingDirectory', e.target.value)}
                placeholder="/app"
              />
            </div>
            
            <div className="form-group">
              <label>Timeout (seconds)</label>
              <input
                type="number"
                value={formData.timeout || 300}
                onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
              />
            </div>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.continueOnError || false}
                  onChange={(e) => handleInputChange('continueOnError', e.target.checked)}
                />
                Continue on error
              </label>
            </div>
          </>
        );
        
      case 'script':
        return (
          <>
            <div className="form-group">
              <label>Script Type</label>
              <select
                value={formData.scriptType || 'bash'}
                onChange={(e) => handleInputChange('scriptType', e.target.value)}
              >
                <option value="bash">Bash</option>
                <option value="sh">Shell</option>
                <option value="python">Python</option>
                <option value="node">Node.js</option>
                <option value="powershell">PowerShell</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Script Content</label>
              <textarea
                value={formData.script || ''}
                onChange={(e) => handleInputChange('script', e.target.value)}
                placeholder="#!/bin/bash\necho 'Hello World'"
                rows={8}
                style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: '12px' }}
              />
            </div>
            
            <div className="form-group">
              <label>Working Directory</label>
              <input
                type="text"
                value={formData.workingDirectory || ''}
                onChange={(e) => handleInputChange('workingDirectory', e.target.value)}
                placeholder="/app"
              />
            </div>
          </>
        );
        
      case 'docker':
        return (
          <>
            <div className="form-group">
              <label>Docker Image</label>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="ubuntu:latest"
              />
            </div>
            
            <div className="form-group">
              <label>Command</label>
              <input
                type="text"
                value={formData.command || ''}
                onChange={(e) => handleInputChange('command', e.target.value)}
                placeholder="echo 'Hello World'"
              />
            </div>
            
            <div className="form-group">
              <label>Volumes</label>
              <textarea
                value={(formData.volumes || []).join('\n')}
                onChange={(e) => handleInputChange('volumes', e.target.value.split('\n').filter(v => v.trim()))}
                placeholder="/host/path:/container/path"
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label>Pull Policy</label>
              <select
                value={formData.pull || 'missing'}
                onChange={(e) => handleInputChange('pull', e.target.value)}
              >
                <option value="always">Always</option>
                <option value="missing">If Missing</option>
                <option value="never">Never</option>
              </select>
            </div>
          </>
        );
        
      case 'test':
        return (
          <>
            <div className="form-group">
              <label>Test Framework</label>
              <select
                value={formData.framework || 'jest'}
                onChange={(e) => handleInputChange('framework', e.target.value)}
              >
                <option value="jest">Jest</option>
                <option value="mocha">Mocha</option>
                <option value="pytest">PyTest</option>
                <option value="junit">JUnit</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Test Command</label>
              <input
                type="text"
                value={formData.testCommand || ''}
                onChange={(e) => handleInputChange('testCommand', e.target.value)}
                placeholder="npm test"
              />
            </div>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.coverage || false}
                  onChange={(e) => handleInputChange('coverage', e.target.checked)}
                />
                Enable coverage
              </label>
            </div>
            
            {formData.coverage && (
              <div className="form-group">
                <label>Coverage Threshold (%)</label>
                <input
                  type="number"
                  value={formData.coverageThreshold || 80}
                  onChange={(e) => handleInputChange('coverageThreshold', parseInt(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
            )}
          </>
        );
        
      case 'deploy':
        return (
          <>
            <div className="form-group">
              <label>Deploy Type</label>
              <select
                value={formData.deployType || 'custom'}
                onChange={(e) => handleInputChange('deployType', e.target.value)}
              >
                <option value="kubernetes">Kubernetes</option>
                <option value="docker">Docker</option>
                <option value="heroku">Heroku</option>
                <option value="aws">AWS</option>
                <option value="azure">Azure</option>
                <option value="gcp">Google Cloud</option>
                <option value="github-pages">GitHub Pages</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Target</label>
              <input
                type="text"
                value={formData.target || ''}
                onChange={(e) => handleInputChange('target', e.target.value)}
                placeholder="production-cluster"
              />
            </div>
            
            <div className="form-group">
              <label>Environment</label>
              <select
                value={formData.environment || 'production'}
                onChange={(e) => handleInputChange('environment', e.target.value)}
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
                <option value="test">Test</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Strategy</label>
              <select
                value={formData.strategy || 'rolling'}
                onChange={(e) => handleInputChange('strategy', e.target.value)}
              >
                <option value="rolling">Rolling</option>
                <option value="blue-green">Blue-Green</option>
                <option value="canary">Canary</option>
                <option value="recreate">Recreate</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.approvalRequired || false}
                  onChange={(e) => handleInputChange('approvalRequired', e.target.checked)}
                />
                Require approval
              </label>
            </div>
          </>
        );
        
      default:
        return (
          <div className="form-group">
            <label>Label</label>
            <input
              type="text"
              value={formData.label || ''}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="Node label"
            />
          </div>
        );
    }
  };

  return (
    <div className={`property-panel ${className}`} style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <Settings size={16} style={{ marginRight: '8px', color: '#6b7280' }} />
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          Node Properties
        </h3>
      </div>

      {/* Node Info */}
      <div style={{ 
        marginBottom: '16px',
        padding: '8px',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        fontSize: '12px'
      }}>
        <div><strong>Type:</strong> {node.type}</div>
        <div><strong>ID:</strong> {node.id}</div>
      </div>

      {/* Basic Properties */}
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '4px', 
          fontSize: '12px', 
          fontWeight: '600',
          color: '#374151'
        }}>
          Label
        </label>
        <input
          type="text"
          value={formData.label || ''}
          onChange={(e) => handleInputChange('label', e.target.value)}
          placeholder="Node label"
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Type-specific Properties */}
      <div style={{ marginBottom: '16px' }}>
        {renderFieldsByNodeType()}
      </div>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        paddingTop: '16px',
        borderTop: '1px solid #e2e8f0'
      }}>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: hasChanges ? '#3b82f6' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <Save size={12} />
          Save
        </button>
        
        {hasChanges && (
          <button
            onClick={handleReset}
            style={{
              padding: '8px 12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        )}
        
        <button
          onClick={onNodeDelete}
          style={{
            padding: '8px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      <style>{`
        .form-group {
          margin-bottom: 12px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 4px;
          fontSize: 12px;
          font-weight: 600;
          color: #374151;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        
        .form-group input[type="checkbox"] {
          width: auto;
          margin-right: 6px;
        }
        
        .form-group textarea {
          resize: vertical;
          min-height: 60px;
        }
      `}</style>
    </div>
  );
};