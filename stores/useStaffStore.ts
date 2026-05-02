import { create } from "zustand"
import { query, execute, upsert, dbDelete } from "@/lib/db"
import { Staff, AttendanceRecord } from "@/types"
import { format } from "date-fns"

interface StaffState {
  staff: Staff[]
  attendance: AttendanceRecord[]
  isLoading: boolean
  selectedDate: string
  selectedMonth: string

  fetchStaff: (activeOnly?: boolean) => Promise<void>
  fetchAttendance: (date?: string) => Promise<void>
  setSelectedDate: (date: string) => void
  setSelectedMonth: (month: string) => void

  // Staff Actions
  addStaff: (member: Omit<Staff, "id" | "created_at" | "is_active">) => Promise<void>
  updateStaff: (id: number, member: Partial<Staff>) => Promise<void>
  deleteStaff: (id: number) => Promise<void>

  // Attendance Actions
  markAttendance: (record: Omit<AttendanceRecord, "id">) => Promise<void>
  markAllPresent: (date: string) => Promise<void>
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staff: [],
  attendance: [],
  isLoading: false,
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  selectedMonth: format(new Date(), "yyyy-MM"),

  setSelectedDate: (date) => {
    set({ selectedDate: date })
    get().fetchAttendance(date)
  },

  setSelectedMonth: (month) => set({ selectedMonth: month }),

  fetchStaff: async (activeOnly = false) => {
    set({ isLoading: true })
    try {
      let sql = "SELECT * FROM staff"
      if (activeOnly) sql += " WHERE is_active = 1"
      sql += " ORDER BY name ASC"
      
      const rows = await query<Staff>(sql)
      set({ staff: rows.map(r => ({ ...r, is_active: Boolean(r.is_active) })) })
    } catch (err) {
      console.error("Failed to fetch staff:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAttendance: async (date) => {
    const fetchDate = date || get().selectedDate
    set({ isLoading: true })
    try {
      const rows = await query<AttendanceRecord>(`
        SELECT a.*, s.name as staff_name, s.role 
        FROM attendance a 
        JOIN staff s ON a.staff_id = s.id 
        WHERE a.date = ?
      `, [fetchDate])
      set({ attendance: rows })
    } catch (err) {
      console.error("Failed to fetch attendance:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  addStaff: async (member) => {
    await upsert("staff", { ...member, is_active: 1 })
    await get().fetchStaff()
  },

  updateStaff: async (id, member) => {
    await upsert("staff", member, id)
    await get().fetchStaff()
  },

  deleteStaff: async (id) => {
    await dbDelete("staff", id)
    await get().fetchStaff()
  },

  markAttendance: async (record) => {
    try {
      await execute(`
        INSERT INTO attendance (staff_id, date, check_in, check_out, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(staff_id, date) DO UPDATE SET
          check_in = excluded.check_in,
          check_out = excluded.check_out,
          status = excluded.status,
          notes = excluded.notes
      `, [record.staff_id, record.date, record.check_in, record.check_out, record.status, record.notes])
      await get().fetchAttendance(record.date)
    } catch (err) {
      console.error("Attendance failed:", err)
      throw err
    }
  },

  markAllPresent: async (date) => {
    const { staff } = get()
    for (const member of staff) {
      if (!member.is_active) continue
      await execute(`
        INSERT INTO attendance (staff_id, date, status, check_in)
        VALUES (?, ?, 'present', '09:00')
        ON CONFLICT(staff_id, date) DO NOTHING
      `, [member.id, date])
    }
    await get().fetchAttendance(date)
  }
}))
