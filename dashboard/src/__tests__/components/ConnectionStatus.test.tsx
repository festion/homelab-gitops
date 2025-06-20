import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConnectionStatus } from '../../components/ConnectionStatus';

describe('ConnectionStatus', () => {
  const defaultProps = {
    status: 'connected' as const,
    latency: 50,
    clientCount: 3,
    uptime: 3600,
    lastUpdate: '2025-01-01T00:00:00Z',
    connectionQuality: 'excellent' as const,
    onReconnect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render connected status correctly', () => {
    render(<ConnectionStatus {...defaultProps} />);

    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('50ms')).toBeInTheDocument();
    expect(screen.getByText('3 clients')).toBeInTheDocument();
    expect(screen.getByText('1h uptime')).toBeInTheDocument();
  });

  it('should render connecting status with animation', () => {
    render(
      <ConnectionStatus 
        {...defaultProps} 
        status="connecting" 
        latency={0}
      />
    );

    expect(screen.getByText('Connecting...')).toBeInTheDocument();
    
    // Should have animated pulse effect
    const statusDot = document.querySelector('.animate-pulse');
    expect(statusDot).toBeInTheDocument();
  });

  it('should render disconnected status with retry button', () => {
    const onReconnect = jest.fn();
    render(
      <ConnectionStatus 
        {...defaultProps} 
        status="disconnected" 
        onReconnect={onReconnect}
      />
    );

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it('should render error status with retry button', () => {
    const onReconnect = jest.fn();
    render(
      <ConnectionStatus 
        {...defaultProps} 
        status="error" 
        onReconnect={onReconnect}
      />
    );

    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it('should format uptime correctly', () => {
    const { rerender } = render(
      <ConnectionStatus {...defaultProps} uptime={30} />
    );
    expect(screen.getByText('30s uptime')).toBeInTheDocument();

    rerender(<ConnectionStatus {...defaultProps} uptime={150} />);
    expect(screen.getByText('2m uptime')).toBeInTheDocument();

    rerender(<ConnectionStatus {...defaultProps} uptime={7200} />);
    expect(screen.getByText('2h uptime')).toBeInTheDocument();

    rerender(<ConnectionStatus {...defaultProps} uptime={172800} />);
    expect(screen.getByText('2d uptime')).toBeInTheDocument();
  });

  it('should format last update time correctly', () => {
    const now = new Date('2025-01-01T12:00:00Z');
    jest.spyOn(Date, 'now').mockImplementation(() => now.getTime());

    const { rerender } = render(
      <ConnectionStatus 
        {...defaultProps} 
        lastUpdate="2025-01-01T11:59:30Z" 
      />
    );
    expect(screen.getByText('Updated 30s ago')).toBeInTheDocument();

    rerender(
      <ConnectionStatus 
        {...defaultProps} 
        lastUpdate="2025-01-01T11:58:00Z" 
      />
    );
    expect(screen.getByText('Updated 2m ago')).toBeInTheDocument();

    rerender(
      <ConnectionStatus 
        {...defaultProps} 
        lastUpdate="2025-01-01T10:00:00Z" 
      />
    );
    // Should show actual time for older updates
    expect(screen.getByText(/10:00:00/)).toBeInTheDocument();

    jest.restoreAllMocks();
  });

  it('should show tooltip with detailed information on hover', async () => {
    render(<ConnectionStatus {...defaultProps} />);

    const infoButton = screen.getByText('?');
    fireEvent.mouseEnter(infoButton);

    await waitFor(() => {
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('Latency:')).toBeInTheDocument();
      expect(screen.getByText('50ms')).toBeInTheDocument();
      expect(screen.getByText('Quality:')).toBeInTheDocument();
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });
  });

  it('should display connection quality colors correctly', () => {
    const { rerender } = render(
      <ConnectionStatus {...defaultProps} connectionQuality="excellent" />
    );
    expect(screen.getByText('50ms')).toHaveClass('text-green-600');

    rerender(<ConnectionStatus {...defaultProps} connectionQuality="good" />);
    expect(screen.getByText('50ms')).toHaveClass('text-yellow-600');

    rerender(<ConnectionStatus {...defaultProps} connectionQuality="poor" />);
    expect(screen.getByText('50ms')).toHaveClass('text-red-600');

    rerender(<ConnectionStatus {...defaultProps} connectionQuality="unknown" />);
    expect(screen.getByText('50ms')).toHaveClass('text-gray-600');
  });

  it('should handle missing optional props gracefully', () => {
    render(
      <ConnectionStatus 
        status="connected"
        onReconnect={jest.fn()}
      />
    );

    expect(screen.getByText('Connected')).toBeInTheDocument();
    
    // Should not crash with missing optional props
    expect(screen.queryByText('0ms')).toBeInTheDocument();
    expect(screen.queryByText('0 clients')).toBeInTheDocument();
  });

  it('should handle invalid lastUpdate gracefully', () => {
    render(
      <ConnectionStatus 
        {...defaultProps} 
        lastUpdate="invalid-date"
      />
    );

    expect(screen.getByText('Updated Invalid time')).toBeInTheDocument();
  });

  it('should not show retry button when onReconnect is not provided', () => {
    render(
      <ConnectionStatus 
        {...defaultProps} 
        status="disconnected"
        onReconnect={undefined}
      />
    );

    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ConnectionStatus 
        {...defaultProps} 
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle empty lastUpdate', () => {
    render(
      <ConnectionStatus 
        {...defaultProps} 
        lastUpdate=""
      />
    );

    expect(screen.getByText('Updated Never')).toBeInTheDocument();
  });

  it('should show appropriate tooltips for disconnected state', async () => {
    render(
      <ConnectionStatus 
        {...defaultProps} 
        status="disconnected"
        onReconnect={jest.fn()}
      />
    );

    const infoButton = screen.getByText('?');
    fireEvent.mouseEnter(infoButton);

    await waitFor(() => {
      expect(screen.getByText('Click retry to attempt reconnection')).toBeInTheDocument();
    });
  });

  it('should handle very large uptime values', () => {
    render(
      <ConnectionStatus 
        {...defaultProps} 
        uptime={604800} // 1 week in seconds
      />
    );

    expect(screen.getByText('7d uptime')).toBeInTheDocument();
  });

  it('should show correct status colors for different states', () => {
    const { rerender, container } = render(
      <ConnectionStatus {...defaultProps} status="connected" />
    );
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument();

    rerender(<ConnectionStatus {...defaultProps} status="connecting" />);
    expect(container.querySelector('.bg-yellow-500')).toBeInTheDocument();

    rerender(<ConnectionStatus {...defaultProps} status="disconnected" />);
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument();

    rerender(<ConnectionStatus {...defaultProps} status="error" />);
    expect(container.querySelector('.bg-orange-500')).toBeInTheDocument();
  });
});