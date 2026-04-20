"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface OrderStatusFunnelProps {
  ordersByStatus: Record<string, number>
}

export default function OrderStatusFunnel({ ordersByStatus }: OrderStatusFunnelProps) {
  const stages = [
    { label: "Pending", key: "pending", color: "bg-danger" },
    { label: "Preparing", key: "preparing", color: "bg-warning" },
    { label: "Ready", key: "ready", color: "bg-primary" },
    { label: "Served", key: "served", color: "bg-success" },
  ]

  const counts = {
    pending: ordersByStatus.pending || 0,
    preparing: ordersByStatus.preparing || 0,
    ready: ordersByStatus.ready || 0,
    served: ordersByStatus.served || 0,
  }

  const max = Math.max(...Object.values(counts), 1)

  return (
    <div className="space-y-4">
      {stages.map((stage) => {
        const count = counts[stage.key as keyof typeof counts]
        const percentage = (count / max) * 100
        
        return (
          <div key={stage.key} className="space-y-1.5">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-normal uppercase text-text-muted tracking-widest">{stage.label}</span>
              <span className="text-xs font-normal text-text-primary">{count}</span>
            </div>
            <div className="h-2 w-full bg-bg-base rounded-full overflow-hidden border border-border/50">
              <div 
                className={cn("h-full transition-all duration-1000 ease-out", stage.color)} 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
