"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useOrderStore } from "@/stores/useOrderStore"
import { useMenuStore } from "@/stores/useMenuStore"
import { useTableStore } from "@/stores/useTableStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { OrderType } from "@/types"
import { cn } from "@/lib/utils"
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  User, 
  Phone, 
  Printer, 
  CheckCircle,
  ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function OrderBuilder() {
  const { categories, items, fetchCategories, fetchItems } = useMenuStore()
  const { tables, fetchTables } = useTableStore()
  const { settings } = useSettingsStore()
  const { 
    newOrder, 
    setOrderType, 
    setTableId, 
    setCustomerInfo, 
    addItemToCart, 
    updateCartItemQty, 
    removeItemFromCart, 
    placeOrder 
  } = useOrderStore()

  const [activeCategory, setActiveCategory] = useState<number | "all">("all")
  const [menuSearch, setMenuSearch] = useState("")

  const loadData = useCallback(() => {
    fetchCategories()
    fetchItems()
    fetchTables()
  }, [fetchCategories, fetchItems, fetchTables])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredItems = items.filter(i => {
    const matchesCategory = activeCategory === "all" || i.category_id === activeCategory
    const matchesSearch = i.name.toLowerCase().includes(menuSearch.toLowerCase())
    return matchesCategory && matchesSearch && i.is_active
  })

  const subtotal = newOrder.items.reduce((acc, i) => acc + (i.unit_price * i.quantity), 0)
  let discountAmt = 0
  if (newOrder.discount_type === "percent") discountAmt = (subtotal * newOrder.discount_val) / 100
  else if (newOrder.discount_type === "flat") discountAmt = newOrder.discount_val
  
  const taxableAmt = subtotal - discountAmt
  const taxAmt = (taxableAmt * settings.tax_rate) / 100
  const grandTotal = taxableAmt + taxAmt

  const handlePlaceOrder = async (printKOT = false) => {
    if (newOrder.items.length === 0) {
      toast.error("Please add items to the order")
      return
    }
    if (newOrder.order_type === "dine_in" && !newOrder.table_id) {
      toast.error("Please select a table for dine-in order")
      return
    }

    try {
      const orderNum = await placeOrder()
      toast.success(`Order ${orderNum} placed successfully`)
      if (printKOT) {
        setTimeout(() => window.print(), 500)
      }
    } catch {
      toast.error("Failed to place order")
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg-surface border-l border-border">
      {/* Header - Order Configuration */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" /> New Order
          </h3>
          <div className="flex bg-bg-base rounded-lg p-1 border border-border">
            {(["dine_in", "takeaway", "delivery"] as OrderType[]).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={cn(
                  "px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all",
                  newOrder.order_type === type 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {newOrder.order_type === "dine_in" ? (
            <div className="col-span-2">
              <Select onValueChange={(val) => setTableId(Number(val))} value={newOrder.table_id ? String(newOrder.table_id) : ""}>
                <SelectTrigger className="bg-bg-base border-border h-9">
                  <SelectValue placeholder="Select Table" />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border">
                  {tables.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)} disabled={t.status === "occupied"}>
                      Table {t.table_number} ({t.capacity}p) {t.status === "occupied" && "- Occupied"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="relative">
                <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
                <Input 
                  placeholder="Customer Name" 
                  className="bg-bg-base border-border h-9 pl-9 text-xs" 
                  value={newOrder.customer_name}
                  onChange={(e) => setCustomerInfo(e.target.value, newOrder.customer_phone)}
                />
              </div>
              <div className="relative">
                <Phone size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
                <Input 
                  placeholder="Phone Number" 
                  className="bg-bg-base border-border h-9 pl-9 text-xs" 
                  value={newOrder.customer_phone}
                  onChange={(e) => setCustomerInfo(newOrder.customer_name, e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="p-3 bg-bg-base/30 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
            <Input 
              placeholder="Search Menu..." 
              className="bg-bg-surface border-border h-8 pl-9 text-xs"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="mt-2 w-full whitespace-nowrap">
            <div className="flex gap-1.5 pb-2">
              <Button 
                variant={activeCategory === "all" ? "default" : "outline"} 
                size="sm" 
                className="h-7 text-[10px] uppercase font-bold"
                onClick={() => setActiveCategory("all")}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button 
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"} 
                  size="sm" 
                  className="h-7 text-[10px] uppercase font-bold"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="grid grid-cols-2 gap-2">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addItemToCart(item)}
                disabled={!item.is_available}
                className={cn(
                  "flex flex-col p-2 rounded-lg border text-left transition-all group",
                  item.is_available 
                    ? "bg-bg-base border-border hover:border-primary/50 hover:shadow-sm" 
                    : "bg-bg-base/50 border-border opacity-60 cursor-not-allowed"
                )}
              >
                <span className="text-xs font-bold text-text-primary truncate w-full">{item.name}</span>
                <span className="text-[10px] text-primary font-mono mt-1">
                  {settings.currency_symbol} {item.price.toFixed(2)}
                </span>
                {!item.is_available && (
                  <span className="text-[8px] text-danger uppercase font-bold mt-1">Sold Out</span>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Summary */}
      <div className="p-4 border-t border-border bg-bg-elevated/30">
        <h4 className="text-[10px] uppercase font-black text-text-subtle tracking-widest mb-2 flex justify-between">
          Order Items <span>{newOrder.items.length}</span>
        </h4>
        <ScrollArea className="max-h-[180px] mb-4">
          <div className="space-y-2">
            {newOrder.items.map((item) => (
              <div key={item.temp_id} className="flex items-center gap-2 bg-bg-base p-2 rounded-md border border-border group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{item.name}</p>
                  <p className="text-[10px] text-text-muted">{settings.currency_symbol} {item.unit_price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover:bg-bg-hover"
                    onClick={() => updateCartItemQty(item.temp_id, item.quantity - 1)}
                  >
                    <Minus size={12} />
                  </Button>
                  <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover:bg-bg-hover"
                    onClick={() => updateCartItemQty(item.temp_id, item.quantity + 1)}
                  >
                    <Plus size={12} />
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-text-subtle hover:text-danger"
                  onClick={() => removeItemFromCart(item.temp_id)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            ))}
            {newOrder.items.length === 0 && (
              <p className="text-[10px] text-text-subtle italic text-center py-4">No items in cart</p>
            )}
          </div>
        </ScrollArea>

        <div className="space-y-1.5 border-t border-border/50 pt-3">
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Subtotal</span>
            <span className="text-text-primary font-mono">{settings.currency_symbol} {subtotal.toFixed(2)}</span>
          </div>
          {discountAmt > 0 && (
            <div className="flex justify-between text-xs text-warning">
              <span>Discount</span>
              <span className="font-mono">-{settings.currency_symbol} {discountAmt.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">{settings.tax_label} ({settings.tax_rate}%)</span>
            <span className="text-text-primary font-mono">{settings.currency_symbol} {taxAmt.toFixed(2)}</span>
          </div>
          <Separator className="my-2 bg-border" />
          <div className="flex justify-between items-end">
            <span className="text-sm font-black uppercase text-text-primary">Grand Total</span>
            <span className="text-lg font-black text-primary font-mono">
              {settings.currency_symbol} {grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button variant="outline" className="border-border h-10 gap-2" onClick={() => handlePlaceOrder(true)}>
            <Printer size={16} /> Print KOT
          </Button>
          <Button className="h-10 gap-2" onClick={() => handlePlaceOrder(false)}>
            <CheckCircle size={16} /> Place Order
          </Button>
        </div>
      </div>
    </div>
  )
}
