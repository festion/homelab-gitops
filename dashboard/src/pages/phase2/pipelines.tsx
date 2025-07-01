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
