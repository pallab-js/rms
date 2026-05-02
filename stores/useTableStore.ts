import { create } from "zustand"
import { query, execute, upsert, dbDelete } from "@/lib/db"
import { RestaurantTable, Reservation, TableStatus, ReservationStatus } from "@/types"
import { format } from "date-fns"

interface TableState {
  tables: RestaurantTable[]
  reservations: Reservation[]
  isLoading: boolean
  selectedDate: string

  setSelectedDate: (date: string) => void
  fetchTables: () => Promise<void>
  fetchReservations: (date?: string) => Promise<void>

  // Table Mutations
  addTable: (table: Omit<RestaurantTable, "id">) => Promise<void>
  updateTable: (id: number, table: Partial<RestaurantTable>) => Promise<void>
  updateTablePosition: (id: number, x: number, y: number) => Promise<void>
  updateTableStatus: (id: number, status: TableStatus) => Promise<void>
  deleteTable: (id: number) => Promise<void>

  // Reservation Mutations
  addReservation: (res: Omit<Reservation, "id">) => Promise<void>
  updateReservation: (id: number, res: Partial<Reservation>) => Promise<void>
  updateReservationStatus: (id: number, status: ReservationStatus) => Promise<void>
  deleteReservation: (id: number) => Promise<void>
}

export const useTableStore = create<TableState>((set, get) => ({
  tables: [],
  reservations: [],
  isLoading: false,
  selectedDate: format(new Date(), "yyyy-MM-dd"),

  setSelectedDate: (date: string) => {
    set({ selectedDate: date })
    get().fetchReservations(date)
  },

  fetchTables: async () => {
    set({ isLoading: true })
    try {
      const rows = await query<RestaurantTable>("SELECT * FROM restaurant_tables ORDER BY table_number ASC")
      set({ tables: rows })
    } catch (err) {
      console.error("Failed to fetch tables:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchReservations: async (date?: string) => {
    const fetchDate = date || get().selectedDate
    set({ isLoading: true })
    try {
      const rows = await query<Reservation>(
        "SELECT * FROM reservations WHERE reserved_date = ? ORDER BY reserved_time ASC",
        [fetchDate]
      )
      set({ reservations: rows })
    } catch (err) {
      console.error("Failed to fetch reservations:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  addTable: async (table) => {
    try {
      await upsert("restaurant_tables", table)
      await get().fetchTables()
    } catch (err) {
      console.error("Failed to add table:", err)
      throw err
    }
  },

  updateTable: async (id, table) => {
    try {
      await upsert("restaurant_tables", table, id)
      await get().fetchTables()
    } catch (err) {
      console.error("Failed to update table:", err)
      throw err
    }
  },

  updateTablePosition: async (id, x, y) => {
    try {
      await upsert("restaurant_tables", { pos_x: x, pos_y: y }, id)
      set((state) => ({
        tables: state.tables.map(t => t.id === id ? { ...t, pos_x: x, pos_y: y } : t)
      }))
    } catch (err) {
      console.error("Failed to update table position:", err)
      throw err
    }
  },

  updateTableStatus: async (id, status) => {
    try {
      await upsert("restaurant_tables", { status }, id)
      set((state) => ({
        tables: state.tables.map(t => t.id === id ? { ...t, status } : t)
      }))
    } catch (err) {
      console.error("Failed to update table status:", err)
      throw err
    }
  },

  deleteTable: async (id) => {
    try {
      await dbDelete("restaurant_tables", id)
      await get().fetchTables()
    } catch (err) {
      console.error("Failed to delete table:", err)
      throw err
    }
  },

  addReservation: async (res) => {
    try {
      await upsert("reservations", res)
      await get().fetchReservations()
    } catch (err) {
      console.error("Failed to add reservation:", err)
      throw err
    }
  },

  updateReservation: async (id, res) => {
    try {
      await upsert("reservations", res, id)
      await get().fetchReservations()
    } catch (err) {
      console.error("Failed to update reservation:", err)
      throw err
    }
  },

  updateReservationStatus: async (id, status) => {
    try {
      await upsert("reservations", { status }, id)
      set((state) => ({
        reservations: state.reservations.map(r => r.id === id ? { ...r, status } : r)
      }))
    } catch (err) {
      console.error("Failed to update reservation status:", err)
      throw err
    }
  },

  deleteReservation: async (id) => {
    try {
      await dbDelete("reservations", id)
      await get().fetchReservations()
    } catch (err) {
      console.error("Failed to delete reservation:", err)
      throw err
    }
  }
}))
