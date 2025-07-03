import React, { useState, useEffect } from 'react';
import { FileText, Play, History, TrendingUp } from 'lucide-react';

const TemplatesDebug: React.FC = () => {
  const [templates, setTemplates] = useState<string[]>([]);
  const [repositories, setRepositories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'wizard' | 'history' | 'compliance'>('wizard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('TemplatesDebug: useEffect starting');
    
    // Test basic state updates first
    try {
      setTemplates(['standard-devops']);
      setRepositories(['test-repo-1', 'test-repo-2']);
      setLoading(false);
      console.log('TemplatesDebug: Basic state update successful');
    } catch (err) {
      console.error('TemplatesDebug: Error in basic state update:', err);
      setError(`Basic state error: ${err}`);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Templates Debug - Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Templates Debug - Error</h1>
        <div className="bg-red-100 p-4 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Templates Debug</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>✅ Component rendered successfully</p>
          <p>✅ useState hooks working</p>
          <p>✅ useEffect completed</p>
          <p>✅ Lucide icons imported: <FileText className="inline" size={16} /></p>
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
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-bold mb-2">Templates Found: {templates.length}</h3>
        <ul>
          {templates.map(template => (
            <li key={template}>• {template}</li>
          ))}
        </ul>
        
        <h3 className="font-bold mb-2 mt-4">Repositories Found: {repositories.length}</h3>
        <ul>
          {repositories.map(repo => (
            <li key={repo}>• {repo}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TemplatesDebug;