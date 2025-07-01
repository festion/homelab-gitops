import React, { useState, useEffect } from 'react';
import { TemplateWizard } from '../../components/phase2/TemplateWizard';
import { FileText, Play, History, TrendingUp } from 'lucide-react';

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<string[]>([]);
  const [repositories, setRepositories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'wizard' | 'history' | 'compliance'>('wizard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch templates and repositories
    Promise.all([
      fetch('/api/templates').then(r => r.json()),
      fetch('/api/audit').then(r => r.json())
    ]).then(([templatesData, auditData]) => {
      setTemplates(templatesData.templates || ['standard-devops']);
      setRepositories(auditData.repositories?.map((r: any) => r.name) || []);
      setLoading(false);
    });
  }, []);

  const handleApplyTemplate = async (template: string, repos: string[], options: any) => {
    const response = await fetch('/api/templates/batch-apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateName: template,
        repositories: repos,
        dryRun: options.dryRun,
        options: options
      })
    });
    
    if (response.ok) {
      // Handle success
      console.log('Template applied successfully');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Template Management</h1>
        <p className="text-gray-600">Apply standardized templates across your repositories</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`px-4 py-2 rounded-t-lg flex items-center ${
            activeTab === 'wizard' ? 'bg-white text-blue-600 shadow' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Play size={16} className="mr-2" />
          Apply Templates
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-t-lg flex items-center ${
            activeTab === 'history' ? 'bg-white text-blue-600 shadow' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <History size={16} className="mr-2" />
          History
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-t-lg flex items-center ${
            activeTab === 'compliance' ? 'bg-white text-blue-600 shadow' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <TrendingUp size={16} className="mr-2" />
          Compliance
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            {activeTab === 'wizard' && (
              <TemplateWizard
                templates={templates}
                repositories={repositories}
                onApply={handleApplyTemplate}
              />
            )}
            {activeTab === 'history' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Template Application History</h2>
                {/* History content */}
              </div>
            )}
            {activeTab === 'compliance' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Template Compliance</h2>
                {/* Compliance content */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
