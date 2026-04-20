"use client"

import React, { useEffect, useCallback } from "react"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { InventoryItem, TransactionType } from "@/types"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Trash2, 
  Settings2,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionHistoryProps {
  item: InventoryItem
}

export default function TransactionHistory({ item }: TransactionHistoryProps) {
  const { transactions, fetchTransactions } = useInventoryStore()

  const loadData = useCallback(() => {
    fetchTransactions(item.id)
  }, [fetchTransactions, item.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const typeIcons: Record<TransactionType, React.ElementType> = {
    restock: ArrowUpCircle,
    usage: ArrowDownCircle,
    waste: Trash2,
    adjustment: Settings2,
  }

  const typeColors: Record<TransactionType, string> = {
    restock: "text-success",
    usage: "text-warning",
    waste: "text-danger",
    adjustment: "text-info",
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center gap-2 text-text-muted mb-2">
        <Clock size={16} />
        <h4 className="text-xs font-black uppercase tracking-widest">Recent Activity</h4>
      </div>
      
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-3 pb-4">
          {transactions.map((t) => {
            const Icon = typeIcons[t.type] || Clock
            return (
              <div key={t.id} className="p-3 bg-bg-base/30 border border-border rounded-lg flex gap-3 group hover:border-border-strong transition-colors">
                <div className={cn("mt-1", typeColors[t.type])}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-text-primary capitalize">{t.type}</p>
                    <span className="text-[10px] font-mono text-text-muted">
                      {t.type === "usage" || t.type === "waste" ? "-" : "+"}
                      {t.quantity} {item.unit}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 italic">
                    {t.notes || "No notes provided"}
                  </p>
                  <p className="text-[9px] text-text-subtle mt-2 uppercase font-bold tracking-tight">
                    {format(new Date(t.created_at), "MMM d, HH:mm")}
                  </p>
                </div>
              </div>
            )
          })}
          
          {transactions.length === 0 && (
            <div className="text-center py-12 opacity-50">
              <p className="text-xs font-medium italic">No transactions recorded for this item yet.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
