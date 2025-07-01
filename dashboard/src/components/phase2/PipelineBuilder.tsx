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
