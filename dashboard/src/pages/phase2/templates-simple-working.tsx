import React from 'react';

const TemplatesSimpleWorking = () => {
  const [status, setStatus] = React.useState('Ready to load data');
  const [templates, setTemplates] = React.useState([{name: 'standard-devops', description: 'Default template'}]);
  const [repos, setRepos] = React.useState(['homelab-gitops-auditor']);

  const loadTemplates = () => {
    setStatus('Loading templates...');
    fetch('/api/v2/templates')
      .then(r => r.json())
      .then(data => {
        console.log('Templates API response:', data);
        if (data.templates && Array.isArray(data.templates)) {
          // Store full template objects
          setTemplates(data.templates);
          setStatus(`Templates loaded successfully: ${data.templates.length} templates`);
        } else {
          setTemplates([{name: 'standard-devops', description: 'Default template'}]);
          setStatus('Templates loaded with default data');
        }
      })
      .catch(e => setStatus('Templates error: ' + e.message));
  };

  const loadRepos = () => {
    setStatus('Loading repositories...');
    fetch('/audit')
      .then(r => r.json())
      .then(data => {
        const repoNames = data.repos?.map((r: any) => r.name) || ['homelab-gitops-auditor'];
        setRepos(repoNames);
        setStatus('Repositories loaded successfully');
      })
      .catch(e => setStatus('Repos error: ' + e.message));
  };

  const applyTemplate = (templateName: string) => {
    setStatus(`Applying template "${templateName}"...`);
    fetch('/api/v2/templates/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateName: templateName,
        repositories: repos.slice(0, 3), // Apply to first 3 repos
        dryRun: true,
        options: { createBackup: true }
      })
    })
      .then(r => r.json())
      .then(data => {
        console.log('Apply result:', data);
        setStatus(`Template "${templateName}" applied successfully (dry run)`);
      })
      .catch(e => setStatus('Apply error: ' + e.message));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Template Management</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0' }}>
        <h3>Data Loading</h3>
        <button onClick={loadTemplates} style={{ margin: '5px', padding: '8px' }}>
          Load Templates
        </button>
        <button onClick={loadRepos} style={{ margin: '5px', padding: '8px' }}>
          Load Repositories  
        </button>
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'white' }}>
          <strong>Status:</strong> {status}
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e6f3ff' }}>
        <h3>Templates ({templates.length})</h3>
        {templates.map(template => (
          <div key={template.name} style={{ margin: '10px 0', padding: '10px', backgroundColor: 'white', border: '1px solid #ccc' }}>
            <h4>{template.name}</h4>
            <p>{template.description || 'DevOps template with CI/CD pipeline'}</p>
            <button 
              style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px' }}
              onClick={() => applyTemplate(template.name)}
            >
              Apply Template
            </button>
          </div>
        ))}
      </div>

      <div style={{ padding: '15px', backgroundColor: '#e6ffe6' }}>
        <h3>Repositories ({repos.length})</h3>
        {repos.slice(0, 10).map(repo => (
          <div key={repo} style={{ margin: '5px 0', padding: '5px', backgroundColor: 'white' }}>
            • {repo}
          </div>
        ))}
        {repos.length > 10 && <p>... and {repos.length - 10} more</p>}
      </div>
    </div>
  );
};

export default TemplatesSimpleWorking;