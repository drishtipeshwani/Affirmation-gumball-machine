import React, { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  resetKey?: any;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.resetKey !== prevProps.resetKey) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card p-8 rounded-2xl border-2 border-destructive/20 shadow-xl text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6 font-serif">
              The autumn wind must have scattered our leaves. 
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="bg-secondary text-secondary-foreground px-6 py-2 rounded-full hover:brightness-110 transition-colors font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
