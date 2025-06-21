import { useState } from 'react';
import { Settings, X, Wifi, Database, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ConnectionSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    autoReconnect: boolean;
    reconnectAttempts: number;
    heartbeatInterval: number;
    pollingInterval: number;
    enableWebSocket: boolean;
  };
  onSettingsChange: (settings: any) => void;
  connectionInfo: {
    status: string;
    latency: number;
    clientCount: number;
    uptime: number;
    dataSource: 'websocket' | 'polling';
    lastUpdate: string;
  };
  onReconnect: () => void;
  onForcePolling: () => void;
  className?: string;
}

export const ConnectionSettings = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  connectionInfo,
  onReconnect,
  onForcePolling,
  className = ''
}: ConnectionSettingsProps) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  if (!isOpen) return null;

  const handleSettingChange = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(settings));
  };

  const handleApplySettings = () => {
    onSettingsChange(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${ms / 1000}s`;
    return `${ms / 60000}m`;
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Connection Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Connection Status */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Connection Status
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    {connectionInfo.status === 'connected' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium capitalize">{connectionInfo.status}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Data Source</div>
                  <div className="flex items-center gap-2 mt-1">
                    {connectionInfo.dataSource === 'websocket' ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <Database className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="font-medium capitalize">{connectionInfo.dataSource}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Latency</div>
                  <div className="font-medium mt-1">{connectionInfo.latency}ms</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Clients</div>
                  <div className="font-medium mt-1">{connectionInfo.clientCount}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={onReconnect}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reconnect
                </button>
                <button
                  onClick={onForcePolling}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Database className="w-3 h-3" />
                  Force Polling
                </button>
              </div>
            </div>
          </div>

          {/* WebSocket Settings */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              WebSocket Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable WebSocket</label>
                  <div className="text-xs text-gray-500">Use real-time WebSocket connections</div>
                </div>
                <button
                  onClick={() => handleSettingChange('enableWebSocket', !localSettings.enableWebSocket)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.enableWebSocket ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.enableWebSocket ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Reconnect</label>
                  <div className="text-xs text-gray-500">Automatically reconnect on disconnection</div>
                </div>
                <button
                  onClick={() => handleSettingChange('autoReconnect', !localSettings.autoReconnect)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.autoReconnect ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.autoReconnect ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Max Reconnect Attempts: {localSettings.reconnectAttempts}
                </label>
                <div className="text-xs text-gray-500 mb-2">Number of automatic reconnection attempts</div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={localSettings.reconnectAttempts}
                  onChange={(e) => handleSettingChange('reconnectAttempts', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Heartbeat Interval: {formatDuration(localSettings.heartbeatInterval)}
                </label>
                <div className="text-xs text-gray-500 mb-2">How often to send ping messages</div>
                <input
                  type="range"
                  min="10000"
                  max="120000"
                  step="10000"
                  value={localSettings.heartbeatInterval}
                  onChange={(e) => handleSettingChange('heartbeatInterval', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10s</span>
                  <span>2m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Polling Settings */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Polling Fallback Settings
            </h3>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Polling Interval: {formatDuration(localSettings.pollingInterval)}
              </label>
              <div className="text-xs text-gray-500 mb-2">How often to fetch data when using polling</div>
              <input
                type="range"
                min="5000"
                max="60000"
                step="5000"
                value={localSettings.pollingInterval}
                onChange={(e) => handleSettingChange('pollingInterval', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5s</span>
                <span>1m</span>
              </div>
            </div>
          </div>

          {/* Debug Information */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">Debug Information</h3>

            <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs space-y-1">
              <div>Last Update: {connectionInfo.lastUpdate || 'Never'}</div>
              <div>Server Uptime: {connectionInfo.uptime}s</div>
              <div>WebSocket URL: ws://{window.location.host}/ws</div>
              <div>API Endpoint: /audit</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {hasChanges ? (
              <span className="text-orange-600">• Unsaved changes</span>
            ) : (
              <span className="text-green-600">• Settings saved</span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApplySettings}
              disabled={!hasChanges}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
