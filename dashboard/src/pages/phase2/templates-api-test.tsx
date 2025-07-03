import React, { useState, useEffect } from 'react';
import { FileText, Play, History, TrendingUp } from 'lucide-react';

const TemplatesApiTest: React.FC = () => {
  const [templates, setTemplates] = useState<string[]>([]);
  const [repositories, setRepositories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'wizard' | 'history' | 'compliance'>('wizard');
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<string>('Starting...');

  useEffect(() => {
    console.log('TemplatesApiTest: Starting API calls');
    setApiStatus('Making API calls...');
    
    // Test the exact same API calls as the full component
    Promise.all([
      fetch('/api/v2/templates').then(r => r.json()).catch(() => ({ templates: ['standard-devops'] })),
      fetch('/audit').then(r => r.json()).catch(() => ({ repos: [] }))
    ]).then(([templatesData, auditData]) => {
      console.log('API Response - Templates:', templatesData);
      console.log('API Response - Audit:', auditData);
      
      setTemplates(templatesData.templates || ['standard-devops']);
      setRepositories(auditData.repos?.map((r: any) => r.name) || []);
      setLoading(false);
      setApiStatus('API calls completed successfully');
    }).catch((error) => {
      console.error('Failed to load templates data:', error);
      setTemplates(['standard-devops']);
      setRepositories([]);
      setLoading(false);
      setApiStatus(`API error: ${error.message}`);
    });
  }, []);

  const handleApplyTemplate = async (template: string, repos: string[], options: any) => {
    console.log('Testing template apply API call');
    setApiStatus('Testing apply API...');
    
    try {
      const response = await fetch('/api/v2/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: template,
          repositories: repos,
          dryRun: options.dryRun,
          options: options
        })
      });
      
      const result = await response.json();
      console.log('Apply API result:', result);
      setApiStatus(`Apply API successful: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Apply API error:', error);
      setApiStatus(`Apply API error: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Templates API Test - Loading...</h1>
        <p>{apiStatus}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Templates API Test</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h2 className="font-bold mb-2">API Status:</h2>
        <p>{apiStatus}</p>
      </div>

      {/* Tab Navigation - same as full component */}
      <div className="flex border-b mb-6">
        {[
          { key: 'wizard', label: 'Template Wizard', icon: <Play size={18} /> },
          { key: 'history', label: 'Application History', icon: <History size={18} /> },
          { key: 'compliance', label: 'Compliance Report', icon: <TrendingUp size={18} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
              activeTab === tab.key 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-bold mb-2">Templates from API: {templates.length}</h3>
          <ul>
            {templates.map(template => (
              <li key={template}>• {template}</li>
            ))}
          </ul>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded">
          <h3 className="font-bold mb-2">Repositories from API: {repositories.length}</h3>
          <ul>
            {repositories.slice(0, 5).map(repo => (
              <li key={repo}>• {repo}</li>
            ))}
          </ul>
          {repositories.length > 5 && <p>... and {repositories.length - 5} more</p>}
        </div>

        <div className="bg-purple-50 p-4 rounded">
          <h3 className="font-bold mb-2">Test Template Apply API</h3>
          <button
            onClick={() => handleApplyTemplate('standard-devops', ['test-repo'], { dryRun: true })}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Apply API Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatesApiTest;