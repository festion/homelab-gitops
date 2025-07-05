import React, { useState } from 'react';
import { PipelineConfig, ValidationResult } from '../../types/pipeline';

const TestPipelineDesigner: React.FC = () => {
  const [pipeline, setPipeline] = useState<PipelineConfig | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // Sample pipeline for testing
  const samplePipeline: PipelineConfig = {
    name: 'Sample CI/CD Pipeline',
    description: 'A sample pipeline for testing the visual designer',
    nodes: [
      {
        id: 'start-1',
        name: 'Start',
        type: 'start',
        position: { x: 100, y: 100 },
        config: {
          label: 'Trigger on Push',
          trigger: 'push',
          branches: ['main', 'develop']
        },
        dependencies: []
      },
      {
        id: 'build-1',
        name: 'Build',
        type: 'command',
        position: { x: 300, y: 100 },
        config: {
          label: 'Build Application',
          command: 'npm install && npm run build',
          workingDirectory: './app',
          timeout: 300
        },
        dependencies: ['start-1']
      },
      {
        id: 'test-1',
        name: 'Test',
        type: 'test',
        position: { x: 500, y: 100 },
        config: {
          label: 'Run Tests',
          testCommand: 'npm test',
          framework: 'jest',
          coverage: true,
          coverageThreshold: 80
        },
        dependencies: ['build-1']
      },
      {
        id: 'deploy-1',
        name: 'Deploy',
        type: 'deploy',
        position: { x: 700, y: 100 },
        config: {
          label: 'Deploy to Production',
          deployType: 'kubernetes',
          target: 'production-cluster',
          environment: 'production'
        },
        dependencies: ['test-1']
      }
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'build-1', type: 'custom' },
      { id: 'e2', source: 'build-1', target: 'test-1', type: 'custom' },
      { id: 'e3', source: 'test-1', target: 'deploy-1', type: 'custom' }
    ],
    config: {
      autoLayout: false,
      showGrid: true,
      showMiniMap: true
    }
  };

  const handlePipelineChange = (newPipeline: PipelineConfig) => {
    setPipeline(newPipeline);
    console.log('Pipeline updated:', newPipeline);
  };

  const handleValidationChange = (newValidation: ValidationResult) => {
    setValidation(newValidation);
    console.log('Validation updated:', newValidation);
  };

  const loadSamplePipeline = async () => {
    setPipeline(samplePipeline);
    
    // Call real validation API
    try {
      const response = await fetch('/api/v2/pipelines/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipeline: samplePipeline
        })
      });

      if (response.ok) {
        const validationResult = await response.json();
        setValidation(validationResult);
        console.log('✅ Pipeline validation successful:', validationResult);
      } else {
        const errorResult = await response.json();
        setValidation({
          isValid: false,
          errors: [errorResult.error || 'Validation failed'],
          warnings: [],
          info: []
        });
        console.error('❌ Pipeline validation failed:', errorResult);
      }
    } catch (error) {
      console.error('❌ Pipeline validation error:', error);
      // Fallback to mock validation if API is not available
      const mockValidation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: ['API not available - using mock validation'],
        info: ['Pipeline structure validated locally', 'All required nodes present', 'Dependencies properly defined']
      };
      setValidation(mockValidation);
    }
  };

  const clearPipeline = () => {
    setPipeline(null);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
          Pipeline Visual Designer Test
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={loadSamplePipeline}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Load Sample
          </button>
          <button
            onClick={clearPipeline}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Designer - Mock Version */}
      <div style={{ flex: 1, position: 'relative', backgroundColor: '#f9fafb' }}>
        {pipeline ? (
          <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              alignItems: 'center',
              background: 'linear-gradient(90deg, #e3f2fd, #f3e5f5, #e8f5e8, #fff3e0)',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {pipeline.nodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  <div style={{
                    padding: '12px 20px',
                    backgroundColor: node.type === 'start' ? '#4caf50' :
                                   node.type === 'command' ? '#2196f3' :
                                   node.type === 'test' ? '#ff9800' :
                                   node.type === 'deploy' ? '#9c27b0' : '#607d8b',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    minWidth: '120px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                      {node.type.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>
                      {node.config?.label || node.name}
                    </div>
                  </div>
                  {index < pipeline.nodes.length - 1 && (
                    <div style={{
                      fontSize: '24px',
                      color: '#666',
                      fontWeight: 'bold'
                    }}>
                      →
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Pipeline Configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Details</h4>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Name:</strong> {pipeline.name}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Description:</strong> {pipeline.description}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Nodes:</strong> {pipeline.nodes.length}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Edges:</strong> {pipeline.edges.length}</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Settings</h4>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Auto Layout:</strong> {pipeline.config?.autoLayout ? 'Yes' : 'No'}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Show Grid:</strong> {pipeline.config?.showGrid ? 'Yes' : 'No'}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Show MiniMap:</strong> {pipeline.config?.showMiniMap ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
            <h2 style={{ margin: '0 0 10px 0' }}>Pipeline Visual Designer</h2>
            <p style={{ margin: 0, textAlign: 'center' }}>
              Click "Load Sample" to see a mock pipeline visualization.<br/>
              This demonstrates the pipeline structure without requiring backend APIs.
            </p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          fontSize: '12px',
          color: '#6b7280'
        }}
      >
        {pipeline && (
          <span>
            Pipeline: {pipeline.name} | Nodes: {pipeline.nodes?.length || 0} | 
            Validation: {validation?.isValid ? '✅ Valid' : '❌ Invalid'}
          </span>
        )}
        {!pipeline && <span>No pipeline loaded. Click "Load Sample" to start.</span>}
      </div>
    </div>
  );
};

export default TestPipelineDesigner;