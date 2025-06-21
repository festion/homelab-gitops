import { memo, useMemo, useCallback } from 'react';
import { Zap, ZapOff, Wifi, Database, Settings } from 'lucide-react';

interface RealTimeToggleProps {
  enabled: boolean;
  isConnected: boolean;
  dataSource: 'websocket' | 'polling';
  onToggle: () => void;
  disabled?: boolean;
  showSettings?: boolean;
  onSettingsClick?: () => void;
  className?: string;
}

export const RealTimeToggle = memo<RealTimeToggleProps>(({
  enabled,
  isConnected,
  dataSource,
  onToggle,
  disabled = false,
  showSettings = false,
  onSettingsClick,
  className = ''
}) => {
  const statusConfig = useMemo(() => {
    if (!enabled) {
      return {
        icon: ZapOff,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        label: 'Real-time Disabled',
        description: 'Using polling mode'
      };
    }

    if (enabled && isConnected && dataSource === 'websocket') {
      return {
        icon: Zap,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Real-time Active',
        description: 'Live WebSocket updates'
      };
    }

    if (enabled && dataSource === 'polling') {
      return {
        icon: Database,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: 'Fallback Mode',
        description: 'Using API polling'
      };
    }

    return {
      icon: Wifi,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      label: 'Connecting...',
      description: 'Establishing real-time connection'
    };
  }, [enabled, isConnected, dataSource]);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      onToggle();
    }
  }, [onToggle, disabled]);

  const handleSettingsClick = useCallback(() => {
    onSettingsClick?.();
  }, [onSettingsClick]);

  const config = statusConfig;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Toggle Switch */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            enabled
              ? isConnected && dataSource === 'websocket'
                ? 'bg-green-600'
                : 'bg-yellow-500'
              : 'bg-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={enabled ? 'Disable real-time updates' : 'Enable real-time updates'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>

        {/* Status Icon and Label */}
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-900">{config.label}</span>
              {dataSource === 'websocket' && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live updates" />
              )}
            </div>
            <div className="text-xs text-gray-500">{config.description}</div>
          </div>
        </div>
      </div>

      {/* Data Source Indicator */}
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
        {dataSource === 'websocket' ? (
          <Wifi className="w-3 h-3 text-green-600" />
        ) : (
          <Database className="w-3 h-3 text-blue-600" />
        )}
        <span className="text-xs font-medium text-gray-700 capitalize">
          {dataSource === 'websocket' ? 'WebSocket' : 'API'}
        </span>
      </div>

      {/* Settings Button */}
      {showSettings && onSettingsClick && (
        <button
          onClick={handleSettingsClick}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          title="Real-time settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}

      {/* Status Details Tooltip */}
      <div className="relative group">
        <div className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs text-gray-600 cursor-help transition-colors">
          i
        </div>

        {/* Tooltip */}
        <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="space-y-2">
            <div className="font-medium border-b border-gray-700 pb-1">Real-time Status</div>

            <div className="space-y-1">
              <div>Mode: <span className="font-medium">{enabled ? 'Enabled' : 'Disabled'}</span></div>
              <div>Data Source: <span className="font-medium capitalize">{dataSource}</span></div>
              <div>Connection: <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span></div>
            </div>

            <div className="pt-1 border-t border-gray-700">
              {enabled ? (
                dataSource === 'websocket' ? (
                  <div className="text-green-200">✓ Receiving live updates via WebSocket</div>
                ) : (
                  <div className="text-yellow-200">⚠ Fallback: Using API polling for updates</div>
                )
              ) : (
                <div className="text-gray-300">Real-time updates are disabled. Using manual refresh.</div>
              )}
            </div>

            <div className="pt-1 text-gray-400 text-xs">
              Click the toggle to {enabled ? 'disable' : 'enable'} real-time updates
            </div>
          </div>

          {/* Tooltip Arrow */}
          <div className="absolute top-0 right-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
});
