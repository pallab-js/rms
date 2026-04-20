"use client"

import React, { useState } from "react"
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  DragEndEvent,
  DragStartEvent
} from "@dnd-kit/core"
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers"
import { useTableStore } from "@/stores/useTableStore"
import { RestaurantTable, TableStatus } from "@/types"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

interface DraggableTableProps {
  table: RestaurantTable
}

function DraggableTable({ table }: DraggableTableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
    data: table,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${table.pos_x}px`,
    top: `${table.pos_y}px`,
  }

  const { updateTableStatus } = useTableStore()

  const statusColors: Record<TableStatus, string> = {
    available: "bg-success/20 border-success/50 text-success",
    occupied: "bg-warning/20 border-warning/50 text-warning",
    reserved: "bg-info/20 border-info/50 text-info",
    cleaning: "bg-text-subtle/20 border-text-subtle/50 text-text-muted",
  }

  const statusDots: Record<TableStatus, string> = {
    available: "bg-success",
    occupied: "bg-warning",
    reserved: "bg-info",
    cleaning: "bg-text-subtle",
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          className={cn(
            "absolute flex flex-col items-center justify-center border-2 transition-shadow cursor-move select-none",
            table.shape === "circle" ? "rounded-full" : "rounded-lg",
            statusColors[table.status],
            isDragging ? "shadow-2xl opacity-50 z-50" : "shadow-md hover:shadow-lg z-10",
            table.shape === "circle" ? "w-24 h-24" : "w-32 h-24"
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold">{table.table_number}</span>
            <div className="flex items-center gap-1 text-[10px] font-medium opacity-80">
              <Users size={12} />
              <span>{table.capacity}</span>
            </div>
          </div>
          <div className={cn("absolute top-2 right-2 w-2 h-2 rounded-full", statusDots[table.status])} />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-bg-elevated border-border w-48">
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">Status</ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-bg-elevated border-border">
            <ContextMenuItem onClick={() => updateTableStatus(table.id, "available")} className="gap-2">
              <div className="w-2 h-2 rounded-full bg-success" /> Available
            </ContextMenuItem>
            <ContextMenuItem onClick={() => updateTableStatus(table.id, "occupied")} className="gap-2">
              <div className="w-2 h-2 rounded-full bg-warning" /> Occupied
            </ContextMenuItem>
            <ContextMenuItem onClick={() => updateTableStatus(table.id, "reserved")} className="gap-2">
              <div className="w-2 h-2 rounded-full bg-info" /> Reserved
            </ContextMenuItem>
            <ContextMenuItem onClick={() => updateTableStatus(table.id, "cleaning")} className="gap-2">
              <div className="w-2 h-2 rounded-full bg-text-subtle" /> Cleaning
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator className="bg-border" />
        <ContextMenuItem className="gap-2">View Order</ContextMenuItem>
        <ContextMenuItem className="gap-2">Reserve Table</ContextMenuItem>
        <ContextMenuSeparator className="bg-border" />
        <ContextMenuItem className="gap-2">Edit Table</ContextMenuItem>
        <ContextMenuItem className="gap-2 text-danger focus:text-danger">Delete Table</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default function TableMap() {
  const { tables, updateTablePosition } = useTableStore()
  const [activeId, setActiveId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    const tableId = active.id as number
    const table = tables.find((t) => t.id === tableId)

    if (table) {
      const newX = Math.round(table.pos_x + delta.x)
      const newY = Math.round(table.pos_y + delta.y)
      updateTablePosition(tableId, newX, newY)
    }
    setActiveId(null)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  return (
    <div className="relative w-full h-[600px] bg-bg-base/50 border border-border rounded-xl overflow-hidden">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToFirstScrollableAncestor]}
      >
        <div className="absolute inset-0 p-8">
          {tables.map((table) => (
            <DraggableTable key={table.id} table={table} />
          ))}
        </div>

        <DragOverlay adjustScale={true} dropAnimation={null}>
          {activeId ? (
            <div
              className={cn(
                "flex flex-col items-center justify-center border-2 border-primary bg-primary/20 text-primary shadow-2xl z-50",
                tables.find((t) => t.id === activeId)?.shape === "circle" ? "rounded-full w-24 h-24" : "rounded-lg w-32 h-24"
              )}
            >
              <span className="text-lg font-bold">{tables.find((t) => t.id === activeId)?.table_number}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Grid Pattern Overlay (Optional for aesthetics) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
    </div>
  )
}
