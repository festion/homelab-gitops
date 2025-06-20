import { useEffect, useState, useCallback, useRef } from 'react';

interface FallbackSystem {
  isUsingFallback: boolean;
  fallbackReason: string;
  retryWebSocket: () => void;
  forceFallback: () => void;
  connectionQuality: 'stable' | 'unstable' | 'poor' | 'unknown';
  messageSuccessRate: number;
  lastSuccessfulConnection: string;
}

interface FallbackConfig {
  maxConnectionFailures: number;
  messageSuccessThreshold: number;
  retryInterval: number;
  qualityCheckInterval: number;
  enabled: boolean;
}

interface ConnectionMetrics {
  connectionAttempts: number;
  connectionFailures: number;
  messagesSent: number;
  messagesReceived: number;
  lastConnectionTime: number;
  consecutiveFailures: number;
}

export const useFallbackPolling = (
  isWebSocketConnected: boolean,
  connectionStatus: string,
  onForceFallback: () => void,
  onRetryWebSocket: () => void,
  config: Partial<FallbackConfig> = {}
): FallbackSystem => {
  const {
    maxConnectionFailures = 3,
    messageSuccessThreshold = 0.5, // 50% success rate minimum
    retryInterval = 30000, // 30 seconds
    qualityCheckInterval = 60000, // 1 minute
    enabled = true
  } = config;

  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState('');
  const [connectionQuality, setConnectionQuality] = useState<'stable' | 'unstable' | 'poor' | 'unknown'>('unknown');
  const [messageSuccessRate, setMessageSuccessRate] = useState(1.0);
  const [lastSuccessfulConnection, setLastSuccessfulConnection] = useState('');

  const metricsRef = useRef<ConnectionMetrics>({
    connectionAttempts: 0,
    connectionFailures: 0,
    messagesSent: 0,
    messagesReceived: 0,
    lastConnectionTime: 0,
    consecutiveFailures: 0
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const qualityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackTriggeredRef = useRef(false);

  // Track connection attempts and failures
  useEffect(() => {
    if (!enabled) return;

    const metrics = metricsRef.current;

    if (connectionStatus === 'connecting') {
      metrics.connectionAttempts++;
    } else if (connectionStatus === 'connected') {
      metrics.consecutiveFailures = 0;
      metrics.lastConnectionTime = Date.now();
      setLastSuccessfulConnection(new Date().toISOString());
      
      // If we were using fallback and now connected, potentially exit fallback
      if (isUsingFallback && !fallbackTriggeredRef.current) {
        setIsUsingFallback(false);
        setFallbackReason('');
        setConnectionQuality('stable');
      }
      fallbackTriggeredRef.current = false;
    } else if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
      metrics.connectionFailures++;
      metrics.consecutiveFailures++;
    }
  }, [connectionStatus, isUsingFallback, enabled]);

  // Monitor connection quality and trigger fallback if needed
  const checkConnectionQuality = useCallback(() => {
    if (!enabled) return;

    const metrics = metricsRef.current;
    const now = Date.now();

    // Calculate message success rate
    const successRate = metrics.messagesSent > 0 
      ? metrics.messagesReceived / metrics.messagesSent 
      : 1.0;
    setMessageSuccessRate(successRate);

    // Determine connection quality
    let quality: 'stable' | 'unstable' | 'poor' | 'unknown' = 'unknown';
    
    if (isWebSocketConnected) {
      if (successRate >= 0.9 && metrics.consecutiveFailures === 0) {
        quality = 'stable';
      } else if (successRate >= messageSuccessThreshold && metrics.consecutiveFailures < 2) {
        quality = 'unstable';
      } else {
        quality = 'poor';
      }
    } else {
      quality = 'poor';
    }
    
    setConnectionQuality(quality);

    // Trigger fallback conditions
    const shouldTriggerFallback = 
      metrics.consecutiveFailures >= maxConnectionFailures ||
      (successRate < messageSuccessThreshold && metrics.messagesSent > 5) ||
      (!isWebSocketConnected && (now - metrics.lastConnectionTime) > retryInterval * 2);

    if (shouldTriggerFallback && !isUsingFallback) {
      triggerFallback(
        metrics.consecutiveFailures >= maxConnectionFailures 
          ? `Connection failed ${metrics.consecutiveFailures} times consecutively`
          : successRate < messageSuccessThreshold
          ? `Poor message success rate: ${(successRate * 100).toFixed(1)}%`
          : 'Connection instability detected'
      );
    }
  }, [
    enabled, 
    isWebSocketConnected, 
    maxConnectionFailures, 
    messageSuccessThreshold, 
    retryInterval, 
    isUsingFallback
  ]);

  // Trigger fallback mode
  const triggerFallback = useCallback((reason: string) => {
    console.warn(`Triggering fallback to polling: ${reason}`);
    setIsUsingFallback(true);
    setFallbackReason(reason);
    fallbackTriggeredRef.current = true;
    onForceFallback();
  }, [onForceFallback]);

  // Manual fallback trigger
  const forceFallback = useCallback(() => {
    triggerFallback('Manual fallback requested');
  }, [triggerFallback]);

  // Retry WebSocket connection
  const retryWebSocket = useCallback(() => {
    if (!enabled) return;

    console.log('Retrying WebSocket connection...');
    
    // Reset some metrics for fresh start
    const metrics = metricsRef.current;
    metrics.consecutiveFailures = 0;
    
    // Clear existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    onRetryWebSocket();
  }, [enabled, onRetryWebSocket]);

  // Automatic retry mechanism
  useEffect(() => {
    if (!enabled || !isUsingFallback) return;

    // Set up automatic retry
    retryTimeoutRef.current = setTimeout(() => {
      console.log('Automatic WebSocket retry attempt...');
      retryWebSocket();
    }, retryInterval);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [isUsingFallback, retryInterval, retryWebSocket, enabled]);

  // Set up quality monitoring
  useEffect(() => {
    if (!enabled) return;

    qualityCheckIntervalRef.current = setInterval(checkConnectionQuality, qualityCheckInterval);

    return () => {
      if (qualityCheckIntervalRef.current) {
        clearInterval(qualityCheckIntervalRef.current);
        qualityCheckIntervalRef.current = null;
      }
    };
  }, [checkConnectionQuality, qualityCheckInterval, enabled]);

  // Message tracking functions (to be called by parent components)
  const trackMessageSent = useCallback(() => {
    if (enabled) {
      metricsRef.current.messagesSent++;
    }
  }, [enabled]);

  const trackMessageReceived = useCallback(() => {
    if (enabled) {
      metricsRef.current.messagesReceived++;
    }
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (qualityCheckIntervalRef.current) {
        clearInterval(qualityCheckIntervalRef.current);
      }
    };
  }, []);

  // Expose tracking functions through the hook
  const fallbackSystem: FallbackSystem & { 
    trackMessageSent: () => void;
    trackMessageReceived: () => void;
  } = {
    isUsingFallback,
    fallbackReason,
    retryWebSocket,
    forceFallback,
    connectionQuality,
    messageSuccessRate,
    lastSuccessfulConnection,
    trackMessageSent,
    trackMessageReceived
  };

  return fallbackSystem;
};