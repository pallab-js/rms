import { create } from "zustand"
import { query, execute } from "@/lib/db"
import { SettingsData, SettingEntry } from "@/types"

interface SettingsState {
  settings: SettingsData
  isLoading: boolean
  
  fetchSettings: () => Promise<void>
  updateSetting: (key: keyof SettingsData, value: string | number | boolean) => Promise<void>
  updateMultipleSettings: (data: Partial<SettingsData>) => Promise<void>
}

const defaultSettings: SettingsData = {
  restaurant_name: "The Golden Fork",
  address: "123 Food Street, Guwahati, Assam 781001",
  phone: "+91 98765 43210",
  email: "contact@goldenfork.com",
  currency_symbol: "₹",
  tax_rate: 5,
  tax_label: "GST",
  tax_inclusive: false,
  receipt_header: "Welcome to The Golden Fork",
  receipt_footer: "Thank you for dining with us!",
  timezone: "Asia/Kolkata",
  order_prefix: "ORD",
  default_order_type: "dine_in",
  auto_refresh_interval: 30,
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true })
    try {
      const rows = await query<SettingEntry>("SELECT key, value FROM settings")
      const settingsMap = { ...defaultSettings }
      
      rows.forEach(row => {
        const key = row.key as keyof SettingsData
        if (key in settingsMap) {
          const value = row.value
          if (key === "tax_rate" || key === "auto_refresh_interval") {
            settingsMap[key] = Number(value)
          } else if (key === "tax_inclusive") {
            settingsMap[key] = value === "1"
          } else {
            // @ts-expect-error - dynamic key assignment
            settingsMap[key] = value
          }
        }
      })
      
      set({ settings: settingsMap })
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      set({ isLoading: false })
    }
  },

  updateSetting: async (key, value) => {
    try {
      const dbValue = typeof value === "boolean" ? (value ? "1" : "0") : String(value)
      await execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, dbValue])
      set((state) => ({
        settings: { ...state.settings, [key]: value }
      }))
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error)
      throw error
    }
  },

  updateMultipleSettings: async (data) => {
    try {
      for (const [key, value] of Object.entries(data)) {
        const dbValue = typeof value === "boolean" ? (value ? "1" : "0") : String(value)
        await execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, dbValue])
      }
      set((state) => ({
        settings: { ...state.settings, ...data }
      }))
    } catch (error) {
      console.error("Failed to update multiple settings:", error)
      throw error
    }
  }
}))
