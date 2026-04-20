"use client"

import React from "react"
import { Order } from "@/types"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, ChevronRight } from "lucide-react"
import Link from "next/link"

interface RecentOrdersProps {
  orders: Order[]
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const { settings } = useSettingsStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-normal uppercase text-text-muted tracking-widest flex items-center gap-2">
          <ShoppingBag size={14} /> Recent Orders
        </h3>
        <Link href="/orders" className="text-[10px] font-medium uppercase text-primary hover:underline">View All</Link>
      </div>

      <div className="space-y-2">
        {orders.map((order) => (
          <div key={order.id} className="p-3 bg-bg-base/30 border border-border rounded-lg flex items-center justify-between group hover:border-border-strong transition-colors">
            <div className="space-y-1">
              <p className="text-xs font-normal font-mono text-text-primary tracking-wider">{order.order_number}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[8px] h-4 px-1 border-primary/20 text-primary bg-primary/5 font-medium">{order.order_type}</Badge>
                <span className="text-[9px] text-text-subtle font-normal uppercase">{formatDistanceToNow(new Date(order.created_at))} ago</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-normal text-text-primary kpi-value">{settings.currency_symbol}{order.total.toFixed(2)}</span>
              <ChevronRight size={14} className="text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="py-12 text-center opacity-50 border border-dashed border-border rounded-xl">
             <p className="text-xs italic">No orders today yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
