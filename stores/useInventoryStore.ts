import { create } from "zustand"
import { query, execute, withTransaction } from "@/lib/db"
import { InventoryCategory, InventoryItem, InventoryTransaction, TransactionType } from "@/types"

interface InventoryState {
  categories: InventoryCategory[]
  items: InventoryItem[]
  transactions: InventoryTransaction[]
  isLoading: boolean

  fetchCategories: () => Promise<void>
  fetchItems: () => Promise<void>
  fetchTransactions: (itemId?: number) => Promise<void>

  // Category Actions
  addCategory: (name: string) => Promise<void>
  deleteCategory: (id: number) => Promise<void>

  // Item Actions
  addItem: (item: Omit<InventoryItem, "id" | "created_at" | "updated_at">) => Promise<void>
  updateItem: (id: number, item: Partial<InventoryItem>) => Promise<void>
  deleteItem: (id: number) => Promise<void>

  // Transaction Actions
  recordTransaction: (itemId: number, type: TransactionType, qty: number, notes?: string) => Promise<void>
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  categories: [],
  items: [],
  transactions: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true })
    try {
      const rows = await query<InventoryCategory>("SELECT * FROM inventory_categories ORDER BY name ASC")
      set({ categories: rows })
    } catch (err) {
      console.error("Failed to fetch inventory categories:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchItems: async () => {
    set({ isLoading: true })
    try {
      const rows = await query<InventoryItem>(`
        SELECT i.*, c.name as category_name 
        FROM inventory_items i 
        LEFT JOIN inventory_categories c ON i.category_id = c.id 
        ORDER BY i.name ASC
      `)
      set({ items: rows })
    } catch (err) {
      console.error("Failed to fetch inventory items:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchTransactions: async (itemId?: number) => {
    try {
      let sql = `
        SELECT t.*, i.name as item_name 
        FROM inventory_transactions t 
        JOIN inventory_items i ON t.item_id = i.id
      `
      const params: (string | number)[] = []
      if (itemId) {
        sql += " WHERE t.item_id = ?"
        params.push(itemId)
      }
      sql += " ORDER BY t.created_at DESC LIMIT 100"
      
      const rows = await query<InventoryTransaction>(sql, params)
      set({ transactions: rows })
    } catch (err) {
      console.error("Failed to fetch transactions:", err)
    }
  },

  addCategory: async (name) => {
    await execute("INSERT INTO inventory_categories (name) VALUES (?)", [name])
    await get().fetchCategories()
  },

  deleteCategory: async (id) => {
    await execute("DELETE FROM inventory_categories WHERE id = ?", [id])
    await get().fetchCategories()
  },

  addItem: async (item) => {
    await execute(`
      INSERT INTO inventory_items (category_id, name, unit, current_stock, min_stock_alert, cost_per_unit, supplier_name, supplier_phone, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [item.category_id, item.name, item.unit, item.current_stock, item.min_stock_alert, item.cost_per_unit, item.supplier_name, item.supplier_phone, item.notes])
    await get().fetchItems()
  },

  updateItem: async (id, item) => {
    const fields: string[] = []
    const params: (string | number | null)[] = []
    Object.entries(item).forEach(([key, value]) => {
      if (key === "id" || key === "category_name" || key === "created_at" || key === "updated_at") return
      fields.push(`${key} = ?`)
      params.push(value as string | number | null)
    })
    params.push(id)
    await execute(`UPDATE inventory_items SET ${fields.join(", ")}, updated_at = datetime('now') WHERE id = ?`, params)
    await get().fetchItems()
  },

  deleteItem: async (id) => {
    await execute("DELETE FROM inventory_items WHERE id = ?", [id])
    await get().fetchItems()
  },

  recordTransaction: async (itemId, type, qty, notes) => {
    try {
      await withTransaction(async () => {
        await execute(`
          INSERT INTO inventory_transactions (item_id, type, quantity, notes)
          VALUES (?, ?, ?, ?)
        `, [itemId, type, qty, notes])

        let stockChange = qty
        if (type === "usage" || type === "waste") stockChange = -qty
        
        let updateSql = "UPDATE inventory_items SET current_stock = current_stock + ?"
        const params: (string | number)[] = [stockChange]
        
        if (type === "restock") {
          updateSql += ", last_restocked = datetime('now')"
        }
        
        updateSql += " WHERE id = ?"
        params.push(itemId)
        
        await execute(updateSql, params)
      })
      
      await get().fetchItems()
      await get().fetchTransactions(itemId)
    } catch (err) {
      console.error("Transaction failed:", err)
      throw err
    }
  }
}))
