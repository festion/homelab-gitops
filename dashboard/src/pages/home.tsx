// File: dashboard/src/pages/home.tsx

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">GitOps Dashboard Home</h1>
      <p className="mb-4">
        Welcome to the GitOps Auditor Dashboard! This tool helps you monitor and
        maintain the health of your Git repositories.
      </p>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">
          Quick Links
        </h2>
        <ul className="list-disc pl-5 text-blue-600">
          <li className="mb-1">
            <a href="/audit" className="hover:underline">
              Repository Audit
            </a>{' '}
            - Check status of all repositories
          </li>
        </ul>
      </div>
    </div>
  );
}
