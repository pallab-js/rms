import { create } from "zustand"
import { query, execute, buildUpdateSql } from "@/lib/db"
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
      await execute(
        "INSERT INTO restaurant_tables (table_number, capacity, section, status, shape, pos_x, pos_y) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [table.table_number, table.capacity, table.section, table.status, table.shape, table.pos_x, table.pos_y]
      )
      await get().fetchTables()
    } catch (err) {
      console.error("Failed to add table:", err)
      throw err
    }
  },

  updateTable: async (id, table) => {
    try {
      const { sql, params } = buildUpdateSql("restaurant_tables", table, id)
      await execute(sql, params)
      await get().fetchTables()
    } catch (err) {
      console.error("Failed to update table:", err)
      throw err
    }
  },

  updateTablePosition: async (id, x, y) => {
    try {
      await execute("UPDATE restaurant_tables SET pos_x = ?, pos_y = ? WHERE id = ?", [x, y, id])
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
      await execute("UPDATE restaurant_tables SET status = ? WHERE id = ?", [status, id])
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
      await execute("DELETE FROM restaurant_tables WHERE id = ?", [id])
      await get().fetchTables()
    } catch (err) {
      console.error("Failed to delete table:", err)
      throw err
    }
  },

  addReservation: async (res) => {
    try {
      await execute(
        "INSERT INTO reservations (table_id, guest_name, guest_phone, party_size, reserved_date, reserved_time, duration_min, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [res.table_id, res.guest_name, res.guest_phone, res.party_size, res.reserved_date, res.reserved_time, res.duration_min, res.status, res.notes]
      )
      await get().fetchReservations()
    } catch (err) {
      console.error("Failed to add reservation:", err)
      throw err
    }
  },

  updateReservation: async (id, res) => {
    try {
      const { sql, params } = buildUpdateSql("reservations", res, id)
      await execute(sql, params)
      await get().fetchReservations()
    } catch (err) {
      console.error("Failed to update reservation:", err)
      throw err
    }
  },

  updateReservationStatus: async (id, status) => {
    try {
      await execute("UPDATE reservations SET status = ? WHERE id = ?", [status, id])
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
      await execute("DELETE FROM reservations WHERE id = ?", [id])
      await get().fetchReservations()
    } catch (err) {
      console.error("Failed to delete reservation:", err)
      throw err
    }
  }
}))
