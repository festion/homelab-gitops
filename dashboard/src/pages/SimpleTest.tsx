import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
      <p>This is a simple test page to verify routing is working.</p>
      <div className="mt-4 p-4 bg-green-100 rounded">
        <p>✅ React Router is working!</p>
        <p>✅ TypeScript is working!</p>
        <p>✅ Component rendering is working!</p>
      </div>
    </div>
  );
};

export default SimpleTest;