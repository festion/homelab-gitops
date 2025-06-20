import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Wifi, Database } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onFallbackMode?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
}

export class WebSocketErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WebSocket Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the error callback if provided
    this.props.onError?.(error, errorInfo);

    // Auto-retry for WebSocket-related errors
    if (this.isWebSocketError(error) && this.state.retryCount < this.maxRetries) {
      this.handleAutoRetry();
    } else if (this.state.retryCount >= this.maxRetries) {
      // If max retries exceeded, suggest fallback mode
      console.warn('Max retries exceeded, suggesting fallback mode');
      this.props.onFallbackMode?.();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private isWebSocketError(error: Error): boolean {
    const webSocketErrorPatterns = [
      /websocket/i,
      /connection.*failed/i,
      /network.*error/i,
      /conn.*refused/i,
      /timeout/i
    ];

    return webSocketErrorPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  private handleAutoRetry = () => {
    if (this.state.retryCount >= this.maxRetries) return;

    this.setState({ isRetrying: true });

    const retryDelay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
    
    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isRetrying: false
      }));

      this.props.onRetry?.();
    }, retryDelay);
  };

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    });

    this.props.onRetry?.();
  };

  private handleFallbackMode = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    });

    this.props.onFallbackMode?.();
  };

  private getErrorSeverity = (): 'low' | 'medium' | 'high' => {
    if (!this.state.error) return 'low';

    if (this.isWebSocketError(this.state.error)) {
      return this.state.retryCount >= this.maxRetries ? 'high' : 'medium';
    }

    // Check for critical errors
    if (this.state.error.message.includes('memory') || 
        this.state.error.message.includes('stack overflow')) {
      return 'high';
    }

    return 'medium';
  };

  private getErrorCategory = (): string => {
    if (!this.state.error) return 'Unknown';

    if (this.isWebSocketError(this.state.error)) {
      return 'Connection Error';
    }

    if (this.state.error.name === 'TypeError') {
      return 'Data Processing Error';
    }

    if (this.state.error.name === 'ReferenceError') {
      return 'Component Error';
    }

    return 'Application Error';
  };

  render() {
    if (this.state.hasError) {
      const severity = this.getErrorSeverity();
      const category = this.getErrorCategory();

      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            {/* Error Icon and Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${
                severity === 'high' ? 'bg-red-100' : 
                severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  severity === 'high' ? 'text-red-600' : 
                  severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Connection Issue
                </h2>
                <p className="text-sm text-gray-600">{category}</p>
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                The dashboard encountered a connection problem and needs to recover.
              </p>
              
              {this.state.retryCount > 0 && (
                <p className="text-sm text-gray-600">
                  Retry attempts: {this.state.retryCount}/{this.maxRetries}
                </p>
              )}

              {this.state.isRetrying && (
                <div className="flex items-center gap-2 mt-3 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Retrying connection...</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!this.state.isRetrying && (
                <>
                  <button
                    onClick={this.handleManualRetry}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>

                  <button
                    onClick={this.handleFallbackMode}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Database className="w-4 h-4" />
                    Use Fallback Mode
                  </button>
                </>
              )}
            </div>

            {/* Technical Details (expandable) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 p-3 bg-gray-50 rounded-md">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  Technical Details
                </summary>
                <div className="mt-2 text-xs font-mono text-gray-600 whitespace-pre-wrap">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.name}
                  </div>
                  <div className="mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 text-xs overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Recovery Tips */}
            <div className="mt-6 p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Recovery Tips:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your internet connection</li>
                <li>• Refresh the page if problems persist</li>
                <li>• Use fallback mode for continued access</li>
                {this.state.retryCount >= this.maxRetries && (
                  <li>• Contact support if issues continue</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}