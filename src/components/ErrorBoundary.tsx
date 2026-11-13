import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4">
          <div className="max-w-md w-full border border-[#141414] p-8 bg-white shadow-2xl">
            <h2 className="text-3xl font-serif italic mb-4 text-[#141414]">Something went wrong.</h2>
            <p className="text-sm opacity-70 mb-6 leading-relaxed">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="bg-[#141414] text-[#E4E3E0] p-4 text-xs font-mono overflow-auto max-h-40 mb-6">
              {this.state.error?.message}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-[#141414] text-[#E4E3E0] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
