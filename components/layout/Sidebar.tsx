"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Receipt, 
  Armchair, 
  CalendarDays, 
  UtensilsCrossed, 
  Package, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { useOrderStore } from "@/stores/useOrderStore"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { useBillingStore } from "@/stores/useBillingStore"
import { useSettingsStore } from "@/stores/useSettingsStore"

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState(new Date())
  const [mounted] = useState(typeof window !== "undefined")
  const pathname = usePathname()

  // Get dynamic counts from stores
  const { settings } = useSettingsStore()
  const { orders, fetchOrders } = useOrderStore()
  const { items, fetchItems } = useInventoryStore()
  const { pendingBills, fetchPendingBills } = useBillingStore()

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    
    // Initial fetch for badges
    fetchOrders("pending")
    fetchItems()
    fetchPendingBills()

    return () => clearInterval(timer)
  }, [fetchOrders, fetchItems, fetchPendingBills])

  const pendingOrdersCount = orders.filter(o => o.status === "pending").length
  const lowStockCount = items.filter(i => i.current_stock <= i.min_stock_alert).length
  const pendingBillsCount = pendingBills.length

  const navItems = [
    { group: "MAIN", items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]},
    { group: "OPERATIONS", items: [
      { name: "Orders", href: "/orders", icon: Receipt, badge: pendingOrdersCount },
      { name: "Tables", href: "/tables", icon: Armchair },
      { name: "Reservations", href: "/tables?tab=reservations", icon: CalendarDays },
    ]},
    { group: "MANAGEMENT", items: [
      { name: "Menu", href: "/menu", icon: UtensilsCrossed },
      { name: "Inventory", href: "/inventory", icon: Package, badge: lowStockCount },
      { name: "Staff", href: "/staff", icon: Users },
    ]},
    { group: "FINANCE", items: [
      { name: "Billing", href: "/billing", icon: CreditCard, badge: pendingBillsCount },
      { name: "Reports", href: "/reports", icon: TrendingUp },
    ]},
    { group: "SYSTEM", items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ]},
  ]

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-bg-surface border-r border-border transition-all duration-300 ease-in-out",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border h-16">
        {!collapsed && <span className="text-xl font-normal text-primary tracking-tight truncate">{settings.restaurant_name}</span>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="ml-auto">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6">
        {navItems.map((group) => (
          <div key={group.group} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-xs font-normal text-text-subtle uppercase tracking-wider mb-2">
                {group.group}
              </h3>
            )}
            {group.items.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative group weight-nav",
                    isActive 
                      ? "bg-white/6 text-text-primary border-l-2 border-green-brand pl-[10px]" 
                      : "text-text-muted hover:bg-bg-hover hover:text-text-primary"
                  )}
                >
                  <item.icon size={20} className={cn(isActive ? "text-green-brand" : "text-text-muted group-hover:text-text-primary")} />
                  {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
                  {!collapsed && item.badge && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold",
                      isActive ? "bg-green-brand/10 text-green-brand border border-green-brand/20" : "bg-primary text-primary-foreground"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border border-bg-surface" />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-bg-base/50 space-y-2">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-text-primary truncate w-full">{settings.restaurant_name}</span>
            <span className="text-[10px] text-text-muted">v1.0.0</span>
          </div>
        )}
        <div className={cn("flex items-center gap-2 text-text-muted", collapsed ? "justify-center" : "")}>
          <Clock size={14} />
          {!collapsed && mounted && (
            <span className="text-xs font-mono">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </aside>
  )
}
