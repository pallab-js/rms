import { create } from "zustand"
import { query, withTransaction, upsert, dbDelete } from "@/lib/db"
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
    await upsert("inventory_categories", { name })
    await get().fetchCategories()
  },

  deleteCategory: async (id) => {
    await dbDelete("inventory_categories", id)
    await get().fetchCategories()
  },

  addItem: async (item) => {
    await upsert("inventory_items", item)
    await get().fetchItems()
  },

  updateItem: async (id, item) => {
    const data = { ...item }
    delete data.category_name
    delete data.created_at
    delete data.updated_at
    
    await upsert("inventory_items", data, id)
    await get().fetchItems()
  },

  deleteItem: async (id) => {
    await dbDelete("inventory_items", id)
    await get().fetchItems()
  },

  recordTransaction: async (itemId, type, qty, notes) => {
    try {
      await withTransaction(async () => {
        await upsert("inventory_transactions", { item_id: itemId, type, quantity: qty, notes })

        const items = await query<InventoryItem>("SELECT current_stock FROM inventory_items WHERE id = ?", [itemId])
        if (items.length > 0) {
          let stockChange = qty
          if (type === "usage" || type === "waste") stockChange = -qty
          
          const newStock = (items[0].current_stock || 0) + stockChange
          const updateData: Partial<InventoryItem> = { current_stock: newStock }
          
          if (type === "restock") {
            updateData.last_restocked = new Date().toISOString()
          }
          
          await upsert("inventory_items", updateData, itemId)
        }
      })
      
      await get().fetchItems()
      await get().fetchTransactions(itemId)
    } catch (err) {
      console.error("Transaction failed:", err)
      throw err
    }
  }
}))
