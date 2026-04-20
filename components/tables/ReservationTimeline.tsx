"use client"

import React from "react"
import { useTableStore } from "@/stores/useTableStore"
import { cn } from "@/lib/utils"

const HOURS = Array.from({ length: 13 }, (_, i) => i + 11) // 11 AM to 11 PM

export default function ReservationTimeline() {
  const { tables, reservations } = useTableStore()

  const getPosition = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const totalMinutesFrom11AM = (hours - 11) * 60 + minutes
    return (totalMinutesFrom11AM / (12 * 60)) * 100
  }

  const getWidth = (duration: number) => {
    return (duration / (12 * 60)) * 100
  }

  return (
    <div className="w-full bg-bg-surface border border-border rounded-xl overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Time Header */}
        <div className="flex border-b border-border bg-bg-elevated/50 sticky top-0 z-20">
          <div className="w-32 shrink-0 border-r border-border p-3 text-xs font-bold text-text-subtle uppercase">Table</div>
          <div className="flex-1 flex relative h-10">
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="absolute text-[10px] text-text-muted font-medium -translate-x-1/2" 
                style={{ left: `${((hour - 11) / 12) * 100}%` }}
              >
                <div className="h-2 w-px bg-border mx-auto mb-1" />
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="relative">
          {tables.map((table) => {
            const tableReservations = reservations.filter(r => r.table_id === table.id)
            
            return (
              <div key={table.id} className="flex border-b border-border last:border-0 hover:bg-bg-hover/30 transition-colors h-14 group">
                <div className="w-32 shrink-0 border-r border-border p-3 flex flex-col justify-center">
                  <span className="text-sm font-bold text-text-primary">{table.table_number}</span>
                  <span className="text-[10px] text-text-muted uppercase">{table.section} • {table.capacity}p</span>
                </div>
                
                <div className="flex-1 relative overflow-hidden">
                  {/* Grid Lines */}
                  {HOURS.map((hour) => (
                    <div 
                      key={hour} 
                      className="absolute top-0 bottom-0 w-px bg-border/30" 
                      style={{ left: `${((hour - 11) / 12) * 100}%` }}
                    />
                  ))}

                  {/* Reservation Blocks */}
                  {tableReservations.map((res) => {
                    const left = getPosition(res.reserved_time)
                    const width = getWidth(res.duration_min)
                    
                    return (
                      <div
                        key={res.id}
                        className={cn(
                          "absolute top-2 bottom-2 rounded-md border px-2 py-1 flex flex-col justify-center overflow-hidden cursor-pointer hover:ring-2 transition-all",
                          res.status === "seated" ? "bg-success/20 border-success/30" : res.status === "no-show" ? "bg-warning/20 border-warning/30" : "bg-info/10 border-info/30"
                        )}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`${res.guest_name} - ${res.reserved_time} (${res.duration_min}m)`}
                      >
                        <span className="text-[10px] font-bold text-text-primary truncate">{res.guest_name}</span>
                        <span className="text-[8px] text-text-muted">{res.party_size} pax</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
