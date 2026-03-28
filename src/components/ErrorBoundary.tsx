import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Global component to catch JavaScript errors anywhere in the child component tree.
 * Displays a fallback UI instead of crashing the entire application.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="empty-state" style={{ padding: '4rem', color: 'var(--text-dark)' }}>
          <AlertCircle size={48} style={{ color: 'var(--danger-color)', marginBottom: '1rem' }} />
          <h2>Something went wrong.</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {this.state.error?.message || "An unexpected error occurred in this component."}
          </p>
          <button 
            className="btn-primary" 
            onClick={() => window.location.reload()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RotateCcw size={16} /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
