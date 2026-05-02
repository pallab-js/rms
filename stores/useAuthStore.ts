import { create } from "zustand"
import { dbInit, isDbReady, runMigrations, dbClose } from "@/lib/db"

interface AuthState {
  isAuthenticated: boolean
  isLocked: boolean
  isLoading: boolean
  error: string | null
  
  login: (pin: string) => Promise<void>
  logout: () => void
  checkStatus: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLocked: true,
  isLoading: false,
  error: null,

  login: async (pin: string) => {
    set({ isLoading: true, error: null })
    try {
      await dbInit(pin)
      await runMigrations()
      set({ isAuthenticated: true, isLocked: false, isLoading: false })
    } catch (err) {
      console.error("Login failed:", err)
      set({ 
        error: err instanceof Error ? err.message : "Authentication failed", 
        isLoading: false,
        isAuthenticated: false
      })
      throw err
    }
  },

  logout: async () => {
    try {
      await dbClose()
      set({ isLocked: true, isAuthenticated: false })
    } catch (err) {
      console.error("Logout failed:", err)
      // Still lock the UI
      set({ isLocked: true })
    }
  },

  checkStatus: () => {
    const ready = isDbReady()
    set({ isAuthenticated: ready, isLocked: !ready })
  }
}))
