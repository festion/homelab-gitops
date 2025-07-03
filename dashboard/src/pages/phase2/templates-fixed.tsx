import React, { useState } from 'react';
import { FileText, Play, History, TrendingUp } from 'lucide-react';

const TemplatesFixed: React.FC = () => {
  const [templates, setTemplates] = useState<string[]>(['standard-devops']);
  const [repositories, setRepositories] = useState<string[]>(['homelab-gitops-auditor']);
  const [activeTab, setActiveTab] = useState<'wizard' | 'history' | 'compliance'>('wizard');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready');

  // Load data on demand instead of in useEffect
  const loadTemplates = () => {
    setLoading(true);
    setStatus('Loading templates...');
    
    fetch('/api/v2/templates')
      .then(response => response.json())
      .then(data => {
        if (data.templates && Array.isArray(data.templates)) {
          setTemplates(data.templates);
          setStatus(`Loaded ${data.templates.length} templates`);
        } else {
          setStatus('Templates loaded with default data');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Templates error:', error);
        setStatus(`Templates error: ${error.message}`);
        setLoading(false);
      });
  };

  const loadRepositories = () => {
    setLoading(true);
    setStatus('Loading repositories...');
    
    fetch('/audit')
      .then(response => response.json())
      .then(data => {
        if (data.repos && Array.isArray(data.repos)) {
          const repoNames = data.repos.map((r: any) => r.name).filter(Boolean);
          setRepositories(repoNames);
          setStatus(`Loaded ${repoNames.length} repositories`);
        } else {
          setStatus('Repositories loaded with default data');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Repositories error:', error);
        setStatus(`Repositories error: ${error.message}`);
        setLoading(false);
      });
  };

  const handleApplyTemplate = (template: string, repos: string[], options: any) => {
    setLoading(true);
    setStatus('Applying template...');
    
    fetch('/api/v2/templates/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateName: template,
        repositories: repos,
        dryRun: options.dryRun || true,
        options: options
      })
    })
      .then(response => response.json())
      .then(data => {
        setStatus(`Template applied successfully: ${JSON.stringify(data)}`);
        setLoading(false);
      })
      .catch(error => {
        console.error('Apply error:', error);
        setStatus(`Apply error: ${error.message}`);
        setLoading(false);
      });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Template Management</h1>
      <p className="text-gray-600 mb-6">Manage and deploy DevOps templates across your repositories</p>

      {/* Data Loading Controls */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Data Controls</h2>
        <div className="space-x-2 mb-4">
          <button
            onClick={loadTemplates}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Load Templates
          </button>
          <button
            onClick={loadRepositories}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Load Repositories
          </button>
        </div>
        <div className="p-3 bg-white rounded border">
          <strong>Status:</strong> {status}
        </div>
      </div>

      {/* Tab Navigation */}
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

      {/* Content */}
      {activeTab === 'wizard' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} />
              Available Templates ({templates.length})
            </h2>
            <div className="grid gap-4">
              {templates.map(template => (
                <div key={template} className="border border-blue-200 rounded p-4 bg-white">
                  <h3 className="font-medium">{template}</h3>
                  <p className="text-sm text-gray-600">DevOps template with CI/CD, MCP integration</p>
                  <button
                    onClick={() => handleApplyTemplate(template, repositories.slice(0, 2), { dryRun: true })}
                    disabled={loading}
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    Apply Template (Dry Run)
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Target Repositories ({repositories.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {repositories.map(repo => (
                <div key={repo} className="flex items-center gap-2 p-2 bg-white rounded border">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">{repo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Template Application History</h2>
          <p>Template application history will appear here.</p>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Template Compliance Report</h2>
          <p>Repository compliance status will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default TemplatesFixed;