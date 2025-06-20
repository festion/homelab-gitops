import { useEffect, useState } from 'react';

export default function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/GitRepoReport.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error('Failed to load report:', err));
  }, []);

  const filtered = data.filter((repo) =>
    repo.name.toLowerCase().includes(query.toLowerCase())
  );

  const badge = (label, condition) => (
    <span
      className={`text-xs px-2 py-1 rounded-full font-semibold border ${
        condition
          ? 'bg-red-100 text-red-800 border-red-300'
          : 'bg-green-100 text-green-800 border-green-300'
      }`}
    >
      {label}: {condition ? 'Yes' : 'No'}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🧭 GitOps Audit Dashboard</h1>
        <input
          type="text"
          placeholder="Search repositories..."
          className="w-full border border-gray-300 rounded-md px-4 py-2 mb-6 shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((repo) => (
            <div
              key={repo.name}
              className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>
              <p className="text-sm text-gray-600 mb-1">
                Branch: <span className="font-mono">{repo.branch}</span>
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Last Commit:{' '}
                <span className="font-mono">{repo.lastCommit}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Remote:{' '}
                {repo.remote || (
                  <span className="italic text-gray-400">None</span>
                )}
              </p>

              <div className="flex flex-wrap gap-2">
                {badge('Uncommitted', repo.uncommittedChanges)}
                {badge('Stale', repo.isStale)}
                {badge('Missing Files', repo.missingFiles?.length > 0)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
