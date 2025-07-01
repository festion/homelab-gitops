#!/bin/bash
# deploy-dashboard-v2.sh - Deploy Phase 2 Dashboard UI Components

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PRODUCTION_SERVER="${PRODUCTION_SERVER:-192.168.1.58}"
DEPLOYMENT_USER="${DEPLOYMENT_USER:-root}"
DEPLOYMENT_DIR="${DEPLOYMENT_DIR:-/opt/gitops}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🎨 Phase 2.1: Dashboard UI Components${NC}"
echo -e "${BLUE}Target: ${PRODUCTION_SERVER}:${DEPLOYMENT_DIR}/dashboard${NC}"

# Create new dashboard components locally
echo -e "\n${BLUE}[INFO]${NC} Creating dashboard components..."

# Create component directories
mkdir -p "${PROJECT_ROOT}/dashboard/src/components/phase2"
mkdir -p "${PROJECT_ROOT}/dashboard/src/pages/phase2"

# Template Wizard Component
cat > "${PROJECT_ROOT}/dashboard/src/components/phase2/TemplateWizard.tsx" << 'EOF'
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';

interface TemplateWizardProps {
  templates: string[];
  repositories: string[];
  onApply: (template: string, repos: string[], options: any) => Promise<void>;
}

export const TemplateWizard: React.FC<TemplateWizardProps> = ({ templates, repositories, onApply }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [options, setOptions] = useState({ dryRun: true, createBackup: true });
  const [applying, setApplying] = useState(false);

  const steps = [
    { title: 'Select Template', component: 'template' },
    { title: 'Choose Repositories', component: 'repos' },
    { title: 'Configure Options', component: 'options' },
    { title: 'Review & Apply', component: 'review' }
  ];

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApply(selectedTemplate, selectedRepos, options);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 
              ${index <= currentStep ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 text-gray-500'}`}>
              {index < currentStep ? <Check size={20} /> : index + 1}
            </div>
            <span className={`ml-2 ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <ChevronRight className="mx-4 text-gray-400" size={20} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6 min-h-[400px]">
        {currentStep === 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Select a Template</h3>
            <div className="space-y-3">
              {templates.map(template => (
                <label key={template} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="template"
                    value={template}
                    checked={selectedTemplate === template}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{template}</div>
                    <div className="text-sm text-gray-600">
                      Comprehensive DevOps template with CI/CD and quality gates
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose Repositories</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {repositories.map(repo => (
                <label key={repo} className="flex items-center p-3 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    value={repo}
                    checked={selectedRepos.includes(repo)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRepos([...selectedRepos, repo]);
                      } else {
                        setSelectedRepos(selectedRepos.filter(r => r !== repo));
                      }
                    }}
                    className="mr-3"
                  />
                  <span>{repo}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Configure Options</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.dryRun}
                  onChange={(e) => setOptions({ ...options, dryRun: e.target.checked })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Dry Run Mode</div>
                  <div className="text-sm text-gray-600">Preview changes without applying them</div>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.createBackup}
                  onChange={(e) => setOptions({ ...options, createBackup: e.target.checked })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Create Backup</div>
                  <div className="text-sm text-gray-600">Backup repositories before applying template</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Review & Apply</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="font-medium mb-2">Template:</div>
                <div className="text-gray-700">{selectedTemplate}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="font-medium mb-2">Repositories ({selectedRepos.length}):</div>
                <div className="text-gray-700">{selectedRepos.join(', ')}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="font-medium mb-2">Options:</div>
                <div className="text-gray-700">
                  {options.dryRun && <div>• Dry Run Mode</div>}
                  {options.createBackup && <div>• Create Backup</div>}
                </div>
              </div>
              {options.dryRun && (
                <div className="flex items-center text-yellow-600">
                  <AlertCircle size={20} className="mr-2" />
                  <span>This is a dry run - no changes will be made</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center px-4 py-2 border rounded-md disabled:opacity-50"
        >
          <ChevronLeft size={20} className="mr-2" />
          Previous
        </button>
        
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={
              (currentStep === 0 && !selectedTemplate) ||
              (currentStep === 1 && selectedRepos.length === 0)
            }
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
          >
            Next
            <ChevronRight size={20} className="ml-2" />
          </button>
        ) : (
          <button
            onClick={handleApply}
            disabled={applying}
            className="px-6 py-2 bg-green-500 text-white rounded-md disabled:opacity-50"
          >
            {applying ? 'Applying...' : options.dryRun ? 'Run Dry Run' : 'Apply Template'}
          </button>
        )}
      </div>
    </div>
  );
};
EOF

# Pipeline Builder Component
cat > "${PROJECT_ROOT}/dashboard/src/components/phase2/PipelineBuilder.tsx" << 'EOF'
import React, { useState, useRef } from 'react';
import { Plus, Trash2, Play, Save, GitBranch, Package, TestTube, Rocket } from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  type: 'quality' | 'build' | 'test' | 'deploy';
  parallel: boolean;
  jobs: Array<{
    id: string;
    name: string;
    script?: string;
    mcp?: string;
  }>;
}

export const PipelineBuilder: React.FC = () => {
  const [stages, setStages] = useState<PipelineStage[]>([
    {
      id: '1',
      name: 'Quality Check',
      type: 'quality',
      parallel: true,
      jobs: [
        { id: '1-1', name: 'Linting', mcp: 'code-linter' },
        { id: '1-2', name: 'Security Scan', mcp: 'security-scanner' }
      ]
    }
  ]);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const stageIcons = {
    quality: <GitBranch size={20} />,
    build: <Package size={20} />,
    test: <TestTube size={20} />,
    deploy: <Rocket size={20} />
  };

  const stageColors = {
    quality: 'bg-purple-100 border-purple-300',
    build: 'bg-blue-100 border-blue-300',
    test: 'bg-green-100 border-green-300',
    deploy: 'bg-orange-100 border-orange-300'
  };

  const handleDragSort = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const draggedItem = stages[dragItem.current];
      const newStages = [...stages];
      newStages.splice(dragItem.current, 1);
      newStages.splice(dragOverItem.current, 0, draggedItem);
      setStages(newStages);
      dragItem.current = null;
      dragOverItem.current = null;
    }
  };

  const addStage = () => {
    const newStage: PipelineStage = {
      id: Date.now().toString(),
      name: 'New Stage',
      type: 'build',
      parallel: false,
      jobs: []
    };
    setStages([...stages, newStage]);
  };

  const deleteStage = (stageId: string) => {
    setStages(stages.filter(s => s.id !== stageId));
    if (selectedStage === stageId) setSelectedStage(null);
  };

  const updateStage = (stageId: string, updates: Partial<PipelineStage>) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, ...updates } : s));
  };

  const addJob = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (stage) {
      const newJob = {
        id: Date.now().toString(),
        name: 'New Job',
        script: ''
      };
      updateStage(stageId, { jobs: [...stage.jobs, newJob] });
    }
  };

  return (
    <div className="flex h-full">
      {/* Pipeline Canvas */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Pipeline Designer</h2>
          <div className="space-x-2">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center">
              <Save size={16} className="mr-2" />
              Save Pipeline
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center">
              <Play size={16} className="mr-2" />
              Test Run
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              draggable
              onDragStart={() => dragItem.current = index}
              onDragEnter={() => dragOverItem.current = index}
              onDragEnd={handleDragSort}
              onClick={() => setSelectedStage(stage.id)}
              className={`p-4 bg-white rounded-lg shadow cursor-move border-2 
                ${selectedStage === stage.id ? 'border-blue-500' : 'border-transparent'}
                ${stageColors[stage.type]}`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  {stageIcons[stage.type]}
                  <h3 className="ml-2 font-medium">{stage.name}</h3>
                  {stage.parallel && (
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">Parallel</span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStage(stage.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {stage.jobs.map(job => (
                  <div key={job.id} className="bg-white bg-opacity-50 p-2 rounded text-sm">
                    {job.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={addStage}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg 
              hover:border-gray-400 flex items-center justify-center text-gray-500"
          >
            <Plus size={20} className="mr-2" />
            Add Stage
          </button>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedStage && (
        <div className="w-96 bg-white shadow-lg p-6">
          {(() => {
            const stage = stages.find(s => s.id === selectedStage);
            if (!stage) return null;

            return (
              <>
                <h3 className="text-lg font-semibold mb-4">Stage Properties</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={stage.type}
                      onChange={(e) => updateStage(stage.id, { type: e.target.value as any })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="quality">Quality Check</option>
                      <option value="build">Build</option>
                      <option value="test">Test</option>
                      <option value="deploy">Deploy</option>
                    </select>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={stage.parallel}
                      onChange={(e) => updateStage(stage.id, { parallel: e.target.checked })}
                      className="mr-2"
                    />
                    Run jobs in parallel
                  </label>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Jobs</label>
                      <button
                        onClick={() => addJob(stage.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {stage.jobs.map(job => (
                        <div key={job.id} className="p-2 bg-gray-50 rounded">
                          {job.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
EOF

# Create Phase 2 pages
cat > "${PROJECT_ROOT}/dashboard/src/pages/phase2/templates.tsx" << 'EOF'
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
EOF

cat > "${PROJECT_ROOT}/dashboard/src/pages/phase2/pipelines.tsx" << 'EOF'
import React from 'react';
import { PipelineBuilder } from '../../components/phase2/PipelineBuilder';

const PipelinesPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <h1 className="text-2xl font-bold mb-2">CI/CD Pipelines</h1>
        <p className="text-gray-600">Design and manage your continuous integration pipelines</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <PipelineBuilder />
      </div>
    </div>
  );
};

export default PipelinesPage;
EOF

# Update router to include new routes
echo -e "\n${BLUE}[INFO]${NC} Updating router configuration..."
cat > "${PROJECT_ROOT}/dashboard/src/router-update.tsx" << 'EOF'
// Add these imports to router.tsx
import TemplatesPage from './pages/phase2/templates';
import PipelinesPage from './pages/phase2/pipelines';
import DependenciesPage from './pages/phase2/dependencies';
import QualityPage from './pages/phase2/quality';

// Add these routes to the routes array
{
  path: "/templates",
  element: <TemplatesPage />
},
{
  path: "/pipelines", 
  element: <PipelinesPage />
},
{
  path: "/dependencies",
  element: <DependenciesPage />
},
{
  path: "/quality",
  element: <QualityPage />
}

// Update sidebar navigation to include new items
const phase2Items = [
  { path: '/templates', label: 'Templates', icon: 'FileText' },
  { path: '/pipelines', label: 'Pipelines', icon: 'GitBranch' },
  { path: '/dependencies', label: 'Dependencies', icon: 'Network' },
  { path: '/quality', label: 'Quality Gates', icon: 'Shield' }
];
EOF

# Build dashboard
echo -e "\n${BLUE}[INFO]${NC} Building dashboard with Phase 2 components..."
cd "${PROJECT_ROOT}/dashboard"
npm install --silent
npm run build

# Deploy to production
echo -e "\n${BLUE}[INFO]${NC} Deploying dashboard to production..."
ssh "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}" "mkdir -p ${DEPLOYMENT_DIR}/dashboard/dist"
scp -r dist/* "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}:${DEPLOYMENT_DIR}/dashboard/dist/"

# Update nginx configuration for new routes
echo -e "\n${BLUE}[INFO]${NC} Updating nginx configuration..."
ssh "${DEPLOYMENT_USER}@${PRODUCTION_SERVER}" << 'ENDSSH'
# Add SPA routing for new Phase 2 routes
sed -i '/try_files/s|$uri /index.html|$uri $uri/ /index.html|' /etc/nginx/sites-available/gitops-dashboard
nginx -t && systemctl reload nginx
ENDSSH

echo -e "${GREEN}✅ Phase 2.1 Dashboard UI Components deployed successfully${NC}"