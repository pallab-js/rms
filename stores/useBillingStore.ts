import { create } from "zustand"
import { query, execute, withTransaction } from "@/lib/db"
import { Order, Payment, OrderItem } from "@/types"
import { format } from "date-fns"

interface BillingState {
  pendingBills: Order[]
  paymentHistory: Payment[]
  isLoading: boolean

  fetchPendingBills: () => Promise<void>
  fetchPaymentHistory: (date?: string) => Promise<void>
  processPayment: (orderId: number, data: Omit<Payment, "id" | "paid_at">) => Promise<void>
}

export const useBillingStore = create<BillingState>((set, get) => ({
  pendingBills: [],
  paymentHistory: [],
  isLoading: false,

  fetchPendingBills: async () => {
    set({ isLoading: true })
    try {
      const rows = await query<Order>(`
        SELECT o.*, t.table_number 
        FROM orders o
        LEFT JOIN restaurant_tables t ON o.table_id = t.id
        WHERE o.status = 'served'
        ORDER BY o.created_at ASC
      `)
      
      const billsWithItems = await Promise.all(rows.map(async (order) => {
        const items = await query<OrderItem>(`
          SELECT oi.*, mi.name as menu_item_name 
          FROM order_items oi
          LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE oi.order_id = ?
        `, [order.id])
        return { ...order, items }
      }))
      
      set({ pendingBills: billsWithItems })
    } catch (err) {
      console.error("Failed to fetch pending bills:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchPaymentHistory: async (date) => {
    const filterDate = date || format(new Date(), "yyyy-MM-dd")
    set({ isLoading: true })
    try {
      const rows = await query<Payment>(`
        SELECT p.*, o.order_number 
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE date(p.paid_at) = ?
        ORDER BY p.paid_at DESC
      `, [filterDate])
      set({ paymentHistory: rows })
    } catch (err) {
      console.error("Failed to fetch payment history:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  processPayment: async (orderId, data) => {
    try {
      const order = get().pendingBills.find(o => o.id === orderId)
      const tableId = order?.table_id
      
      await withTransaction(async () => {
        await execute(`
          INSERT INTO payments (order_id, amount_paid, payment_method, change_given, reference_no, notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [orderId, data.amount_paid, data.payment_method, data.change_given, data.reference_no, data.notes])

        await execute(`
          UPDATE orders 
          SET status = 'completed', completed_at = datetime('now') 
          WHERE id = ?
        `, [orderId])

        if (tableId) {
          await execute("UPDATE restaurant_tables SET status = 'available' WHERE id = ?", [tableId])
        }
      })

      await get().fetchPendingBills()
      await get().fetchPaymentHistory()
    } catch (err) {
      console.error("Payment processing failed:", err)
      throw err
    }
  }
}))
