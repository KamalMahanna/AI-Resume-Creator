import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || 'Unknown frontend error' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Frontend crash:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#fff', background: '#111', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Frontend crashed</h2>
          <p>{this.state.errorMessage}</p>
          <p>Open browser console for full stack trace.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
