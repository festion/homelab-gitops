/**
 * Validation Panel Component for Pipeline Designer
 * Shows validation results and issues
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { ValidationResult } from '../../../types/pipeline';

interface ValidationPanelProps {
  validation: ValidationResult;
  onClose: () => void;
  className?: string;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validation,
  onClose,
  className = ''
}) => {
  const getValidationIcon = () => {
    if (validation.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (validation.errors.length > 0) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    return <Info className="w-4 h-4 text-yellow-500" />;
  };

  const getValidationColor = () => {
    if (validation.isValid) return '#10b981';
    if (validation.errors.length > 0) return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div
      className={`validation-panel ${className}`}
      style={{
        backgroundColor: 'white',
        border: `1px solid ${getValidationColor()}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '300px',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getValidationIcon()}
          <h4 style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Pipeline Validation
          </h4>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: '#6b7280'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Status */}
      <div style={{
        padding: '8px',
        backgroundColor: validation.isValid ? '#dcfce7' : '#fee2e2',
        borderRadius: '4px',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: validation.isValid ? '#166534' : '#991b1b'
        }}>
          {validation.isValid ? '✅ Valid Pipeline' : '❌ Invalid Pipeline'}
        </div>
      </div>

      {/* Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '6px',
          backgroundColor: '#fee2e2',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626' }}>
            {validation.errors.length}
          </div>
          <div style={{ fontSize: '10px', color: '#7f1d1d' }}>Errors</div>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '6px',
          backgroundColor: '#fef3c7',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#d97706' }}>
            {validation.warnings.length}
          </div>
          <div style={{ fontSize: '10px', color: '#92400e' }}>Warnings</div>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '6px',
          backgroundColor: '#dbeafe',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>
            {validation.info.length}
          </div>
          <div style={{ fontSize: '10px', color: '#1e40af' }}>Info</div>
        </div>
      </div>

      {/* Issues */}
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {/* Errors */}
        {validation.errors.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <h5 style={{
              margin: '0 0 4px 0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#dc2626'
            }}>
              Errors
            </h5>
            {validation.errors.map((error, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 6px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '3px',
                  marginBottom: '2px',
                  fontSize: '11px',
                  color: '#7f1d1d'
                }}
              >
                ❌ {error}
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <h5 style={{
              margin: '0 0 4px 0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#d97706'
            }}>
              Warnings
            </h5>
            {validation.warnings.map((warning, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 6px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fed7aa',
                  borderRadius: '3px',
                  marginBottom: '2px',
                  fontSize: '11px',
                  color: '#92400e'
                }}
              >
                ⚠️ {warning}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        {validation.info.length > 0 && (
          <div>
            <h5 style={{
              margin: '0 0 4px 0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#2563eb'
            }}>
              Information
            </h5>
            {validation.info.map((info, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 6px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '3px',
                  marginBottom: '2px',
                  fontSize: '11px',
                  color: '#1e40af'
                }}
              >
                ℹ️ {info}
              </div>
            ))}
          </div>
        )}

        {/* No issues */}
        {validation.errors.length === 0 && validation.warnings.length === 0 && validation.info.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '16px',
            color: '#6b7280',
            fontSize: '12px'
          }}>
            No validation issues found
          </div>
        )}
      </div>
    </div>
  );
};