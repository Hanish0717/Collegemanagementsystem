import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * PlacementErrorBoundary — wraps each Placement Coordinator page individually so any rendering error
 * displays a localized error card instead of triggering the global "This page didn't load" screen.
 */
export class PlacementErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[Placement Module] Page error in ${this.props.pageName || "Placement Drives"}:`, error, info);
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
                {this.props.pageName || "Placement Page"} encountered a rendering issue
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your data is safe — click retry below to refresh the page.
              </p>
              {this.state.error && (
                <div className="mt-3 text-xs text-rose-500 font-mono bg-rose-50 dark:bg-rose-950/30 rounded-xl p-3 text-left overflow-auto max-h-32">
                  <div className="font-bold">{this.state.error.name}: {this.state.error.message}</div>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                this.handleReset();
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-semibold transition cursor-pointer"
            >
              <RefreshCw className="size-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
