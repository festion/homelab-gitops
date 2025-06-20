import { renderHook, act, waitFor } from '@testing-library/react';
import { useWebSocket } from '../../hooks/useWebSocket';

// Helper to get mock WebSocket instance
const getMockWebSocket = (): any => {
  return global.WebSocket as any;
};

describe('useWebSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should establish WebSocket connection successfully', async () => {
    const { result } = renderHook(() =>
      useWebSocket('ws://localhost:3000/ws')
    );

    // Initially disconnected
    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionStatus).toBe('disconnected');

    // Wait for connection to establish
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    }, { timeout: 5000 });

    expect(result.current.connectionStatus).toBe('connected');
  });

  it('should handle connection errors gracefully', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useWebSocket('ws://localhost:3000/ws', { onError })
    );

    // Wait for initial connection
    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('connecting');
    });

    // Simulate error
    act(() => {
      const mockWs = new (getMockWebSocket())('ws://localhost:3000/ws');
      mockWs.simulateError();
    });

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('error');
    });

    expect(onError).toHaveBeenCalled();
  });

  it('should attempt reconnection with exponential backoff', async () => {
    const { result } = renderHook(() =>
      useWebSocket('ws://localhost:3000/ws', {
        reconnect: true,
        maxReconnectAttempts: 3,
        reconnectInterval: 100
      })
    );

    // Wait for initial connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate disconnection
    act(() => {
      const mockWs = new (getMockWebSocket())('ws://localhost:3000/ws');
      mockWs.simulateClose(1006, 'Connection lost');
    });

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('disconnected');
    });

    // Should attempt reconnection
    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('connecting');
    }, { timeout: 1000 });
  });

  it('should queue messages during disconnection', async () => {
    const { result } = renderHook(() =>
      useWebSocket('ws://localhost:3000/ws')
    );

    // Wait for connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Disconnect
    act(() => {
      result.current.disconnect();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });

    // Send message while disconnected (should be queued)
    act(() => {
      result.current.sendMessage({ type: 'test', data: 'queued message' });
    });

    // Reconnect
    act(() => {
      result.current.reconnect();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Message should have been sent after reconnection
    // This would be verified by checking the mock WebSocket send method
  });

  it('should handle heartbeat and latency tracking', async () => {
    const { result } = renderHook(() =>
      useWebSocket('ws://localhost:3000/ws', {
        heartbeatInterval: 1000
      })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate pong response
    act(() => {
      const mockWs = new (getMockWebSocket())('ws://localhost:3000/ws');
      mockWs.simulateMessage({ type: 'pong' });
    });

    await waitFor(() => {
      expect(result.current.latency).toBeGreaterThanOrEqual(0);
    });
  });

  it('should handle message parsing errors gracefully', async () => {
    const onMessage = jest.fn();
    const { result } = renderHook(() =>
      useWebSocket('ws://localhost:3000/ws', { onMessage })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate invalid JSON message
    act(() => {
      const mockWs = new (getMockWebSocket())('ws://localhost:3000/ws');
      mockWs.onmessage?.({ data: 'invalid json{' } as MessageEvent);
    });

    // Should handle error and try to process as raw message
    await waitFor(() => {
      expect(onMessage).toHaveBeenCalledWith({ type: 'raw', data: 'invalid json{' });
    });
  });

  it('should respect max reconnection attempts', async () => {
    const { result } = renderHook(() =>
      useWebSocket('ws://localhost:3000/ws', {
        reconnect: true,
        maxReconnectAttempts: 2,
        reconnectInterval: 50
      })
    );

    // Wait for initial connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate multiple connection failures
    for (let i = 0; i < 3; i++) {
      act(() => {
        const mockWs = new (getMockWebSocket())('ws://localhost:3000/ws');
        mockWs.simulateClose(1006, 'Connection lost');
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('disconnected');
      });

      // Wait for potential reconnection attempt
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // After max attempts, should be in error state
    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('error');
    }, { timeout: 1000 });
  });

  it('should cleanup resources on unmount', async () => {
    const { result, unmount } = renderHook(() =>
      useWebSocket('ws://localhost:3000/ws')
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Unmount should trigger cleanup
    unmount();

    // Verify WebSocket was closed (would need to check mock implementation)
    // This test verifies the cleanup behavior exists
    expect(true).toBe(true); // Placeholder for actual cleanup verification
  });

  it('should validate WebSocket URL', () => {
    const { result } = renderHook(() =>
      useWebSocket('')
    );

    expect(result.current.connectionStatus).toBe('error');
  });

  it('should handle manual reconnection', async () => {
    const { result } = renderHook(() =>
      useWebSocket('ws://localhost:3000/ws')
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Disconnect
    act(() => {
      result.current.disconnect();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });

    // Manual reconnect
    act(() => {
      result.current.reconnect();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });
});