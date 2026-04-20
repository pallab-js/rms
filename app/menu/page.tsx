"use client"

import React, { useEffect, useState, useCallback } from "react"
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  ArrowUpDown,
  UtensilsCrossed,
  LayoutList,
  GripVertical
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
import { toast } from "sonner"
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useMenuStore } from "@/stores/useMenuStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { MenuItem, MenuCategory, Modifier } from "@/types"
import { useSearchParams } from "next/navigation"
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import TableSkeleton from "@/components/shared/TableSkeleton"

import MenuItemForm from "@/components/menu/MenuItemForm"
import CategoryForm from "@/components/menu/CategoryForm"
import ModifierForm from "@/components/menu/ModifierForm"

function MenuContent() {
  const { 
    categories, 
    items, 
    modifiers,
    isLoading, 
    fetchCategories, 
    fetchItems, 
    fetchModifiers,
    toggleItemAvailability,
    deleteItem,
    deleteCategory,
    deleteModifier,
    reorderCategories
  } = useMenuStore()
  const { settings } = useSettingsStore()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get("id")
  
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeTab, setActiveTab] = useState("items")

  // Auto-filter based on search param
  useEffect(() => {
    if (highlightId && items.length > 0) {
      const item = items.find(i => i.id === parseInt(highlightId) || i.sku === highlightId)
      if (item) setGlobalFilter(item.name)
    }
  }, [highlightId, items])

  // Modal/Sheet States
  const [isItemSheetOpen, setIsItemSheetOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null)
  
  const [isModifierDialogOpen, setIsModifierDialogOpen] = useState(false)
  const [selectedModifier, setSelectedModifier] = useState<Modifier | null>(null)

  const loadData = useCallback(() => {
    fetchCategories()
    fetchItems()
    fetchModifiers()
  }, [fetchCategories, fetchItems, fetchModifiers])

  useEffect(() => {
    loadData()
  }, [loadData])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id)
      const newIndex = categories.findIndex((c) => c.id === over.id)
      const newOrderedIds = arrayMove(categories, oldIndex, newIndex).map(c => c.id)
      reorderCategories(newOrderedIds)
    }
  }

  const columns: ColumnDef<MenuItem>[] = [
    {
      accessorKey: "image_path",
      header: "Image",
      cell: ({ row }) => (
        <div className="w-10 h-10 rounded bg-bg-elevated flex items-center justify-center overflow-hidden border border-border">
          {row.original.image_path ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={row.original.image_path} alt={row.original.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={16} className="text-text-subtle" />
          )}
        </div>
      )
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="hover:bg-transparent px-0">
          Name <ArrowUpDown size={14} className="ml-2" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">{row.original.name}</span>
          <span className="text-[10px] font-mono text-text-muted">{row.original.sku || "NO-SKU"}</span>
        </div>
      )
    },
    {
      accessorKey: "category_name",
      header: "Category",
      cell: ({ row }) => <Badge variant="secondary" className="bg-bg-elevated text-text-muted border-border font-normal">{row.original.category_name}</Badge>
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <span className="text-text-primary">{settings.currency_symbol} {row.original.price.toFixed(2)}</span>
    },
    {
      accessorKey: "cost_price",
      header: "Cost",
      cell: ({ row }) => <span className="text-text-muted">{settings.currency_symbol} {row.original.cost_price.toFixed(2)}</span>
    },
    {
      accessorKey: "margin",
      header: "Margin",
      cell: ({ row }) => {
        const margin = row.original.margin || 0
        return (
          <span className={cn(
            "text-xs font-medium",
            margin > 50 ? "text-success" : margin > 20 ? "text-warning" : "text-danger"
          )}>
            {margin.toFixed(1)}%
          </span>
        )
      }
    },
    {
      accessorKey: "is_available",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={cn(
          "gap-1 font-medium",
          row.original.is_available ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
        )}>
          <div className={cn("w-1.5 h-1.5 rounded-full", row.original.is_available ? "bg-success" : "bg-danger")} />
          {row.original.is_available ? "Available" : "Sold Out"}
        </Badge>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text-primary">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-bg-elevated border-border">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => {
              setSelectedItem(row.original)
              setIsItemSheetOpen(true)
            }}>
              <Edit size={14} /> Edit Item
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={() => toggleItemAvailability(row.original.id, !row.original.is_available)}
            >
              {row.original.is_available ? <EyeOff size={14} /> : <Eye size={14} />}
              {row.original.is_available ? "Mark as Unavailable" : "Mark as Available"}
            </DropdownMenuItem>
            <Separator className="my-1 bg-border" />
            <DropdownMenuItem 
              className="gap-2 cursor-pointer text-danger focus:text-danger"
              onClick={async () => {
                if (confirm(`Are you sure you want to delete ${row.original.name}?`)) {
                  try {
                    await deleteItem(row.original.id)
                    toast.success("Item deleted")
                  } catch {
                    toast.error("Failed to delete item")
                  }
                }
              }}
            >
              <Trash2 size={14} /> Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Insights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard title="Total Items" value={items.length} />
        <InsightCard title="Active Items" value={items.filter(i => i.is_available).length} color="text-success" />
        <InsightCard 
          title="Avg Price" 
          value={`${settings.currency_symbol} ${items.length > 0 ? (items.reduce((acc, curr) => acc + curr.price, 0) / items.length).toFixed(2) : "0.00"}`} 
        />
        <InsightCard title="Total Categories" value={categories.length} color="text-primary" />
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-bg-surface border border-border">
              <TabsTrigger value="items">Menu Items</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" size={14} />
                <Input 
                  placeholder="Search..." 
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9 h-9 w-64 bg-bg-surface border-border focus:border-primary focus:ring-1 focus:ring-primary" 
                />
              </div>
              <Button className="gap-2 h-9" onClick={() => {
                if (activeTab === "items") {
                  setSelectedItem(null)
                  setIsItemSheetOpen(true)
                } else if (activeTab === "categories") {
                  setSelectedCategory(null)
                  setIsCategoryDialogOpen(true)
                } else {
                  setSelectedModifier(null)
                  setIsModifierDialogOpen(true)
                }
              }}>
                <Plus size={16} /> 
                {activeTab === "items" ? "Add Item" : activeTab === "categories" ? "Add Category" : "Add Modifier"}
              </Button>
            </div>
          </div>

          <TabsContent value="items" className="mt-0 border border-border rounded-lg bg-bg-surface overflow-hidden">
            <Table>
              <TableHeader className="bg-bg-elevated/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-text-muted font-medium py-3 h-auto">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="border-border hover:bg-bg-hover/50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center text-text-muted">
                      No items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
             <DndContext 
               sensors={sensors}
               collisionDetection={closestCenter}
               onDragEnd={handleDragEnd}
             >
               <SortableContext 
                 items={categories.map(c => c.id)}
                 strategy={verticalListSortingStrategy}
               >
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {categories.map((category) => (
                     <SortableCategoryCard 
                       key={category.id} 
                       category={category} 
                       onEdit={() => {
                         setSelectedCategory(category)
                         setIsCategoryDialogOpen(true)
                       }}
                       onDelete={async () => {
                         if (confirm(`Delete ${category.name}? This will affect items in this category.`)) {
                           try {
                             await deleteCategory(category.id)
                             toast.success("Category deleted")
                           } catch {
                             toast.error("Failed to delete")
                           }
                         }
                       }}
                     />
                   ))}
                 </div>
               </SortableContext>
             </DndContext>
          </TabsContent>

          <TabsContent value="modifiers" className="mt-0">
            {modifiers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modifiers.map((mod) => (
                  <Card key={mod.id} className="bg-bg-surface border-border group">
                    <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                      <div className="flex flex-col">
                         <CardTitle className="text-base text-text-primary">{mod.name}</CardTitle>
                         <span className="text-[10px] text-text-muted uppercase font-semibold">
                           Item ID: {mod.menu_item_id} {mod.is_required && "• Required"}
                         </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-bg-elevated border-border">
                          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => {
                            setSelectedModifier(mod)
                            setIsModifierDialogOpen(true)
                          }}><Edit size={14} /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer text-danger focus:text-danger" onClick={async () => {
                             if (confirm("Delete this modifier group?")) {
                               await deleteModifier(mod.id)
                               toast.success("Modifier deleted")
                             }
                          }}><Trash2 size={14} /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mod.options.map((opt, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] bg-bg-base border-border">
                            {opt.label} ({opt.price_delta > 0 ? "+" : ""}{opt.price_delta})
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-bg-surface border border-dashed border-border rounded-lg">
                <div className="w-12 h-12 bg-bg-elevated rounded-full flex items-center justify-center mx-auto mb-3">
                  <LayoutList size={24} className="text-text-subtle" />
                </div>
                <h3 className="text-sm font-medium text-text-primary">No modifiers created yet</h3>
                <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">Create modifier groups like &quot;Size&quot; or &quot;Add-ons&quot; to customize your menu items.</p>
                <Button variant="outline" className="mt-4 gap-2 border-border" onClick={() => {
                   setSelectedModifier(null)
                   setIsModifierDialogOpen(true)
                }}>
                  <Plus size={14} /> Create First Modifier
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Forms Modals/Sheets */}
      <Sheet open={isItemSheetOpen} onOpenChange={setIsItemSheetOpen}>
        <SheetContent className="bg-bg-surface border-border sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedItem ? "Edit Menu Item" : "Add New Menu Item"}</SheetTitle>
            <SheetDescription>Fill in the details for your menu item. Fields marked with * are required.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <MenuItemForm initialData={selectedItem} onSuccess={() => setIsItemSheetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="bg-bg-surface border-border">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>Categories help organize your menu items for easier navigation.</DialogDescription>
          </DialogHeader>
          <CategoryForm initialData={selectedCategory} onSuccess={() => setIsCategoryDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isModifierDialogOpen} onOpenChange={setIsModifierDialogOpen}>
        <DialogContent className="bg-bg-surface border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedModifier ? "Edit Modifier" : "Add Modifier"}</DialogTitle>
            <DialogDescription>Define options that can be added to menu items.</DialogDescription>
          </DialogHeader>
          <ModifierForm initialData={selectedModifier} onSuccess={() => setIsModifierDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InsightCard({ title, value, color = "text-text-primary" }: { title: string, value: string | number, color?: string }) {
  return (
    <Card className="bg-bg-surface border-border">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className={cn("text-2xl font-bold", color)}>{value}</div>
      </CardContent>
    </Card>
  )
}

function SortableCategoryCard({ category, onEdit, onDelete }: { category: MenuCategory, onEdit: () => void, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <Card className="bg-bg-surface border-border hover:border-primary/50 transition-all group relative">
        <div 
          {...attributes} 
          {...listeners} 
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 text-text-subtle hover:text-text-primary transition-opacity"
        >
          <GripVertical size={16} />
        </div>
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 pl-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md" style={{ backgroundColor: category.color + "22", color: category.color }}>
              <UtensilsCrossed size={18} />
            </div>
            <CardTitle className="text-base text-text-primary">{category.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-bg-elevated border-border">
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onEdit}><Edit size={14} /> Edit</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer text-danger focus:text-danger" onClick={onDelete}><Trash2 size={14} /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 pt-0 pl-8">
          <p className="text-xs text-text-muted line-clamp-1">{category.description || "No description"}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">Order: {category.sort_order}</span>
            <Badge variant={category.is_active ? "default" : "secondary"} className={cn("text-[10px] px-1.5 py-0", category.is_active ? "bg-success/10 text-success border-success/20" : "bg-bg-elevated text-text-muted border-border")}>
              {category.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Suspense } from "react"

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  )
}
