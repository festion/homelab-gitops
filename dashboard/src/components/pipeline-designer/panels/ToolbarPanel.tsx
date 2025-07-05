/**
 * Toolbar Panel Component for Pipeline Designer
 * Provides quick actions and view controls
 */

import React from 'react';
import { Save, Layout, CheckCircle, Grid, Map, Eye, EyeOff } from 'lucide-react';

interface ToolbarPanelProps {
  onExport: () => void;
  onAutoLayout: () => void;
  onValidate: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showMiniMap: boolean;
  onToggleMiniMap: () => void;
  readOnly: boolean;
  className?: string;
}

export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  onExport,
  onAutoLayout,
  onValidate,
  showGrid,
  onToggleGrid,
  showMiniMap,
  onToggleMiniMap,
  readOnly,
  className = ''
}) => {
  return (
    <div
      className={`toolbar-panel ${className}`}
      style={{
        display: 'flex',
        gap: '8px',
        padding: '8px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}
    >
      {/* Export Button */}
      <button
        onClick={onExport}
        title="Export Pipeline (Ctrl+S)"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 8px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#3b82f6';
        }}
      >
        <Save size={14} />
        Export
      </button>

      {/* Auto Layout Button */}
      {!readOnly && (
        <button
          onClick={onAutoLayout}
          title="Auto Layout (Ctrl+L)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 8px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#059669';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
          }}
        >
          <Layout size={14} />
          Layout
        </button>
      )}

      {/* Validate Button */}
      <button
        onClick={onValidate}
        title="Validate Pipeline"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 8px',
          backgroundColor: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#7c3aed';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#8b5cf6';
        }}
      >
        <CheckCircle size={14} />
        Validate
      </button>

      {/* Separator */}
      <div
        style={{
          width: '1px',
          height: '24px',
          backgroundColor: '#e2e8f0',
          margin: '0 4px'
        }}
      />

      {/* Grid Toggle */}
      <button
        onClick={onToggleGrid}
        title={showGrid ? 'Hide Grid' : 'Show Grid'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '28px',
          backgroundColor: showGrid ? '#f3f4f6' : 'transparent',
          color: showGrid ? '#374151' : '#6b7280',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.color = '#374151';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = showGrid ? '#f3f4f6' : 'transparent';
          e.currentTarget.style.color = showGrid ? '#374151' : '#6b7280';
        }}
      >
        <Grid size={14} />
      </button>

      {/* MiniMap Toggle */}
      <button
        onClick={onToggleMiniMap}
        title={showMiniMap ? 'Hide MiniMap' : 'Show MiniMap'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '28px',
          backgroundColor: showMiniMap ? '#f3f4f6' : 'transparent',
          color: showMiniMap ? '#374151' : '#6b7280',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.color = '#374151';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = showMiniMap ? '#f3f4f6' : 'transparent';
          e.currentTarget.style.color = showMiniMap ? '#374151' : '#6b7280';
        }}
      >
        <Map size={14} />
      </button>

      {/* Read-only Indicator */}
      {readOnly && (
        <>
          <div
            style={{
              width: '1px',
              height: '24px',
              backgroundColor: '#e2e8f0',
              margin: '0 4px'
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 8px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fed7aa',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <EyeOff size={14} />
            Read Only
          </div>
        </>
      )}
    </div>
  );
};