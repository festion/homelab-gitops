// File: dashboard/src/pages/roadmap.tsx
// v1.1.0 - Updated roadmap with completed features

import pkg from '../../package.json';

const roadmap: Record<string, string[]> = {
  'v1.0.0': [
    '✅ Audit API service with systemd + Express',
    '✅ React + Vite + Tailwind dashboard',
    '✅ Nightly audit cron + history snapshot',
    '✅ Remote-only GitHub repo inspection',
  ],
  'v1.1.0': [
    '✅ Email summary of nightly audits',
    '✅ Export audit results as CSV',
    '✅ Enhanced git-based diff viewer with syntax highlighting',
    '✅ Unified and split-view diff modes',
    '✅ Interactive email notification controls',
  ],
  'v1.2.0': [
    '🔜 Repository health trend analytics',
    '🔜 Custom dashboard layouts and filters',
    '🔜 Webhook integration for real-time updates',
  ],
  'v2.0.0': [
    '🧪 GitHub Actions deploy hook on push',
    '🧪 OAuth2 or Authelia SSO login',
    '🧪 Dark mode toggle & advanced UI themes',
    '🧪 Multi-server MCP orchestration via Serena',
    '🧪 Advanced repository automation workflows',
  ],
};

const Roadmap = () => {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Project Roadmap</h1>
      <p className="text-sm text-gray-500 mb-2">
        Version: <code>{pkg.version}</code>
      </p>
      <p className="text-sm text-blue-600 mb-6">
        🎉 <strong>v1.1.0 Complete!</strong> All planned features have been successfully implemented and deployed.
      </p>

      {Object.entries(roadmap).map(([version, items]) => (
        <div key={version} className="mb-6">
          <h2 className={`text-lg font-semibold ${
            version === 'v1.1.0' ? 'text-green-700' : 'text-blue-700'
          }`}>
            {version}
            {version === 'v1.1.0' && <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">COMPLETED</span>}
          </h2>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">🚀 v1.1.0 New Features</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li><strong>📊 CSV Export:</strong> Download complete audit reports in spreadsheet format</li>
          <li><strong>📧 Email Summaries:</strong> Send audit reports directly to any email address</li>
          <li><strong>🔍 Enhanced Diff Viewer:</strong> Side-by-side and unified diff views with syntax highlighting</li>
          <li><strong>⚡ Interactive Controls:</strong> One-click actions for all export and communication features</li>
        </ul>
      </div>
    </div>
  );
};

export default Roadmap;
