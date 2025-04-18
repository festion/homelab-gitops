// File: dashboard/src/pages/roadmap.tsx

import pkg from '../../package.json';

const roadmap: Record<string, string[]> = {
  'v1.0.0': [
    '✅ Audit API service with systemd + Express',
    '✅ React + Vite + Tailwind dashboard',
    '✅ Nightly audit cron + history snapshot',
    '✅ Remote-only GitHub repo inspection'
  ],
  'v1.1.0': [
    '🔜 Email summary of nightly audits',
    '🔜 Export audit results as CSV',
    '🔜 Git-based diff viewer'
  ],
  'v2.0.0': [
    '🧪 GitHub Actions deploy hook on push',
    '🧪 OAuth2 or Authelia SSO login',
    '🧪 Dark mode toggle & UI filters'
  ]
};

const Roadmap = () => {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Project Roadmap</h1>
      <p className="text-sm text-gray-500 mb-6">Version: <code>{pkg.version}</code></p>

      {Object.entries(roadmap).map(([version, items]) => (
        <div key={version} className="mb-6">
          <h2 className="text-lg font-semibold text-blue-700">{version}</h2>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {items.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Roadmap;
