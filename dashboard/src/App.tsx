import { useEffect, useState } from "react";
  import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
  } from "recharts";

  // Define the API response type
  type ApiResponse = {
    timestamp: string;
    health_status: string;
    summary: {
      total: number;
      missing: number;
      extra: number;
      dirty: number;
      clean: number;
    };
    repos: Array<{
      name: string;
      status: string;
      clone_url?: string;
      local_path?: string;
      dashboard_link?: string;
    }>;
  };

  const STATUS_LABELS = ["clean", "dirty", "missing", "extra"];
  const STATUS_COLORS: Record<string, string> = {
    "clean": "#22c55e",    // green
    "dirty": "#6366f1",    // indigo
    "missing": "#ef4444",  // red
    "extra": "#f59e0b",    // amber
  };

  export default function App() {
    console.log("App component rendering");
    const [data, setData] = useState<ApiResponse | null>(null);
    const [query, setQuery] = useState("");
    const [refreshInterval, setRefreshInterval] = useState<number>(10000);

    useEffect(() => {
      console.log("useEffect running");
      const fetchData = () => {
        console.log("fetchData called");

        // Development environment uses relative path
        const apiUrl = '/audit';

        fetch(apiUrl)
          .then((res) => {
            console.log("fetch response:", res.status);
            return res.json();
          })
          .then((json) => {
            console.log("data received:", json);
            setData(json);
          })
          .catch((err) => {
            console.error("Failed to load report:", err);
          });
      };

      fetchData();
      const interval = setInterval(fetchData, refreshInterval);
      return () => {
        console.log("Cleaning up interval");
        clearInterval(interval);
      };
    }, [refreshInterval]);

    console.log("Current data state:", data);

    // Show loading state if data isn't loaded yet
    if (!data) {
      return <div className="p-8">Loading dashboard data...</div>;
    }

    // Create summary data for charts
    const summaryData = Object.entries(data.summary)
      .filter(([key]) => key !== "total")
      .map(([name, value]) => ({ name, value }));

    // Filter repos based on search query
    const filteredRepos = data.repos.filter((repo) =>
      repo.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">🧭 GitOps Audit Dashboard</h1>
          <p className="text-gray-600 mb-4">Last updated: {data.timestamp}</p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <input
              type="text"
              placeholder="Search repositories..."
              className="w-full sm:w-1/2 border border-gray-300 rounded-md px-4 py-2 shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium ml-4">⏱ Refresh:</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 text-sm shadow-sm"
              >
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>60s</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`p-2 rounded-full ${data.health_status === "green" ? "bg-green-500" : data.health_status === "yellow" ? "bg-yellow-500" : "bg-red-500"} h-4 w-4`}></div>
            <span className="font-medium">Status: {data.health_status.toUpperCase()}</span>
          </div>

          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-white shadow rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-2">📊 Repo Health (Bar)</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {summaryData.map((entry) => (
                      <Cell
                        key={`bar-${entry.name}`}
                        fill={STATUS_COLORS[entry.name] || "#999"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-64 bg-white shadow rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-2">📈 Repo Breakdown (Pie)</h2>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={summaryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={70}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {summaryData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={STATUS_COLORS[entry.name] || "#999"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Repository Status ({filteredRepos.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredRepos.map((repo) => (
              <div
                key={repo.name}
                className={`bg-white shadow-md rounded-xl p-4 border-l-4 ${
                  repo.status === "clean"
                    ? "border-green-500"
                    : repo.status === "dirty"
                    ? "border-indigo-500"
                    : repo.status === "missing"
                    ? "border-red-500"
                    : "border-amber-500"
                }`}
              >
                <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>
                <p className="text-sm text-gray-600 mb-2">
                  Status: <span className="font-medium">{repo.status}</span>
                </p>

                {repo.clone_url && (
                  <p className="text-sm text-gray-600 mb-2">
                    URL: <span className="font-mono text-xs">{repo.clone_url}</span>
                  </p>
                )}

                {repo.local_path && (
                  <p className="text-sm text-gray-600 mb-2">
                    Path: <span className="font-mono text-xs">{repo.local_path}</span>
                  </p>
                )}

                {repo.dashboard_link && (
                  <a
                    href={repo.dashboard_link}
                    className="text-blue-500 hover:underline text-sm block mt-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Details →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
