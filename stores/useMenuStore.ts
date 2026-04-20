import { create } from "zustand"
import { query, execute, buildUpdateSql } from "@/lib/db"
import { MenuCategory, MenuItem, Modifier } from "@/types"

interface MenuState {
  categories: MenuCategory[]
  items: MenuItem[]
  modifiers: Modifier[]
  isLoading: boolean

  fetchCategories: () => Promise<void>
  fetchItems: (categoryId?: number) => Promise<void>
  fetchModifiers: () => Promise<void>
  
  // Category Actions
  addCategory: (category: Omit<MenuCategory, "id" | "created_at">) => Promise<void>
  updateCategory: (id: number, category: Partial<MenuCategory>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  reorderCategories: (orderedIds: number[]) => Promise<void>

  // Item Actions
  addItem: (item: Omit<MenuItem, "id" | "margin">) => Promise<void>
  updateItem: (id: number, item: Partial<MenuItem>) => Promise<void>
  deleteItem: (id: number) => Promise<void>
  toggleItemAvailability: (id: number, isAvailable: boolean) => Promise<void>

  // Modifier Actions
  addModifier: (modifier: Omit<Modifier, "id">) => Promise<void>
  updateModifier: (id: number, modifier: Partial<Modifier>) => Promise<void>
  deleteModifier: (id: number) => Promise<void>
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  items: [],
  modifiers: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true })
    try {
      const rows = await query<MenuCategory>("SELECT * FROM menu_categories ORDER BY sort_order ASC")
      set({ categories: rows.map(r => ({ ...r, is_active: Boolean(r.is_active) })) })
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchItems: async (categoryId?: number) => {
    set({ isLoading: true })
    try {
      let sql = `
        SELECT m.*, c.name as category_name 
        FROM menu_items m 
        LEFT JOIN menu_categories c ON m.category_id = c.id
      `
      const params: (string | number)[] = []
      if (categoryId) {
        sql += " WHERE m.category_id = ?"
        params.push(categoryId)
      }
      sql += " ORDER BY m.sort_order ASC, m.name ASC"
      
      const rows = await query<MenuItem>(sql, params)
      const items = rows.map(item => ({
        ...item,
        is_active: Boolean(item.is_active),
        is_available: Boolean(item.is_available),
        margin: item.price > 0 ? ((item.price - item.cost_price) / item.price) * 100 : 0
      }))
      set({ items })
    } catch (err) {
      console.error("Failed to fetch items:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchModifiers: async () => {
    try {
      interface ModifierRow {
        id: number
        menu_item_id: number
        name: string
        options: string
        is_required: number | boolean
      }
      const rows = await query<ModifierRow>("SELECT * FROM modifiers")
      const modifiers = rows.map(r => ({
        ...r,
        options: JSON.parse(r.options),
        is_required: Boolean(r.is_required)
      }))
      set({ modifiers })
    } catch (err) {
      console.error("Failed to fetch modifiers:", err)
    }
  },

  addCategory: async (category) => {
    try {
      await execute(
        "INSERT INTO menu_categories (name, description, color, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        [category.name, category.description, category.color, category.icon, category.sort_order, category.is_active ? 1 : 0]
      )
      await get().fetchCategories()
    } catch (err) {
      console.error("Failed to add category:", err)
      throw err
    }
  },

  updateCategory: async (id, category) => {
    try {
      const { sql, params } = buildUpdateSql("menu_categories", category, id)
      await execute(sql, params)
      await get().fetchCategories()
    } catch (err) {
      console.error("Failed to update category:", err)
      throw err
    }
  },

  deleteCategory: async (id) => {
    try {
      await execute("DELETE FROM menu_categories WHERE id = ?", [id])
      await get().fetchCategories()
    } catch (err) {
      console.error("Failed to delete category:", err)
      throw err
    }
  },

  reorderCategories: async (orderedIds) => {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await execute("UPDATE menu_categories SET sort_order = ? WHERE id = ?", [i, orderedIds[i]])
      }
      await get().fetchCategories()
    } catch (err) {
      console.error("Failed to reorder categories:", err)
      throw err
    }
  },

  addItem: async (item) => {
    try {
      await execute(
        `INSERT INTO menu_items (category_id, name, description, price, cost_price, sku, image_path, is_active, is_available, prep_time_min, sort_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.category_id, item.name, item.description, item.price, item.cost_price, item.sku, item.image_path, item.is_active ? 1 : 0, item.is_available ? 1 : 0, item.prep_time_min, item.sort_order]
      )
      await get().fetchItems()
    } catch (err) {
      console.error("Failed to add item:", err)
      throw err
    }
  },

  updateItem: async (id, item) => {
    try {
      const filtered = { ...item }
      delete filtered.category_name
      delete filtered.margin
      const { sql, params } = buildUpdateSql("menu_items", filtered, id)
      await execute(sql, params)
      await get().fetchItems()
    } catch (err) {
      console.error("Failed to update item:", err)
      throw err
    }
  },

  deleteItem: async (id) => {
    try {
      await execute("DELETE FROM menu_items WHERE id = ?", [id])
      await get().fetchItems()
    } catch (err) {
      console.error("Failed to delete item:", err)
      throw err
    }
  },

  toggleItemAvailability: async (id, isAvailable) => {
    try {
      await execute("UPDATE menu_items SET is_available = ? WHERE id = ?", [isAvailable ? 1 : 0, id])
      set((state) => ({
        items: state.items.map(item => item.id === id ? { ...item, is_available: isAvailable } : item)
      }))
    } catch (err) {
      console.error("Failed to toggle item availability:", err)
      throw err
    }
  },

  addModifier: async (modifier) => {
    try {
      await execute(
        "INSERT INTO modifiers (menu_item_id, name, options, is_required) VALUES (?, ?, ?, ?)",
        [modifier.menu_item_id, modifier.name, JSON.stringify(modifier.options), modifier.is_required ? 1 : 0]
      )
      await get().fetchModifiers()
    } catch (err) {
      console.error("Failed to add modifier:", err)
      throw err
    }
  },

  updateModifier: async (id, modifier) => {
    try {
      const fields: string[] = []
      const params: (string | number)[] = []
      Object.entries(modifier).forEach(([key, value]) => {
        if (key === "id") return
        fields.push(`${key} = ?`)
        params.push(key === "options" ? JSON.stringify(value) : (key === "is_required" ? (value ? 1 : 0) : value as string | number))
      })
      params.push(id)
      await execute(`UPDATE modifiers SET ${fields.join(", ")} WHERE id = ?`, params)
      await get().fetchModifiers()
    } catch (err) {
      console.error("Failed to update modifier:", err)
      throw err
    }
  },

  deleteModifier: async (id) => {
    try {
      await execute("DELETE FROM modifiers WHERE id = ?", [id])
      await get().fetchModifiers()
    } catch (err) {
      console.error("Failed to delete modifier:", err)
      throw err
    }
  }
}))
