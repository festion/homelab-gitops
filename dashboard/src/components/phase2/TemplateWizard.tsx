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
