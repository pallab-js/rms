import { create } from "zustand"
import { query, execute, upsert, dbDelete } from "@/lib/db"
import { 
  Expense, 
  SalesSummary, 
  HourlySales, 
  OrderTypeSplit, 
  PaymentMethodSplit, 
  MenuItemPerformance 
} from "@/types"
import { format, startOfDay, endOfDay } from "date-fns"

interface ReportState {
  expenses: Expense[]
  salesSummary: SalesSummary
  hourlySales: HourlySales[]
  orderTypeSplit: OrderTypeSplit[]
  paymentMethodSplit: PaymentMethodSplit[]
  menuPerformance: MenuItemPerformance[]
  isLoading: boolean
  dateRange: { start: string, end: string }

  setDateRange: (start: string, end: string) => void
  fetchSalesReport: () => Promise<void>
  fetchMenuPerformance: () => Promise<void>
  fetchExpenses: () => Promise<void>
  addExpense: (expense: Omit<Expense, "id" | "created_at">) => Promise<void>
  deleteExpense: (id: number) => Promise<void>
}

export const useReportStore = create<ReportState>((set, get) => ({
  expenses: [],
  salesSummary: {
    total_revenue: 0,
    total_orders: 0,
    avg_order_value: 0,
    total_tax: 0,
    total_discount: 0
  },
  hourlySales: [],
  orderTypeSplit: [],
  paymentMethodSplit: [],
  menuPerformance: [],
  isLoading: false,
  dateRange: {
    start: format(startOfDay(new Date()), "yyyy-MM-dd HH:mm:ss"),
    end: format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss")
  },

  setDateRange: (start, end) => {
    set({ dateRange: { start, end } })
    get().fetchSalesReport()
    get().fetchMenuPerformance()
    get().fetchExpenses()
  },

  fetchSalesReport: async () => {
    set({ isLoading: true })
    const { start, end } = get().dateRange
    try {
      // 1. Summary
      const summaryRows = await query<SalesSummary>(`
        SELECT 
          COALESCE(SUM(total), 0) as total_revenue, 
          COUNT(*) as total_orders,
          COALESCE(AVG(total), 0) as avg_order_value,
          COALESCE(SUM(tax_amount), 0) as total_tax,
          COALESCE(SUM(discount_val), 0) as total_discount
        FROM orders 
        WHERE status = 'completed' AND created_at BETWEEN ? AND ?
      `, [start, end])
      
      const summary = summaryRows[0]

      // 2. Hourly
      const hourlyRows = await query<HourlySales>(`
        SELECT strftime('%H', created_at) as hour, SUM(total) as revenue 
        FROM orders 
        WHERE status = 'completed' AND created_at BETWEEN ? AND ?
        GROUP BY hour 
        ORDER BY hour ASC
      `, [start, end])

      // 3. Order Type
      const typeRows = await query<OrderTypeSplit>(`
        SELECT order_type as type, SUM(total) as revenue 
        FROM orders 
        WHERE status = 'completed' AND created_at BETWEEN ? AND ?
        GROUP BY type
      `, [start, end])

      // 4. Payment Method
      const paymentRows = await query<PaymentMethodSplit>(`
        SELECT payment_method as method, SUM(amount_paid) as revenue 
        FROM payments 
        WHERE paid_at BETWEEN ? AND ?
        GROUP BY method
      `, [start, end])

      set({ 
        salesSummary: summary, 
        hourlySales: hourlyRows, 
        orderTypeSplit: typeRows,
        paymentMethodSplit: paymentRows 
      })
    } catch (err) {
      console.error("Sales report fetch failed:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchMenuPerformance: async () => {
    const { start, end } = get().dateRange
    try {
      const rows = await query<MenuItemPerformance>(`
        SELECT mi.name as item_name, SUM(oi.quantity) as quantity_sold, SUM(oi.quantity * oi.unit_price) as revenue, mc.name as category_name
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        JOIN menu_categories mc ON mi.category_id = mc.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'completed' AND o.created_at BETWEEN ? AND ?
        GROUP BY mi.id
        ORDER BY quantity_sold DESC
      `, [start, end])
      set({ menuPerformance: rows })
    } catch (err) {
      console.error("Menu performance fetch failed:", err)
    }
  },

  fetchExpenses: async () => {
    const { start, end } = get().dateRange
    try {
      const rows = await query<Expense>(`
        SELECT * FROM expenses 
        WHERE date BETWEEN ? AND ?
        ORDER BY date DESC
      `, [start.split(' ')[0], end.split(' ')[0]])
      set({ expenses: rows })
    } catch (err) {
      console.error("Expenses fetch failed:", err)
    }
  },

  addExpense: async (expense) => {
    await upsert("expenses", expense)
    await get().fetchExpenses()
  },

  deleteExpense: async (id) => {
    await dbDelete("expenses", id)
    await get().fetchExpenses()
  }
}))
