import { useState, useMemo, useCallback } from "react";
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
import { useAuditData } from "./hooks/useAuditData";
import { useConnectionStatus } from "./hooks/useConnectionStatus";
import { useFallbackPolling } from "./hooks/useFallbackPolling";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { RealTimeToggle } from "./components/RealTimeToggle";
import { ConnectionSettings } from "./components/ConnectionSettings";
import { WebSocketErrorBoundary } from "./components/WebSocketErrorBoundary";


  // Status colors for visualization
  const STATUS_COLORS: Record<string, string> = {
    "clean": "#22c55e",    // green
    "dirty": "#6366f1",    // indigo
    "missing": "#ef4444",  // red
    "extra": "#f59e0b",    // amber
  };

export default function App() {
  const [query, setQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoReconnect: true,
    reconnectAttempts: 10,
    heartbeatInterval: 30000,
    pollingInterval: 10000,
    enableWebSocket: true
  });

  // Use the new audit data hook for unified data management
  const {
    data,
    isLoading,
    error,
    isRealTime,
    dataSource,
    lastUpdated,
    disableRealTime,
    toggleRealTime,
    refreshData
  } = useAuditData({
    enableWebSocket: settings.enableWebSocket,
    pollingInterval: settings.pollingInterval
  });

  // Connection status for WebSocket monitoring
  const connectionStatus = useConnectionStatus({
    enabled: isRealTime && settings.enableWebSocket
  });

  // Fallback polling system for automatic error recovery
  const fallbackSystem = useFallbackPolling(
    connectionStatus.isConnected,
    connectionStatus.connectionStatus,
    () => {
      console.log('Fallback system forcing polling mode');
      disableRealTime();
    },
    () => {
      console.log('Fallback system retrying WebSocket');
      connectionStatus.reconnect();
    },
    {
      maxConnectionFailures: 3,
      messageSuccessThreshold: 0.7,
      retryInterval: 30000,
      enabled: settings.enableWebSocket
    }
  );

  const handleSettingsChange = useCallback((newSettings: typeof settings) => {
    setSettings(newSettings);
    console.log("Settings updated:", newSettings);
  }, []);

  const handleForcePolling = useCallback(() => {
    disableRealTime();
    refreshData();
  }, [disableRealTime, refreshData]);

  const handleErrorRecovery = useCallback(() => {
    console.log('Attempting error recovery...');
    connectionStatus.reconnect();
  }, [connectionStatus]);

  const handleErrorFallback = useCallback(() => {
    console.log('Using fallback mode due to persistent errors');
    fallbackSystem.forceFallback();
  }, [fallbackSystem]);

  // Data state monitoring removed for production

  // Create summary data for charts (memoized) - moved before early return
  const summaryData = useMemo(() => {
    if (!data?.summary) return [];
    return Object.entries(data.summary)
      .filter(([key]) => key !== "total")
      .map(([name, value]) => ({ name, value }));
  }, [data?.summary]);

  // Filter repos based on search query (memoized) - moved before early return  
  const filteredRepos = useMemo(() => {
    if (!data?.repos) return [];
    return data.repos.filter((repo) =>
      repo.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [data?.repos, query]);

  // Show loading state if data isn't loaded yet
  if (isLoading || !data) {
    return (
      <WebSocketErrorBoundary
        onError={(error, errorInfo) => {
          console.error('WebSocket Error Boundary triggered:', error, errorInfo);
        }}
        onRetry={handleErrorRecovery}
        onFallbackMode={handleErrorFallback}
      >
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">🧭 GitOps Audit Dashboard</h1>
              <ConnectionStatus
                status={connectionStatus.connectionStatus}
                latency={connectionStatus.latency}
                clientCount={connectionStatus.clientCount}
                uptime={connectionStatus.uptime}
                lastUpdate={connectionStatus.lastUpdate}
                connectionQuality={connectionStatus.connectionQuality}
                onReconnect={connectionStatus.reconnect}
              />
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard data...</p>
                {error && (
                  <p className="text-red-600 mt-2 text-sm">Error: {error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </WebSocketErrorBoundary>
    );
  }

  return (
    <WebSocketErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Main WebSocket Error Boundary triggered:', error, errorInfo);
      }}
      onRetry={handleErrorRecovery}
      onFallbackMode={handleErrorFallback}
    >
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header with Connection Status */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">🧭 GitOps Audit Dashboard</h1>
              <p className="text-gray-600">
                Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : data.timestamp}
              </p>
            </div>
            <ConnectionStatus
              status={connectionStatus.connectionStatus}
              latency={connectionStatus.latency}
              clientCount={connectionStatus.clientCount}
              uptime={connectionStatus.uptime}
              lastUpdate={connectionStatus.lastUpdate}
              connectionQuality={connectionStatus.connectionQuality}
              onReconnect={connectionStatus.reconnect}
            />
          </div>

          {/* Controls Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            <input
              type="text"
              placeholder="Search repositories..."
              className="w-full lg:w-1/2 border border-gray-300 rounded-md px-4 py-2 shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="flex items-center gap-4">
              {/* Real-time Toggle */}
              <RealTimeToggle
                enabled={isRealTime}
                isConnected={connectionStatus.isConnected}
                dataSource={dataSource}
                onToggle={toggleRealTime}
                showSettings={true}
                onSettingsClick={() => setShowSettings(true)}
              />

              {/* Manual Refresh for polling mode */}
              {!isRealTime && (
                <button
                  onClick={refreshData}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  title="Refresh data manually"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>

          {/* System Health Status */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`p-2 rounded-full ${data.health_status === "green" ? "bg-green-500" : data.health_status === "yellow" ? "bg-yellow-500" : "bg-red-500"} h-4 w-4`}></div>
            <span className="font-medium">System Status: {data.health_status.toUpperCase()}</span>
            {isRealTime && dataSource === 'websocket' && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            )}
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
                className={`bg-white shadow-md rounded-xl p-4 border-l-4 transition-all duration-300 hover:shadow-lg ${
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

        {/* Connection Settings Modal */}
        <ConnectionSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          connectionInfo={{
            status: connectionStatus.connectionStatus,
            latency: connectionStatus.latency,
            clientCount: connectionStatus.clientCount,
            uptime: connectionStatus.uptime,
            dataSource,
            lastUpdate: connectionStatus.lastUpdate
          }}
          onReconnect={connectionStatus.reconnect}
          onForcePolling={handleForcePolling}
        />
      </div>
    </WebSocketErrorBoundary>
    );
  }
