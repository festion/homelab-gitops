import React from 'react';

const TemplatesTestApi: React.FC = () => {
  const [status, setStatus] = React.useState('Ready');

  const testTemplatesAPI = () => {
    setStatus('Testing templates API...');
    fetch('/api/v2/templates')
      .then(response => response.json())
      .then(data => setStatus(`Templates API OK: ${JSON.stringify(data)}`))
      .catch(error => setStatus(`Templates API Error: ${error.message}`));
  };

  const testAuditAPI = () => {
    setStatus('Testing audit API...');
    fetch('/audit')
      .then(response => response.json())
      .then(data => setStatus(`Audit API OK: ${JSON.stringify(data)}`))
      .catch(error => setStatus(`Audit API Error: ${error.message}`));
  };

  const testApplyAPI = () => {
    setStatus('Testing apply API...');
    fetch('/api/v2/templates/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateName: 'test', repositories: ['test'], dryRun: true })
    })
      .then(response => response.json())
      .then(data => setStatus(`Apply API OK: ${JSON.stringify(data)}`))
      .catch(error => setStatus(`Apply API Error: ${error.message}`));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>API Test Page</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testTemplatesAPI} style={{ margin: '5px', padding: '10px' }}>
          Test Templates API
        </button>
        <button onClick={testAuditAPI} style={{ margin: '5px', padding: '10px' }}>
          Test Audit API
        </button>
        <button onClick={testApplyAPI} style={{ margin: '5px', padding: '10px' }}>
          Test Apply API
        </button>
      </div>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
        <strong>Status:</strong> {status}
      </div>
    </div>
  );
};

export default TemplatesTestApi;