import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity,
  Settings,
  Plus,
  Filter,
  Search
} from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  repository: string;
  description: string;
  status: 'active' | 'paused' | 'failed';
  created: string;
  lastRun: string | null;
  successRate: number;
  avgDuration: number;
  stages: string[];
  triggers: string[];
}

interface PipelineExecution {
  runId: string;
  pipelineId: string;
  pipelineName: string;
  status: 'running' | 'idle' | 'completed' | 'failed';
  currentStage: string | null;
  progress: number;
  startedAt: string | null;
  stages: Array<{
    name: string;
    status: 'completed' | 'running' | 'pending' | 'failed' | 'idle';
    duration: number | null;
  }>;
}

const PipelinesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'executions' | 'settings'>('overview');
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [executions, setExecutions] = useState<Map<string, PipelineExecution>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPipelines();
  }, []);

  useEffect(() => {
    // Poll for execution statuses
    const interval = setInterval(() => {
      pipelines.forEach(pipeline => {
        if (pipeline.status === 'active') {
          loadPipelineStatus(pipeline.id);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [pipelines]);

  const loadPipelines = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v2/pipelines');
      const data = await response.json();
      setPipelines(data.pipelines || []);
    } catch (error) {
      console.error('Failed to load pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPipelineStatus = async (pipelineId: string) => {
    try {
      const response = await fetch(`/api/v2/pipelines/${pipelineId}/status`);
      const execution = await response.json();
      setExecutions(prev => new Map(prev.set(pipelineId, execution)));
    } catch (error) {
      console.error('Failed to load pipeline status:', error);
    }
  };

  const executePipeline = async (pipelineId: string) => {
    try {
      const response = await fetch(`/api/v2/pipelines/${pipelineId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Pipeline execution started:', result);
        
        // Immediately check status
        setTimeout(() => loadPipelineStatus(pipelineId), 1000);
      }
    } catch (error) {
      console.error('Failed to execute pipeline:', error);
    }
  };

  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesSearch = pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pipeline.repository.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || pipeline.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="text-green-500" size={20} />;
      case 'paused': return <Pause className="text-yellow-500" size={20} />;
      case 'failed': return <XCircle className="text-red-500" size={20} />;
      case 'running': return <Activity className="text-blue-500 animate-pulse" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pipelines</p>
              <p className="text-2xl font-bold text-gray-900">{pipelines.length}</p>
            </div>
            <GitBranch className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {pipelines.filter(p => p.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold text-blue-600">
                {Array.from(executions.values()).filter(e => e.status === 'running').length}
              </p>
            </div>
            <Activity className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(pipelines.reduce((sum, p) => sum + p.successRate, 0) / (pipelines.length || 1))}%
              </p>
            </div>
            <Activity className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search pipelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        
        <button
          onClick={() => setActiveTab('builder')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
        >
          <Plus size={16} className="mr-2" />
          New Pipeline
        </button>
      </div>

      {/* Pipelines List */}
      <div className="space-y-4">
        {filteredPipelines.map(pipeline => {
          const execution = executions.get(pipeline.id);
          
          return (
            <div key={pipeline.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(execution?.status || pipeline.status)}
                  <div className="ml-3">
                    <h3 className="font-semibold text-lg">{pipeline.name}</h3>
                    <p className="text-sm text-gray-600">{pipeline.repository}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => executePipeline(pipeline.id)}
                    disabled={execution?.status === 'running'}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Play size={16} className="mr-1" />
                    {execution?.status === 'running' ? 'Running...' : 'Run'}
                  </button>
                  <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
              
              {pipeline.description && (
                <p className="text-gray-600 mb-4">{pipeline.description}</p>
              )}
              
              {/* Pipeline Stages */}
              {execution && execution.stages.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Pipeline Progress</span>
                    {execution.status === 'running' && (
                      <span className="text-sm text-blue-600">
                        {Math.round(execution.progress)}% complete
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {execution.stages.map((stage, index) => (
                      <div key={index} className="flex-1">
                        <div className={`h-2 rounded ${
                          stage.status === 'completed' ? 'bg-green-500' :
                          stage.status === 'running' ? 'bg-blue-500' :
                          stage.status === 'failed' ? 'bg-red-500' :
                          'bg-gray-200'
                        }`}></div>
                        <div className="text-xs mt-1 text-center">
                          {stage.name}
                          {stage.duration && (
                            <div className="text-gray-500">{stage.duration}s</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pipeline Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>Success Rate: {pipeline.successRate}%</span>
                  <span>Avg Duration: {pipeline.avgDuration}s</span>
                  <span>Triggers: {pipeline.triggers.join(', ')}</span>
                </div>
                <div>
                  {pipeline.lastRun ? (
                    <span>Last run: {new Date(pipeline.lastRun).toLocaleString()}</span>
                  ) : (
                    <span>Never run</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredPipelines.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchQuery || filterStatus !== 'all' ? (
              <p>No pipelines match your current filters.</p>
            ) : (
              <div>
                <GitBranch size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No pipelines yet</h3>
                <p className="mb-4">Get started by creating your first CI/CD pipeline.</p>
                <button
                  onClick={() => setActiveTab('builder')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Create Pipeline
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading pipelines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <h1 className="text-2xl font-bold mb-2">CI/CD Pipelines</h1>
        <p className="text-gray-600">Design and manage your continuous integration pipelines</p>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'builder', label: 'Pipeline Builder', icon: GitBranch },
            { id: 'executions', label: 'Execution History', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto px-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'builder' && <PipelineBuilder />}
        {activeTab === 'executions' && (
          <div className="text-center py-8 text-gray-500">
            <Clock size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Execution History</h3>
            <p>Detailed pipeline execution logs and history coming soon.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-8 text-gray-500">
            <Settings size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Pipeline Settings</h3>
            <p>Global pipeline configuration and settings coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Missing PipelineBuilder component placeholder
const PipelineBuilder: React.FC = () => (
  <div className="text-center py-8 text-gray-500">
    <GitBranch size={48} className="mx-auto mb-4 text-gray-300" />
    <h3 className="text-lg font-medium mb-2">Pipeline Builder</h3>
    <p>Visual pipeline builder coming soon.</p>
  </div>
);

export default PipelinesPage;
