import React, { useState, useEffect } from 'react';

const TemplatesMinimal: React.FC = () => {
  const [status, setStatus] = useState('Starting...');

  useEffect(() => {
    console.log('TemplatesMinimal: useEffect starting');
    setStatus('useEffect called');
    
    // Test just one simple API call
    fetch('/api/v2/templates')
      .then(response => {
        console.log('Response status:', response.status);
        setStatus(`Response received: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('Data received:', data);
        setStatus(`Success: ${JSON.stringify(data)}`);
      })
      .catch(error => {
        console.error('Error:', error);
        setStatus(`Error: ${error.message}`);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Templates Minimal Test</h1>
      <div className="bg-blue-50 p-4 rounded">
        <p>Status: {status}</p>
      </div>
    </div>
  );
};

export default TemplatesMinimal;