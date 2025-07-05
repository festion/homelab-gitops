import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  GitBranch, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Shield,
  Layers,
  Target,
  Zap,
  Info
} from 'lucide-react';

interface DependencyNode {
  id: string;
  type: 'primary' | 'dependency' | 'secondary';
  group: string;
}

interface DependencyEdge {
  source: string;
  target: string;
  type: 'config' | 'runtime' | 'git' | 'build';
  impact: 'low' | 'medium' | 'high' | 'critical';
  version?: string;
}

interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  summary: {
    totalDependencies: number;
    highImpact: number;
    mediumImpact: number;
    lowImpact: number;
    dependencyTypes: string[];
  };
}

interface Vulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  package: string;
  version: string;
  fixedVersion: string;
  repository: string;
  description: string;
  published: string;
}

interface ImpactAnalysis {
  repository: string;
  changeType: string;
  impactAnalysis: {
    directImpact: number;
    transitiveImpact: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    affectedRepositories: string[];
    affectedServices: Array<{
      name: string;
      impact: string;
      downtime: boolean;
    }>;
    recommendations: string[];
  };
  timeline: {
    estimatedTestingTime: string;
    recommendedDeploymentWindow: string;
    rollbackTime: string;
  };
}

const DependenciesPage: React.FC = () => {
  const [dependencyGraph, setDependencyGraph] = useState<DependencyGraph | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'graph' | 'vulnerabilities' | 'analysis' | 'coordination'>('graph');
  const [selectedRepository, setSelectedRepository] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [graphRes, vulnRes] = await Promise.all([
        fetch('/api/v2/dependencies/graph'),
        fetch('/api/v2/dependencies/vulnerabilities')
      ]);
      
      const graphData = await graphRes.json();
      const vulnData = await vulnRes.json();
      
      setDependencyGraph(graphData);
      setVulnerabilities(vulnData.vulnerabilities || []);
    } catch (error) {
      console.error('Failed to load dependencies data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeImpact = async (repository: string, changeType: string = 'update') => {
    try {
      const response = await fetch('/api/v2/dependencies/analyze-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repository, changeType })
      });
      
      if (response.ok) {
        const analysis = await response.json();
        setImpactAnalysis(analysis);
        setActiveTab('analysis');
      }
    } catch (error) {
      console.error('Failed to analyze impact:', error);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesSeverity = severityFilter === 'all' || vuln.severity === severityFilter;
    const matchesRepo = !selectedRepository || vuln.repository === selectedRepository;
    return matchesSeverity && matchesRepo;
  });

  const uniqueRepositories = [...new Set(vulnerabilities.map(v => v.repository))];

  const renderGraphTab = () => (
    <div className="space-y-6">
      {/* Graph Controls */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Filter repositories..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="2">Depth: 2 levels</option>
          <option value="1">Depth: 1 level</option>
          <option value="3">Depth: 3 levels</option>
        </select>
        
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
        
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center">
          <Download size={16} className="mr-2" />
          Export
        </button>
      </div>

      {/* Graph Statistics */}
      {dependencyGraph && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Dependencies</p>
                <p className="text-2xl font-bold text-gray-900">{dependencyGraph.summary.totalDependencies}</p>
              </div>
              <Package className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Impact</p>
                <p className="text-2xl font-bold text-red-600">{dependencyGraph.summary.highImpact}</p>
              </div>
              <AlertTriangle className="text-red-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Medium Impact</p>
                <p className="text-2xl font-bold text-yellow-600">{dependencyGraph.summary.mediumImpact}</p>
              </div>
              <Target className="text-yellow-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Impact</p>
                <p className="text-2xl font-bold text-green-600">{dependencyGraph.summary.lowImpact}</p>
              </div>
              <Layers className="text-green-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Graph Visualization */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Dependency Graph</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Eye size={16} />
            <span>Interactive visualization</span>
          </div>
        </div>
        
        <div ref={graphRef} className="h-96 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
          {dependencyGraph ? (
            <div className="text-center">
              <Network size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Interactive dependency graph visualization</p>
              <p className="text-sm text-gray-500 mt-2">
                {dependencyGraph.nodes.length} nodes, {dependencyGraph.edges.length} connections
              </p>
              
              {/* Simple list view for now */}
              <div className="mt-6 text-left max-w-md mx-auto">
                <h4 className="font-medium mb-3">Dependencies:</h4>
                <div className="space-y-2">
                  {dependencyGraph.edges.map((edge, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{edge.source} → {edge.target}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getImpactColor(edge.impact)}`}>
                        {edge.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Network size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Loading dependency graph...</p>
            </div>
          )}
        </div>
      </div>

      {/* Repository Actions */}
      {dependencyGraph && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Repository Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dependencyGraph.nodes
              .filter(node => node.type === 'primary')
              .map(node => (
                <div key={node.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{node.id}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {node.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => analyzeImpact(node.id)}
                      className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition-colors"
                    >
                      <Zap size={14} className="inline mr-2" />
                      Analyze Impact
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition-colors">
                      <Eye size={14} className="inline mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderVulnerabilitiesTab = () => (
    <div className="space-y-6">
      {/* Vulnerability Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        
        <select
          value={selectedRepository}
          onChange={(e) => setSelectedRepository(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Repositories</option>
          {uniqueRepositories.map(repo => (
            <option key={repo} value={repo}>{repo}</option>
          ))}
        </select>
        
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Vulnerability Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['critical', 'high', 'medium', 'low'].map(severity => {
          const count = filteredVulnerabilities.filter(v => v.severity === severity).length;
          return (
            <div key={severity} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{severity}</p>
                  <p className={`text-2xl font-bold ${
                    severity === 'critical' ? 'text-red-600' :
                    severity === 'high' ? 'text-red-500' :
                    severity === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>{count}</p>
                </div>
                <Shield className={
                  severity === 'critical' ? 'text-red-500' :
                  severity === 'high' ? 'text-red-400' :
                  severity === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                } size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Vulnerabilities List */}
      <div className="space-y-4">
        {filteredVulnerabilities.map(vuln => (
          <div key={vuln.id} className={`bg-white border rounded-lg p-6 ${getSeverityColor(vuln.severity)}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Shield className="mr-3" size={20} />
                <div>
                  <h3 className="font-semibold text-lg">{vuln.id}</h3>
                  <p className="text-sm text-gray-600">{vuln.package} v{vuln.version}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(vuln.severity)}`}>
                  {vuln.severity.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {vuln.repository}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{vuln.description}</p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span>Current: <code className="bg-gray-100 px-2 py-1 rounded">{vuln.version}</code></span>
                <span>Fixed in: <code className="bg-green-100 px-2 py-1 rounded">{vuln.fixedVersion}</code></span>
              </div>
              <span className="text-gray-500">
                Published: {new Date(vuln.published).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        
        {filteredVulnerabilities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No vulnerabilities found</h3>
            <p>Great! No security vulnerabilities match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="space-y-6">
      {impactAnalysis ? (
        <>
          {/* Analysis Header */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Impact Analysis Results</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(impactAnalysis.impactAnalysis.riskLevel)}`}>
                {impactAnalysis.impactAnalysis.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{impactAnalysis.impactAnalysis.directImpact}</p>
                <p className="text-sm text-gray-600">Direct Impact</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{impactAnalysis.impactAnalysis.transitiveImpact}</p>
                <p className="text-sm text-gray-600">Transitive Impact</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{impactAnalysis.impactAnalysis.affectedRepositories.length}</p>
                <p className="text-sm text-gray-600">Affected Repos</p>
              </div>
            </div>
          </div>

          {/* Affected Services */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="font-semibold mb-4">Affected Services</h4>
            <div className="space-y-3">
              {impactAnalysis.impactAnalysis.affectedServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${getImpactColor(service.impact)}`}>
                      {service.impact}
                    </span>
                    {service.downtime && (
                      <span className="px-2 py-1 rounded text-sm bg-red-100 text-red-800">
                        Downtime Expected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="font-semibold mb-4">Recommendations</h4>
            <ul className="space-y-2">
              {impactAnalysis.impactAnalysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <Info size={16} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="font-semibold mb-4">Timeline Estimates</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Testing Time</p>
                <p className="font-medium">{impactAnalysis.timeline.estimatedTestingTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deployment Window</p>
                <p className="font-medium">{impactAnalysis.timeline.recommendedDeploymentWindow}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rollback Time</p>
                <p className="font-medium">{impactAnalysis.timeline.rollbackTime}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Analysis Results</h3>
          <p className="mb-4">Select a repository from the Graph tab to analyze its impact.</p>
          <button
            onClick={() => setActiveTab('graph')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Go to Graph
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dependencies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dependency Management</h1>
        <p className="text-gray-600">Visualize and analyze repository dependencies and impacts</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'graph', label: 'Dependency Graph', icon: Network },
            { id: 'vulnerabilities', label: 'Vulnerabilities', icon: Shield },
            { id: 'analysis', label: 'Impact Analysis', icon: TrendingUp },
            { id: 'coordination', label: 'Coordination', icon: GitBranch },
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
      {activeTab === 'graph' && renderGraphTab()}
      {activeTab === 'vulnerabilities' && renderVulnerabilitiesTab()}
      {activeTab === 'analysis' && renderAnalysisTab()}
      {activeTab === 'coordination' && (
        <div className="text-center py-8 text-gray-500">
          <GitBranch size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Coordination Tools</h3>
          <p>Advanced dependency coordination and orchestration tools coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default DependenciesPage;