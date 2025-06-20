import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface ConnectionStatusHook {
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  isConnected: boolean;
  latency: number;
  clientCount: number;
  uptime: number;
  lastUpdate: string;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  reconnect: () => void;
  disconnect: () => void;
}

interface ConnectionStatusOptions {
  url?: string;
  enabled?: boolean;
  qualityThresholds?: {
    excellent: number;
    good: number;
  };
  onMessage?: (message: any) => void;
}

export const useConnectionStatus = (options: ConnectionStatusOptions = {}): ConnectionStatusHook => {
  const {
    url = `ws://${window.location.host}/ws`,
    enabled = true,
    qualityThresholds = { excellent: 100, good: 300 },
    onMessage: externalOnMessage
  } = options;

  const [clientCount, setClientCount] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('');
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'unknown'>('unknown');

  const handleMessage = useCallback((message: any) => {
    if (message.type === 'status') {
      setClientCount(message.data?.clients || 0);
      setUptime(message.data?.uptime || 0);
      setLastUpdate(new Date().toISOString());
    } else if (message.type === 'audit-update') {
      setLastUpdate(new Date().toISOString());
    }
    
    // Forward all messages to external handler if provided
    externalOnMessage?.(message);
  }, [externalOnMessage]);

  const handleConnect = useCallback(() => {
    setLastUpdate(new Date().toISOString());
    setConnectionQuality('unknown');
  }, []);

  const handleDisconnect = useCallback(() => {
    setConnectionQuality('unknown');
    setClientCount(0);
  }, []);

  const handleError = useCallback((error: Event) => {
    console.error('WebSocket connection error:', error);
    setConnectionQuality('poor');
  }, []);

  const {
    isConnected,
    connectionStatus,
    latency,
    reconnect,
    disconnect,
    sendMessage
  } = useWebSocket(url, {
    reconnect: enabled,
    onMessage: handleMessage,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError
  });

  // Update connection quality based on latency
  useEffect(() => {
    if (isConnected && latency > 0) {
      if (latency <= qualityThresholds.excellent) {
        setConnectionQuality('excellent');
      } else if (latency <= qualityThresholds.good) {
        setConnectionQuality('good');
      } else {
        setConnectionQuality('poor');
      }
    }
  }, [latency, isConnected, qualityThresholds]);

  // Request status updates periodically
  useEffect(() => {
    if (isConnected) {
      const requestStatus = () => {
        sendMessage({ type: 'get-status' });
      };

      // Request initial status
      requestStatus();

      // Request status every 30 seconds
      const statusInterval = setInterval(requestStatus, 30000);

      return () => clearInterval(statusInterval);
    }
  }, [isConnected, sendMessage]);

  return {
    connectionStatus,
    isConnected,
    latency,
    clientCount,
    uptime,
    lastUpdate,
    connectionQuality,
    reconnect,
    disconnect
  };
};