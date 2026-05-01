"use client"

import React, { useEffect, useState, useCallback } from "react"
import { 
  Plus, 
  Search, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Trash2, 
  History,
  MoreVertical,
  Filter,
  AlertTriangle,
  ChevronRight,
  Edit,
  ShoppingBag
} from "lucide-react"
import { 
  flexRender, 
  getCoreRowModel, 
  useReactTable, 
  getSortedRowModel, 
  SortingState,
  getFilteredRowModel,
  ColumnDef
} from "@tanstack/react-table"
import { format } from "date-fns"
import { toast } from "sonner"

import { useInventoryStore } from "@/stores/useInventoryStore"
import { InventoryItem, TransactionType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import TableSkeleton from "@/components/shared/TableSkeleton"

import InventoryItemForm from "@/components/inventory/InventoryItemForm"
import TransactionForm from "@/components/inventory/TransactionForm"
import TransactionHistory from "@/components/inventory/TransactionHistory"
import InventoryCategoryManager from "@/components/inventory/InventoryCategoryManager"
import { FeatureErrorBoundary } from "@/components/layout/FeatureErrorBoundary"

export default function InventoryPage() {
  return (
    <FeatureErrorBoundary name="Inventory">
      <InventoryContent />
    </FeatureErrorBoundary>
  )
}

function InventoryContent() {
  const { items, isLoading, fetchItems, fetchCategories, deleteItem } = useInventoryStore()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  
  // Modal States
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<TransactionType>("restock")
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const loadData = useCallback(() => {
    fetchItems()
    fetchCategories()
  }, [fetchItems, fetchCategories])

  useEffect(() => {
    loadData()
  }, [loadData])

  const lowStockItems = items.filter(i => i.current_stock <= i.min_stock_alert)

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "name",
      header: "Item Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-normal text-text-primary">{row.original.name}</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">{row.original.category_name || "Uncategorized"}</span>
        </div>
      )
    },
    {
      accessorKey: "current_stock",
      header: "In Stock",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-mono font-normal",
            row.original.current_stock <= 0 ? "text-danger" : 
            row.original.current_stock <= row.original.min_stock_alert ? "text-warning" : "text-text-primary"
          )}>
            {row.original.current_stock}
          </span>
          <span className="text-[10px] text-text-muted">{row.original.unit}</span>
        </div>
      )
    },
    {
      accessorKey: "min_stock_alert",
      header: "Min Level",
      cell: ({ row }) => <span className="text-xs text-text-subtle font-mono">{row.original.min_stock_alert} {row.original.unit}</span>
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const item = row.original
        let status = { label: "Sufficient", color: "bg-success/10 text-success border-success/20" }
        
        if (item.current_stock <= 0) {
          status = { label: "Out of Stock", color: "bg-danger text-white border-danger" }
        } else if (item.current_stock <= item.min_stock_alert * 0.5) {
          status = { label: "Critical", color: "bg-danger/10 text-danger border-danger/30" }
        } else if (item.current_stock <= item.min_stock_alert) {
          status = { label: "Low", color: "bg-warning/10 text-warning border-warning/30" }
        }
        
        return <Badge className={cn("text-[8px] uppercase font-medium px-1.5 h-4", status.color)}>{status.label}</Badge>
      }
    },
    {
      accessorKey: "last_restocked",
      header: "Last Restock",
      cell: ({ row }) => (
        <span className="text-[10px] text-text-muted">
          {row.original.last_restocked ? format(new Date(row.original.last_restocked), "MMM d, yyyy") : "Never"}
        </span>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-text-muted hover:text-success"
            title="Restock"
            onClick={() => {
              setSelectedItem(row.original)
              setTransactionType("restock")
              setIsTransactionModalOpen(true)
            }}
          >
            <ArrowUpCircle size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-text-muted hover:text-warning"
            title="Record Usage"
            onClick={() => {
              setSelectedItem(row.original)
              setTransactionType("usage")
              setIsTransactionModalOpen(true)
            }}
          >
            <ArrowDownCircle size={16} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text-primary">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-bg-elevated border-border w-48">
              <DropdownMenuItem className="gap-2 font-medium uppercase text-[10px]" onClick={() => {
                setSelectedItem(row.original)
                setIsHistoryOpen(true)
              }}>
                <History size={14} /> View History
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 font-medium uppercase text-[10px]" onClick={() => {
                setSelectedItem(row.original)
                setIsItemModalOpen(true)
              }}>
                <Edit size={14} /> Edit Details
              </DropdownMenuItem>
              <Separator className="my-1 bg-border" />
              <DropdownMenuItem className="gap-2 font-medium uppercase text-[10px] text-danger focus:text-danger" onClick={async () => {
                if (confirm(`Delete ${row.original.name}? This action is irreversible.`)) {
                  await deleteItem(row.original.id)
                  toast.success("Item deleted")
                }
              }}>
                <Trash2 size={14} /> Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
  })

  return (
    <div className="flex h-full flex-col p-8 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-normal tracking-tight text-text-primary uppercase leading-none">Inventory</h2>
          <p className="text-text-muted font-medium">Track and manage supplies, stock levels and costs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2 border-border h-10 uppercase font-medium text-[10px] tracking-widest"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <Filter size={14} /> Categories
          </Button>
          <Button className="gap-2 h-10 uppercase font-medium text-[10px] tracking-widest" onClick={() => {
            setSelectedItem(null)
            setIsItemModalOpen(true)
          }}>
            <Plus size={16} /> Add New Item
          </Button>
        </div>
      </div>

      {/* Alerts & Summary */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <Card className={cn(
          "shrink-0 w-[280px] bg-bg-surface border-border",
          lowStockItems.length > 0 && "border-danger/30 ring-1 ring-danger/10"
        )}>
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-normal uppercase text-text-muted tracking-widest">Low Stock Alerts</CardTitle>
            <AlertTriangle size={14} className={lowStockItems.length > 0 ? "text-danger" : "text-text-subtle"} />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-normal text-text-primary kpi-value">{lowStockItems.length}</div>
            <p className="text-[10px] text-text-muted mt-1 font-medium">Items below threshold</p>
          </CardContent>
        </Card>
        
        <Card className="shrink-0 w-[280px] bg-bg-surface border-border">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-normal uppercase text-text-muted tracking-widest">Inventory Value</CardTitle>
            <ShoppingBag size={14} className="text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-normal text-text-primary kpi-value">
              ₹ {items.reduce((acc, i) => acc + (i.current_stock * i.cost_per_unit), 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-text-muted mt-1 font-medium">Total on-hand value</p>
          </CardContent>
        </Card>

        {lowStockItems.slice(0, 3).map((item) => (
          <div key={item.id} className="shrink-0 w-[240px] bg-danger/5 border border-danger/20 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-normal text-danger uppercase tracking-tighter truncate w-32">{item.name}</span>
              <Badge className="bg-danger text-white border-none text-[8px] h-4 font-medium">Low</Badge>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-sm font-normal text-text-primary kpi-value">
                {item.current_stock} <span className="text-[9px] text-text-muted uppercase">{item.unit}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-[9px] font-medium uppercase bg-danger/10 text-danger hover:bg-danger/20 px-2"
                onClick={() => {
                  setSelectedItem(item)
                  setTransactionType("restock")
                  setIsTransactionModalOpen(true)
                }}
              >
                Restock
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Main Table */}
        <div className="flex-1 bg-bg-surface border border-border rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-border bg-bg-elevated/10 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" size={14} />
              <Input 
                placeholder="Search inventory items..." 
                className="pl-9 h-9 bg-bg-base border-border text-xs focus:ring-1 focus:ring-primary" 
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader className="bg-bg-elevated/30 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-[10px] uppercase font-normal text-text-subtle tracking-widest h-10">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                   <TableRow>
                     <TableCell colSpan={columns.length} className="p-0">
                        <TableSkeleton columns={columns.length} rows={10} />
                     </TableCell>
                   </TableRow>
                ) : table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-border hover:bg-bg-hover/30 group">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5 h-12">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center opacity-50 space-y-2">
                        <ShoppingBag size={32} />
                        <p className="text-sm font-normal uppercase tracking-wider">No inventory items yet</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Right Detail Panel (Collapsible logic could be added) */}
        {selectedItem && isHistoryOpen && (
          <div className="w-[380px] bg-bg-surface border border-border rounded-xl flex flex-col shadow-lg animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-border bg-bg-elevated/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-bg-elevated rounded-lg text-primary">
                    <History size={18} />
                 </div>
                 <div>
                    <h3 className="text-sm font-normal uppercase text-text-primary truncate w-48 leading-none">{selectedItem.name}</h3>
                    <p className="text-[10px] text-text-muted font-medium">Transaction History</p>
                 </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsHistoryOpen(false)}>
                <ChevronRight size={18} />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <TransactionHistory item={selectedItem} />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="bg-bg-surface border-border">
          <DialogHeader>
            <DialogTitle>Inventory Categories</DialogTitle>
          </DialogHeader>
          <InventoryCategoryManager />
        </DialogContent>
      </Dialog>

      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="bg-bg-surface border-border">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
            <DialogDescription>Define ingredient or supply details and stock alert thresholds.</DialogDescription>
          </DialogHeader>
          <InventoryItemForm initialData={selectedItem} onSuccess={() => setIsItemModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
        <DialogContent className="bg-bg-surface border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="capitalize">{transactionType} Inventory</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <TransactionForm 
              item={selectedItem} 
              type={transactionType} 
              onSuccess={() => setIsTransactionModalOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
