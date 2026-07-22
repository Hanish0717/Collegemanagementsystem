import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * HODErrorBoundary — wraps each HOD page individually so a crash in one page
 * never triggers the global "This page didn't load" screen from TanStack Router.
 */
export class HODErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[HOD Module] Page error in ${this.props.pageName || 'unknown'}:`, error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="size-14 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 grid place-items-center mx-auto">
              <AlertTriangle className="size-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {this.props.pageName || 'This page'} failed to load
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                A rendering error occurred. Your data is safe — click retry to reload.
              </p>
              {this.state.error && (
                <p className="mt-2 text-xs text-rose-500 font-mono bg-rose-50 dark:bg-rose-950/30 rounded-lg p-2 text-left truncate">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition cursor-pointer"
            >
              <RefreshCw className="size-4" />
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
