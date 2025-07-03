import React, { useState, useEffect } from 'react';
import { FileText, Play, History, TrendingUp } from 'lucide-react';

const TemplatesNoFetch: React.FC = () => {
  const [templates, setTemplates] = useState<string[]>([]);
  const [repositories, setRepositories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'wizard' | 'history' | 'compliance'>('wizard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No fetch calls - just set static data
    console.log('TemplatesNoFetch: Setting static data');
    
    // Simulate the same structure as the API response
    setTemplates(['standard-devops', 'basic-project', 'microservice']);
    setRepositories(['homelab-gitops-auditor', 'home-assistant-config', 'test-repo']);
    setLoading(false);
    
    console.log('TemplatesNoFetch: Static data set successfully');
  }, []);

  const handleApplyTemplate = async (template: string, repos: string[], options: any) => {
    // No API call - just log
    console.log('Template apply called:', { template, repos, options });
    alert(`Would apply template "${template}" to ${repos.length} repositories`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Templates (No Fetch) - Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Template Management (No API Calls)</h1>
      <p className="text-gray-600 mb-6">Manage and deploy DevOps templates across your repositories</p>

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
              Available Templates
            </h2>
            <div className="grid gap-4">
              {templates.map(template => (
                <div key={template} className="border border-blue-200 rounded p-4 bg-white">
                  <h3 className="font-medium">{template}</h3>
                  <p className="text-sm text-gray-600">DevOps template for {template} projects</p>
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
          <p>No template applications yet.</p>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Template Compliance Report</h2>
          <p>All repositories are compliant with current template standards.</p>
        </div>
      )}
    </div>
  );
};

export default TemplatesNoFetch;