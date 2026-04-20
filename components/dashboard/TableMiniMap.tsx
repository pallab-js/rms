"use client"

import React, { useEffect } from "react"
import { useTableStore } from "@/stores/useTableStore"
import { cn } from "@/lib/utils"

export default function TableMiniMap() {
  const { tables, fetchTables } = useTableStore()

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  return (
    <div className="grid grid-cols-4 gap-2">
      {tables.map((table) => (
        <div 
          key={table.id} 
          className={cn(
            "aspect-square rounded-lg border-2 flex items-center justify-center transition-all",
            table.status === 'available' && "bg-success/5 border-success/20 text-success",
            table.status === 'occupied' && "bg-warning/5 border-warning/20 text-warning",
            table.status === 'reserved' && "bg-info/5 border-info/20 text-info",
            table.status === 'cleaning' && "bg-text-subtle/5 border-text-subtle/20 text-text-subtle"
          )}
          title={`Table ${table.table_number} - ${table.status}`}
        >
          <span className="text-[10px] font-medium">{table.table_number}</span>
        </div>
      ))}
      {tables.length === 0 && (
         <div className="col-span-4 py-8 text-center opacity-30 border border-dashed border-border rounded-xl text-[10px] uppercase font-medium">
            No tables configured
         </div>
      )}
    </div>
  )
}
