import React, { Component, ErrorInfo, ReactNode } from "react";
import { resolveDashboardRoute, normalizeRole } from "@/lib/roleResolver";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[AuthErrorBoundary] Render failure caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    const userStr = localStorage.getItem("cms_user");
    let role: string | null = null;
    if (userStr) {
      try {
        role = JSON.parse(userStr).role;
      } catch {}
    }
    if (!role) {
      role = localStorage.getItem("campusly.role");
    }

    const targetRoute = resolveDashboardRoute(normalizeRole(role));
    window.location.href = targetRoute;
  };

  private handleLogout = () => {
    localStorage.removeItem("cms_token");
    localStorage.removeItem("cms_user");
    localStorage.removeItem("campusly.role");
    window.location.href = "/login";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-100">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-6">
            <div className="size-16 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                An unexpected error occurred while displaying this page.
              </p>
            </div>

            {process.env.NODE_ENV !== "production" && this.state.error && (
              <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg text-left text-xs font-mono overflow-auto max-h-32 text-red-600 dark:text-red-400 border border-slate-200 dark:border-slate-800">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleRetry}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-sm"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
              >
                Go to Dashboard
              </button>
              <button
                onClick={this.handleLogout}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 font-medium text-sm transition"
              >
                Re-login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
