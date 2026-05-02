import { create } from "zustand"
import { query, withTransaction, upsert } from "@/lib/db"
import { Order, OrderItem, OrderType, OrderStatus, MenuItem } from "@/types"
import { invoke } from "@tauri-apps/api/core"
import { useSettingsStore } from "./useSettingsStore"

interface CartItem extends Omit<OrderItem, "id" | "order_id"> {
  temp_id: string
  name: string
}

interface OrderStore {
  orders: Order[]
  isLoading: boolean
  activeFilter: OrderStatus | "all"
  
  // New Order (Cart) State
  newOrder: {
    order_type: OrderType
    table_id: number | null
    party_size: number
    customer_name: string
    customer_phone: string
    items: CartItem[]
    discount_type: 'none' | 'percent' | 'flat'
    discount_val: number
    notes: string
  }

  fetchOrders: (status?: OrderStatus | "all") => Promise<void>
  setFilter: (status: OrderStatus | "all") => void
  
  // Cart Actions
  setOrderType: (type: OrderType) => void
  setTableId: (id: number | null) => void
  setPartySize: (size: number) => void
  setCustomerInfo: (name: string, phone: string) => void
  addItemToCart: (item: MenuItem) => void
  removeItemFromCart: (temp_id: string) => void
  updateCartItemQty: (temp_id: string, qty: number) => void
  setDiscount: (type: 'none' | 'percent' | 'flat', val: number) => void
  clearCart: () => void
  
  // Order Mutations
  placeOrder: () => Promise<string>
  updateOrderStatus: (id: number, status: OrderStatus) => Promise<void>
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  isLoading: false,
  activeFilter: "all",

  newOrder: {
    order_type: "dine_in",
    table_id: null,
    party_size: 1,
    customer_name: "",
    customer_phone: "",
    items: [],
    discount_type: "none",
    discount_val: 0,
    notes: "",
  },

  setFilter: (status) => {
    set({ activeFilter: status })
    get().fetchOrders(status)
  },

  fetchOrders: async (status) => {
    const filter = status || get().activeFilter
    set({ isLoading: true })
    try {
      const params: string[] = []
      let whereClause = ""
      
      if (filter !== "all") {
        whereClause = " WHERE o.status = ?"
        params.push(filter)
      }
      
      const ordersSql = `
        SELECT o.*, t.table_number 
        FROM orders o
        LEFT JOIN restaurant_tables t ON o.table_id = t.id
        ${whereClause}
        ORDER BY o.created_at DESC
      `
      const rows = await query<Order>(ordersSql, params)
      
      if (rows.length === 0) {
        set({ orders: [] })
        return
      }
      
      const orderIds = rows.map(o => o.id)
      const itemsSql = `
        SELECT oi.*, mi.name as menu_item_name 
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})
        ORDER BY oi.order_id
      `
      const items = await query<OrderItem>(itemsSql, orderIds)
      
      const itemsByOrderId = new Map<number, OrderItem[]>()
      for (const item of items) {
        const existing = itemsByOrderId.get(item.order_id) || []
        existing.push(item)
        itemsByOrderId.set(item.order_id, existing)
      }
      
      const ordersWithItems = rows.map(order => ({
        ...order,
        items: itemsByOrderId.get(order.id) || []
      }))
      
      set({ orders: ordersWithItems })
    } catch (err) {
      console.error("Failed to fetch orders:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  setOrderType: (type) => set((state) => ({ newOrder: { ...state.newOrder, order_type: type } })),
  setTableId: (id) => set((state) => ({ newOrder: { ...state.newOrder, table_id: id } })),
  setPartySize: (size) => set((state) => ({ newOrder: { ...state.newOrder, party_size: size } })),
  setCustomerInfo: (name, phone) => set((state) => ({ newOrder: { ...state.newOrder, customer_name: name, customer_phone: phone } })),

  addItemToCart: (item) => {
    const { items } = get().newOrder
    const existing = items.find(i => i.menu_item_id === item.id)
    
    if (existing) {
      get().updateCartItemQty(existing.temp_id, existing.quantity + 1)
    } else {
      const newItem: CartItem = {
        temp_id: crypto.randomUUID(),
        menu_item_id: item.id,
        name: item.name,
        quantity: 1,
        unit_price: item.price,
        status: "pending"
      }
      set((state) => ({ newOrder: { ...state.newOrder, items: [...state.newOrder.items, newItem] } }))
    }
  },

  removeItemFromCart: (temp_id) => set((state) => ({
    newOrder: { ...state.newOrder, items: state.newOrder.items.filter(i => i.temp_id !== temp_id) }
  })),

  updateCartItemQty: (temp_id, qty) => set((state) => ({
    newOrder: { 
      ...state.newOrder, 
      items: state.newOrder.items.map(i => i.temp_id === temp_id ? { ...i, quantity: Math.max(1, qty) } : i) 
    }
  })),

  setDiscount: (type, val) => set((state) => ({ newOrder: { ...state.newOrder, discount_type: type, discount_val: val } })),
  
  clearCart: () => set((state) => ({ 
    newOrder: { 
      ...state.newOrder, 
      items: [], 
      table_id: null, 
      party_size: 1,
      customer_name: "", 
      customer_phone: "",
      discount_type: "none",
      discount_val: 0,
      notes: ""
    } 
  })),

  placeOrder: async () => {
    const { newOrder } = get()
    const { settings } = useSettingsStore.getState()
    
    if (newOrder.items.length === 0) throw new Error("Cart is empty")
    
    const subtotal = newOrder.items.reduce((acc, i) => acc + (i.unit_price * i.quantity), 0)
    let discount_amt = 0
    if (newOrder.discount_type === "percent") {
      discount_amt = (subtotal * newOrder.discount_val) / 100
    } else if (newOrder.discount_type === "flat") {
      discount_amt = newOrder.discount_val
    }
    
    const taxable_amt = subtotal - discount_amt
    const tax_amt = (taxable_amt * settings.tax_rate) / 100
    const total = taxable_amt + tax_amt
    
    const order_number = await invoke<string>("generate_order_number")
    
    try {
      await withTransaction(async () => {
        const result = await upsert("orders", {
          order_number, 
          table_id: newOrder.table_id, 
          party_size: newOrder.party_size, 
          order_type: newOrder.order_type, 
          status: "pending", 
          customer_name: newOrder.customer_name, 
          customer_phone: newOrder.customer_phone, 
          notes: newOrder.notes,
          subtotal, 
          discount_type: newOrder.discount_type, 
          discount_val: newOrder.discount_val, 
          tax_amount: tax_amt, 
          total
        })
        
        const order_id = Number(result.lastInsertRowid)
        
        for (const item of newOrder.items) {
          await upsert("order_items", {
            order_id, 
            menu_item_id: item.menu_item_id, 
            quantity: item.quantity, 
            unit_price: item.unit_price, 
            status: "pending"
          })
        }
        
        if (newOrder.table_id) {
          await upsert("restaurant_tables", { status: 'occupied' }, newOrder.table_id)
        }
      })
      
      get().clearCart()
      await get().fetchOrders()
      return order_number
    } catch (err) {
      console.error("Placement failed:", err)
      throw err
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      await upsert("orders", { status }, id)
      
      // If completed or cancelled, free the table
      if (status === "completed" || status === "cancelled") {
        const order = get().orders.find(o => o.id === id)
        if (order?.table_id) {
          await upsert("restaurant_tables", { status: 'available' }, order.table_id)
        }
      }
      
      await get().fetchOrders()
    } catch (err) {
      console.error("Status update failed:", err)
      throw err
    }
  }
}))
