"use client"

import React, { useEffect } from "react"
import { useOrderStore } from "@/stores/useOrderStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { OrderStatus } from "@/types"
import { cn } from "@/lib/utils"
import { 
  Clock, 
  ChevronRight, 
  AlertCircle,
  MoreVertical,
  RotateCcw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

interface OrderBoardProps {
  highlightId?: number
}

export default function OrderBoard({ highlightId }: OrderBoardProps) {
  const { orders, isLoading, activeFilter, setFilter, fetchOrders, updateOrderStatus } = useOrderStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(() => fetchOrders(), 30000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const statusColors: Record<OrderStatus, string> = {
    pending: "bg-danger/10 text-danger border-danger/20",
    confirmed: "bg-info/10 text-info border-info/20",
    preparing: "bg-warning/10 text-warning border-warning/20",
    ready: "bg-primary/10 text-primary border-primary/20",
    served: "bg-success/10 text-success border-success/20",
    completed: "bg-text-muted/10 text-text-muted border-text-muted/20",
    cancelled: "bg-text-subtle/10 text-text-subtle border-text-subtle/20",
  }

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case "pending": return "preparing"
      case "preparing": return "ready"
      case "ready": return "served"
      default: return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg-base/30 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-normal text-text-primary uppercase tracking-tight leading-none">Active Orders</h2>
          <p className="text-xs text-text-muted font-medium italic mt-1">Real-time order tracking and management</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-2 border-border font-medium" onClick={() => fetchOrders()}>
          <RotateCcw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
        </Button>
      </div>

      <Tabs value={activeFilter} onValueChange={(val) => setFilter(val as "all" | OrderStatus)} className="w-full">
        <TabsList className="bg-bg-surface border border-border p-1 h-9">
          <TabsTrigger value="all" className="text-[10px] uppercase font-medium px-4">All</TabsTrigger>
          <TabsTrigger value="pending" className="text-[10px] uppercase font-medium px-4">Pending</TabsTrigger>
          <TabsTrigger value="preparing" className="text-[10px] uppercase font-medium px-4">Preparing</TabsTrigger>
          <TabsTrigger value="ready" className="text-[10px] uppercase font-medium px-4">Ready</TabsTrigger>
          <TabsTrigger value="served" className="text-[10px] uppercase font-medium px-4">Served</TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="flex-1 -mx-2 px-2">
        {orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className={cn(
                  "bg-bg-surface border rounded-xl overflow-hidden group transition-all shadow-sm",
                  highlightId === order.id ? "border-primary ring-1 ring-primary/50 scale-[1.02]" : "border-border hover:border-border-strong"
                )}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-border bg-bg-elevated/20 flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-text-primary font-mono tracking-wider">{order.order_number}</span>
                      <Badge className={cn("text-[8px] uppercase font-medium px-1.5 h-4", statusColors[order.status])}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium uppercase">
                      <span className="text-primary">{order.order_type.replace("_", " ")}</span>
                      <span>•</span>
                      <span>{order.table_id ? `Table ${order.table_id}` : order.customer_name || "Guest"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-[10px] text-text-subtle font-normal uppercase">
                      <Clock size={10} />
                      {formatDistanceToNow(new Date(order.created_at))} ago
                    </div>
                    <span className="text-xs font-normal text-text-primary kpi-value">
                      {settings.currency_symbol} {order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="p-4 space-y-2">
                  <div className="max-h-[100px] overflow-hidden">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-0.5">
                        <span className="text-text-primary truncate flex-1 font-normal">
                          <span className="text-text-subtle font-mono mr-2">{item.quantity}x</span>
                          {item.menu_item_name || "Unknown Item"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {order.items.length > 3 && (
                    <p className="text-[10px] text-text-subtle italic">+{order.items.length - 3} more items...</p>
                  )}
                </div>

                {/* Actions */}
                <div className="p-3 bg-bg-elevated/10 border-t border-border flex gap-2">
                  {getNextStatus(order.status) ? (
                    <Button 
                      className="flex-1 h-8 text-[10px] uppercase font-medium gap-2"
                      onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                    >
                      Mark {getNextStatus(order.status)} <ChevronRight size={14} />
                    </Button>
                  ) : order.status === "served" ? (
                    <Badge className="flex-1 h-8 justify-center bg-success text-success-foreground text-[10px] uppercase font-medium">
                      Awaiting Payment
                    </Badge>
                  ) : null}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="icon" className="h-8 w-8 border-border shrink-0">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-bg-elevated border-border">
                      <DropdownMenuItem className="gap-2 text-[10px] uppercase font-medium">View Details</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-[10px] uppercase font-medium">Print KOT</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-danger focus:text-danger text-[10px] uppercase font-medium" onClick={() => updateOrderStatus(order.id, "cancelled")}>
                        Cancel Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <div className="w-16 h-16 bg-bg-surface rounded-full flex items-center justify-center border border-dashed border-border">
              <AlertCircle size={32} className="text-text-subtle" />
            </div>
            <div>
              <p className="text-sm font-normal text-text-primary uppercase tracking-wider">No active orders</p>
              <p className="text-xs text-text-muted mt-1 font-medium">Start by taking a new order from the side panel</p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
