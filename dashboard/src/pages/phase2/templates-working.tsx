import React, { useState, useEffect } from 'react';
import { FileText, Play, History, TrendingUp } from 'lucide-react';

const TemplatesWorking: React.FC = () => {
  const [templates, setTemplates] = useState<string[]>(['standard-devops']);
  const [repositories, setRepositories] = useState<string[]>(['homelab-gitops-auditor']);
  const [activeTab, setActiveTab] = useState<'wizard' | 'history' | 'compliance'>('wizard');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>('Ready to test APIs');

  // Test API calls individually with proper error handling
  const testTemplatesAPI = async () => {
    try {
      setApiStatus('Testing /api/v2/templates...');
      const response = await fetch('/api/v2/templates');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Templates API success:', data);
      
      if (data.templates && Array.isArray(data.templates)) {
        setTemplates(data.templates);
        setApiStatus(`✅ Templates API success: ${data.templates.length} templates found`);
      } else {
        setApiStatus('⚠️ Templates API returned unexpected format');
      }
    } catch (error) {
      console.error('Templates API error:', error);
      setApiStatus(`❌ Templates API failed: ${error}`);
    }
  };

  const testAuditAPI = async () => {
    try {
      setApiStatus('Testing /audit...');
      const response = await fetch('/audit');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Audit API success:', data);
      
      if (data.repos && Array.isArray(data.repos)) {
        const repoNames = data.repos.map((r: any) => r.name).filter(Boolean);
        setRepositories(repoNames);
        setApiStatus(`✅ Audit API success: ${repoNames.length} repositories found`);
      } else {
        setApiStatus('⚠️ Audit API returned unexpected format');
      }
    } catch (error) {
      console.error('Audit API error:', error);
      setApiStatus(`❌ Audit API failed: ${error}`);
    }
  };

  const testApplyAPI = async () => {
    try {
      setApiStatus('Testing /api/v2/templates/apply...');
      const response = await fetch('/api/v2/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: 'standard-devops',
          repositories: ['test-repo'],
          dryRun: true,
          options: { createBackup: true }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Apply API success:', data);
      setApiStatus(`✅ Apply API success: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error('Apply API error:', error);
      setApiStatus(`❌ Apply API failed: ${error}`);
    }
  };

  const handleApplyTemplate = async (template: string, repos: string[], options: any) => {
    console.log('Apply template called:', { template, repos, options });
    await testApplyAPI();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Templates - Working Version</h1>
      <p className="text-gray-600 mb-6">Test API integration step by step</p>

      {/* API Testing Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">API Testing</h2>
        <div className="space-x-2 mb-4">
          <button
            onClick={testTemplatesAPI}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Templates API
          </button>
          <button
            onClick={testAuditAPI}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Audit API
          </button>
          <button
            onClick={testApplyAPI}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Test Apply API
          </button>
        </div>
        <div className="p-3 bg-white rounded border">
          <strong>Status:</strong> {apiStatus}
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
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Apply Template
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

export default TemplatesWorking;