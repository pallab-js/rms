"use client"

import React, { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { LockScreen } from "@/components/auth/LockScreen"

export default function DbProvider({ children }: { children: React.ReactNode }) {
  const { isLocked, isAuthenticated } = useAuthStore()
  const [fetching, setFetching] = useState(() => isAuthenticated && !isLocked)

  useEffect(() => {
    if (isAuthenticated && !isLocked) {
      let cancelled = false
      useSettingsStore.getState().fetchSettings()
        .finally(() => { if (!cancelled) setFetching(false) })
      return () => { cancelled = true }
    }
  }, [isAuthenticated, isLocked])

  if (isLocked) {
    return <LockScreen />
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-background space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse">Loading settings...</p>
      </div>
    )
  }

  return <>{children}</>
}
