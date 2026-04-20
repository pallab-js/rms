import { create } from "zustand"
import { query } from "@/lib/db"
import { DashboardStats, Order, Reservation, HourlySales } from "@/types"
import { format, subDays, startOfDay, endOfDay } from "date-fns"

interface DashboardState {
  stats: DashboardStats
  isLoading: boolean
  fetchDashboardStats: () => Promise<void>
}

const initialStats: DashboardStats = {
  today_revenue: 0,
  yesterday_revenue: 0,
  active_orders: 0,
  pending_orders: 0,
  tables_occupied: 0,
  total_tables: 0,
  covers_today: 0,
  avg_order_value: 0,
  hourly_sales: [],
  recent_orders: [],
  low_stock_count: 0,
  upcoming_reservations: []
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: initialStats,
  isLoading: false,

  fetchDashboardStats: async () => {
    set({ isLoading: true })
    const today = format(new Date(), "yyyy-MM-dd")
    const todayStart = format(startOfDay(new Date()), "yyyy-MM-dd HH:mm:ss")
    const todayEnd = format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss")

    try {
      // 1. Today's Revenue
      const todayRevRows = await query<{ rev: number }>(`
        SELECT SUM(total) as rev FROM orders 
        WHERE status = 'completed' AND created_at BETWEEN ? AND ?
      `, [todayStart, todayEnd])
      
      // 2. Yesterday's Revenue
      const yesterdayStart = format(startOfDay(subDays(new Date(), 1)), "yyyy-MM-dd HH:mm:ss")
      const yesterdayEnd = format(endOfDay(subDays(new Date(), 1)), "yyyy-MM-dd HH:mm:ss")
      const yesterdayRevRows = await query<{ rev: number }>(`
        SELECT SUM(total) as rev FROM orders 
        WHERE status = 'completed' AND created_at BETWEEN ? AND ?
      `, [yesterdayStart, yesterdayEnd])

      // 3. Active & Pending Orders
      const activeRows = await query<{ count: number }>("SELECT COUNT(*) as count FROM orders WHERE status NOT IN ('completed', 'cancelled')")
      const pendingRows = await query<{ count: number }>("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'")

      // 4. Tables
      const occupiedRows = await query<{ count: number }>("SELECT COUNT(*) as count FROM restaurant_tables WHERE status = 'occupied'")
      const totalTablesRows = await query<{ count: number }>("SELECT COUNT(*) as count FROM restaurant_tables")

      // 5. Hourly Sales
      const hourlyRows = await query<HourlySales>(`
        SELECT strftime('%H', created_at) as hour, SUM(total) as revenue 
        FROM orders 
        WHERE status = 'completed' AND created_at BETWEEN ? AND ?
        GROUP BY hour 
        ORDER BY hour ASC
      `, [todayStart, todayEnd])

      // 6. Recent Orders
      const recentRows = await query<Order>(`
        SELECT * FROM orders 
        ORDER BY created_at DESC LIMIT 5
      `)

      // 7. Low Stock Count
      const lowStockRows = await query<{ count: number }>("SELECT COUNT(*) as count FROM inventory_items WHERE current_stock <= min_stock_alert")

      // 8. Upcoming Reservations
      const resRows = await query<Reservation>(`
        SELECT * FROM reservations 
        WHERE reserved_date = ? AND status = 'confirmed' 
        ORDER BY reserved_time ASC LIMIT 3
      `, [today])

      // 9. Covers Today
      const coversRows = await query<{ count: number }>(`
        SELECT SUM(party_size) as count FROM orders 
        WHERE status = 'completed' AND created_at BETWEEN ? AND ?
      `, [todayStart, todayEnd])

      set({
        stats: {
          today_revenue: todayRevRows[0]?.rev || 0,
          yesterday_revenue: yesterdayRevRows[0]?.rev || 0,
          active_orders: activeRows[0]?.count || 0,
          pending_orders: pendingRows[0]?.count || 0,
          tables_occupied: occupiedRows[0]?.count || 0,
          total_tables: totalTablesRows[0]?.count || 0,
          covers_today: coversRows[0]?.count || 0,
          avg_order_value: todayRevRows[0]?.rev ? (todayRevRows[0].rev / (recentRows.length || 1)) : 0,
          hourly_sales: hourlyRows,
          recent_orders: recentRows,
          low_stock_count: lowStockRows[0]?.count || 0,
          upcoming_reservations: resRows
        }
      })
    } catch (err) {
      console.error("Dashboard stats fetch failed:", err)
    } finally {
      set({ isLoading: false })
    }
  }
}))
