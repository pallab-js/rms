import { create } from "zustand"
import { dbInit, isDbReady } from "@/lib/db"

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

  logout: () => {
    // Note: Full logout would require closing the DB connection in Rust
    // For now, we just lock the UI
    set({ isLocked: true })
  },

  checkStatus: () => {
    const ready = isDbReady()
    set({ isAuthenticated: ready, isLocked: !ready })
  }
}))
