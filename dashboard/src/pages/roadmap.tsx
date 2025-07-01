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
  'v1.2.0 (Phase 1B)': [
    '✅ Template Application Engine',
    '✅ Standard DevOps template library',
    '✅ Batch template operations',
    '✅ Backup and rollback system',
    '✅ MCP server integration for automation',
  ],
  'v2.0.0 (Phase 2)': [
    '🚧 Advanced Dashboard Integration',
    '🚧 CI/CD Pipeline Management',
    '🚧 Cross-Repository Dependency Coordination',
    '🚧 Quality Gate Enforcement',
    '🚧 Visual Pipeline Designer with drag-and-drop',
    '🚧 Template Application Wizard',
    '🚧 Dependency Impact Analysis',
    '🚧 GitHub Actions integration',
  ],
  'v2.1.0': [
    '🔜 Multi-server template deployment',
    '🔜 Advanced conflict resolution UI',
    '🔜 Template marketplace integration',
    '🔜 Enterprise-grade security features',
    '🔜 Multi-homelab federation',
  ],
  'v3.0.0': [
    '🧪 Full GitOps platform capabilities',
    '🧪 Kubernetes operator integration',
    '🧪 Multi-cloud deployment support',
    '🧪 AI-powered optimization suggestions',
    '🧪 Complete DevOps lifecycle management',
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
        🎉 <strong>v1.2.0 (Phase 1B) Complete!</strong> Template Application Engine deployed to production.
      </p>

      {Object.entries(roadmap).map(([version, items]) => (
        <div key={version} className="mb-6">
          <h2 className={`text-lg font-semibold ${
            version.includes('v1.') ? 'text-green-700' : 
            version.includes('v2.0.0') ? 'text-orange-600' : 'text-blue-700'
          }`}>
            {version}
            {version === 'v1.1.0' && <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">COMPLETED</span>}
            {version === 'v1.2.0 (Phase 1B)' && <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">COMPLETED</span>}
            {version === 'v2.0.0 (Phase 2)' && <span className="ml-2 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">IN PROGRESS</span>}
          </h2>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
      
      <div className="mt-8 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">✅ Phase 1B Template Engine Features</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li><strong>🎯 Template Application:</strong> Apply standardized DevOps templates across repositories</li>
          <li><strong>📦 Batch Operations:</strong> Process multiple repositories simultaneously</li>
          <li><strong>💾 Backup System:</strong> Automatic backups before template application</li>
          <li><strong>🔄 Rollback Support:</strong> Easy rollback to previous state if needed</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-orange-50 rounded-lg">
        <h3 className="font-semibold text-orange-800 mb-2">🚧 Phase 2: Advanced DevOps Platform (In Progress)</h3>
        <ul className="text-sm text-orange-700 space-y-1">
          <li><strong>🎨 Visual Pipeline Designer:</strong> Drag-and-drop CI/CD pipeline creation</li>
          <li><strong>🔗 Dependency Management:</strong> Track and coordinate cross-repository dependencies</li>
          <li><strong>🛡️ Quality Gates:</strong> Automated enforcement of code quality standards</li>
          <li><strong>📊 Impact Analysis:</strong> Understand the ripple effects of changes</li>
          <li><strong>🤖 GitHub Actions:</strong> Deep integration with GitHub's CI/CD platform</li>
        </ul>
      </div>
    </div>
  );
};

export default Roadmap;
