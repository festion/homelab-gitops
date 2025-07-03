import React from 'react';

const TemplatesSimple: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Templates Management</h1>
      <p>This is the simplified templates page.</p>
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <h2 className="font-bold">Available Templates:</h2>
        <ul className="mt-2">
          <li>• standard-devops</li>
          <li>• basic-project</li>
        </ul>
      </div>
      <div className="mt-4 p-4 bg-green-100 rounded">
        <h2 className="font-bold">Status:</h2>
        <p>✅ Templates page loaded successfully</p>
        <p>✅ No API calls required</p>
      </div>
    </div>
  );
};

export default TemplatesSimple;