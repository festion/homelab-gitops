import { useEffect, useState, useCallback, useRef } from 'react';
import { useConnectionStatus } from './useConnectionStatus';

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

interface AuditDataHook {
  data: ApiResponse | null;
  isLoading: boolean;
  error: string | null;
  isRealTime: boolean;
  dataSource: 'websocket' | 'polling';
  lastUpdated: string;
  enableRealTime: () => void;
  disableRealTime: () => void;
  toggleRealTime: () => void;
  refreshData: () => void;
}

interface AuditDataOptions {
  enableWebSocket?: boolean;
  pollingInterval?: number;
  apiEndpoint?: string;
}

export const useAuditData = (options: AuditDataOptions = {}): AuditDataHook => {
  const {
    enableWebSocket = true,
    pollingInterval = 10000,
    apiEndpoint = '/audit'
  } = options;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTime, setIsRealTime] = useState(enableWebSocket);
  const [dataSource, setDataSource] = useState<'websocket' | 'polling'>('polling');
  const [lastUpdated, setLastUpdated] = useState('');

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollingDataRef = useRef<string>('');

  // Handle WebSocket messages for audit data
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'audit-update' && message.data) {
      const validatedData = validateAuditData(message.data);
      if (validatedData) {
        setData(validatedData);
        setDataSource('websocket');
        setLastUpdated(new Date().toISOString());
        setError(null);
        setIsLoading(false);
      } else {
        console.error('Invalid WebSocket data received');
      }
    }
  }, [validateAuditData]);

  // Connection status for WebSocket with message handling
  const connectionStatus = useConnectionStatus({
    enabled: isRealTime && enableWebSocket,
    onMessage: handleWebSocketMessage
  });

  // Validate and normalize audit data
  const validateAuditData = useCallback((rawData: any): ApiResponse | null => {
    try {
      if (!rawData || typeof rawData !== 'object') {
        throw new Error('Invalid data format');
      }

      const { timestamp, health_status, summary, repos } = rawData;

      if (!timestamp || !health_status || !summary || !Array.isArray(repos)) {
        throw new Error('Missing required fields');
      }

      // Validate summary structure
      const { total, missing, extra, dirty, clean } = summary;
      if (typeof total !== 'number' || typeof missing !== 'number' || 
          typeof extra !== 'number' || typeof dirty !== 'number' || 
          typeof clean !== 'number') {
        throw new Error('Invalid summary data');
      }

      // Validate repos array
      const validRepos = repos.filter(repo => 
        repo && typeof repo === 'object' && 
        typeof repo.name === 'string' && 
        typeof repo.status === 'string'
      );

      return {
        timestamp,
        health_status,
        summary: { total, missing, extra, dirty, clean },
        repos: validRepos
      };
    } catch (validationError) {
      console.error('Data validation error:', validationError);
      return null;
    }
  }, []);

  // Fetch data via API polling
  const fetchData = useCallback(async (): Promise<ApiResponse | null> => {
    try {
      setError(null);
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData = await response.json();
      const validatedData = validateAuditData(rawData);
      
      if (!validatedData) {
        throw new Error('Invalid data received from API');
      }

      return validatedData;
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      setError(`Failed to fetch data: ${errorMessage}`);
      console.error('API fetch error:', fetchError);
      return null;
    }
  }, [apiEndpoint, validateAuditData]);


  // Monitor WebSocket messages
  useEffect(() => {
    if (connectionStatus.isConnected && isRealTime) {
      // WebSocket is connected, listen for messages
      // The useConnectionStatus hook already handles message routing
      setDataSource('websocket');
    }
  }, [connectionStatus.isConnected, isRealTime]);

  // Setup polling fallback
  const startPolling = useCallback(() => {
    const poll = async () => {
      const newData = await fetchData();
      if (newData) {
        // Check if data has actually changed to avoid unnecessary updates
        const dataHash = JSON.stringify(newData);
        if (dataHash !== lastPollingDataRef.current) {
          setData(newData);
          setDataSource('polling');
          setLastUpdated(new Date().toISOString());
          setIsLoading(false);
          lastPollingDataRef.current = dataHash;
        }
      } else {
        setIsLoading(false);
      }
    };

    // Initial fetch
    poll();

    // Set up interval
    pollingIntervalRef.current = setInterval(poll, pollingInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [fetchData, pollingInterval]);

  // Setup data source based on real-time preference and connection status
  useEffect(() => {
    // Clear existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (isRealTime && enableWebSocket && connectionStatus.isConnected) {
      // Use WebSocket for real-time updates
      setDataSource('websocket');
      
      // Request initial data via WebSocket
      if (connectionStatus.isConnected) {
        // Send request for current data
        // This would trigger the server to send audit-update message
      }
    } else {
      // Fallback to polling
      setDataSource('polling');
      const cleanup = startPolling();
      return cleanup;
    }
  }, [isRealTime, enableWebSocket, connectionStatus.isConnected, startPolling]);

  // Real-time control functions
  const enableRealTime = useCallback(() => {
    if (enableWebSocket) {
      setIsRealTime(true);
      localStorage.setItem('auditData.realTime', 'true');
    }
  }, [enableWebSocket]);

  const disableRealTime = useCallback(() => {
    setIsRealTime(false);
    localStorage.setItem('auditData.realTime', 'false');
  }, []);

  const toggleRealTime = useCallback(() => {
    if (isRealTime) {
      disableRealTime();
    } else {
      enableRealTime();
    }
  }, [isRealTime, enableRealTime, disableRealTime]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const newData = await fetchData();
    if (newData) {
      setData(newData);
      setLastUpdated(new Date().toISOString());
    }
    setIsLoading(false);
  }, [fetchData]);

  // Load real-time preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('auditData.realTime');
    if (savedPreference !== null) {
      setIsRealTime(savedPreference === 'true' && enableWebSocket);
    }
  }, [enableWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    isRealTime: isRealTime && enableWebSocket,
    dataSource,
    lastUpdated,
    enableRealTime,
    disableRealTime,
    toggleRealTime,
    refreshData
  };
};