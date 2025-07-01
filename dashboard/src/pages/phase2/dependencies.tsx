import React, { useState, useEffect } from 'react';
import { Network, GitBranch, Package, AlertTriangle, TrendingUp } from 'lucide-react';

const DependenciesPage: React.FC = () => {
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'graph' | 'analysis' | 'coordination'>('graph');

  useEffect(() => {
    // Mock data for demonstration
    setDependencies([
      {
        source: 'homelab-gitops-auditor',
        target: 'shared-config',
        type: 'config',
        impact: 'medium'
      },
      {
        source: 'home-assistant-config',
        target: 'shared-scripts',
        type: 'git',
        impact: 'high'
      }
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Repository Dependencies</h1>
        <p className="text-gray-600">Track and coordinate dependencies across your repositories</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2 rounded-t-lg flex items-center ${
            activeTab === 'graph' ? 'bg-white text-blue-600 shadow' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Network size={16} className="mr-2" />
          Dependency Graph
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-2 rounded-t-lg flex items-center ${
            activeTab === 'analysis' ? 'bg-white text-blue-600 shadow' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <TrendingUp size={16} className="mr-2" />
          Impact Analysis
        </button>
        <button
          onClick={() => setActiveTab('coordination')}
          className={`px-4 py-2 rounded-t-lg flex items-center ${
            activeTab === 'coordination' ? 'bg-white text-blue-600 shadow' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <GitBranch size={16} className="mr-2" />
          Coordination
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading dependencies...</div>
        ) : (
          <>
            {activeTab === 'graph' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Dependency Visualization</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dependencies.map((dep, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package size={16} className="mr-2 text-blue-500" />
                          <span className="font-medium">{dep.source}</span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center">
                          <span className="font-medium">{dep.target}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-600">{dep.type}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          dep.impact === 'high' ? 'bg-red-100 text-red-800' :
                          dep.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {dep.impact} impact
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Change Impact Analysis</h2>
                <div className="text-gray-600">
                  Select a repository to analyze the impact of proposed changes.
                </div>
              </div>
            )}

            {activeTab === 'coordination' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Multi-Repository Coordination</h2>
                <div className="text-gray-600">
                  Plan and execute coordinated changes across dependent repositories.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DependenciesPage;