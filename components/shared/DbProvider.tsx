"use client"

import React, { useEffect, useState } from "react"
import { runMigrations, query } from "@/lib/db"
import { useSettingsStore } from "@/stores/useSettingsStore"

export default function DbProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    
    runMigrations()
      .then(async () => {
        if (mounted) {
          const existing = await query<{key: string}>("SELECT key FROM settings LIMIT 1")
          if (existing.length === 0) {
            await useSettingsStore.getState().seedDefaults()
          }
          await useSettingsStore.getState().fetchSettings()
          setReady(true)
        }
      })
      .catch(err => {
        console.error("Failed to run migrations:", err)
        if (mounted) setError(err.message || String(err))
      })

    return () => {
      mounted = false
    }
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-background p-6 text-center">
        <h1 className="text-xl font-bold text-destructive mb-2">Database Initialization Error</h1>
        <p className="text-muted-foreground mb-4 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-background space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse">Initializing Database...</p>
      </div>
    )
  }

  return <>{children}</>
}
