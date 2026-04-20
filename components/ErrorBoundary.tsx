"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg" role="alert">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-danger font-medium">Data Loading Error</h3>
              <p className="text-sm text-text-muted mt-1">
                {this.state.error?.message || "Failed to load data from database."}
              </p>
              {process.env.NODE_ENV === "development" && this.state.error?.stack && (
                <pre className="mt-2 text-xs text-text-subtle overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
            <button
              onClick={this.handleRetry}
              className="px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-bg-base rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}