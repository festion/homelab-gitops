import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';

const QualityPage: React.FC = () => {
  const [gates, setGates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gates' | 'results' | 'config'>('gates');

  useEffect(() => {
    // Fetch quality gates from API
    fetch('/api/v2/quality/gates')
      .then(r => r.json())
      .then(data => {
        setGates(data.gates || []);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to mock data
        setGates([
      {
        name: 'Code Linting',
        type: 'pre_commit',
        status: 'passing',
        last_run: '2025-07-01T10:30:00Z',
        pass_rate: 95
      },
      {
        name: 'Test Coverage',
        type: 'pre_merge',
        status: 'failing',
        last_run: '2025-07-01T10:25:00Z',
        pass_rate: 75
      },
      {
        name: 'Security Scan',
        type: 'pre_deploy',
        status: 'warning',
        last_run: '2025-07-01T10:20:00Z',
        pass_rate: 88
      }
    ]);
    setLoading(false);
      });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing': return <CheckCircle className="text-green-500" size={20} />;
      case 'failing': return <XCircle className="text-red-500" size={20} />;
      case 'warning': return <AlertCircle className="text-yellow-500" size={20} />;
      default: return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Quality Gates</h1>
        <p className="text-gray-600">Monitor and enforce code quality standards across your repositories</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('gates')}
          className={`px-4 py-2 rounded-t-lg flex items-center ${
            activeTab === 'gates' ? 'bg-white text-blue-600 shadow' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Shield size={16} className="mr-2" />
          Quality Gates
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded-t-lg flex items-center ${
            activeTab === 'results' ? 'bg-white text-blue-600 shadow' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <CheckCircle size={16} className="mr-2" />
          Results
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-t-lg flex items-center ${
            activeTab === 'config' ? 'bg-white text-blue-600 shadow' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Settings size={16} className="mr-2" />
          Configuration
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading quality gates...</div>
        ) : (
          <>
            {activeTab === 'gates' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Active Quality Gates</h2>
                <div className="space-y-4">
                  {gates.map((gate, idx) => (
                    <div key={idx} className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(gate.status)}
                        <div>
                          <h3 className="font-medium">{gate.name}</h3>
                          <p className="text-sm text-gray-600">{gate.type} • Last run: {new Date(gate.last_run).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{gate.pass_rate}%</div>
                        <div className="text-sm text-gray-600">Pass Rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Quality Gate Results</h2>
                <div className="text-gray-600">
                  Detailed results and metrics from quality gate executions.
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Gate Configuration</h2>
                <div className="text-gray-600">
                  Configure quality gates, thresholds, and enforcement policies.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QualityPage;