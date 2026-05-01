"use client"

import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw } from "lucide-react"

export function FeatureErrorBoundary({ children, name }: { children: React.ReactNode, name: string }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center bg-bg-base/30 rounded-2xl border border-dashed border-border m-8">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Something went wrong in {name}</h2>
          <p className="text-text-muted mb-6 max-w-sm">
            We encountered an unexpected error while loading this section. Your data is safe, but the view needs to be restarted.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload Module
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
