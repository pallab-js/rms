"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
  CommandSeparator
} from "@/components/ui/command"
import { 
  Search, 
  LayoutDashboard, 
  Receipt, 
  UtensilsCrossed, 
  Package, 
  Users, 
  Settings 
} from "lucide-react"
import { useMenuStore } from "@/stores/useMenuStore"
import { useOrderStore } from "@/stores/useOrderStore"

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { items, fetchItems } = useMenuStore()
  const { orders, fetchOrders } = useOrderStore()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (open) {
      fetchItems()
      fetchOrders()
    }
  }, [open, fetchItems, fetchOrders])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="relative w-full group flex items-center"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle group-focus-within:text-primary transition-colors" size={16} />
        <div className="w-full pl-10 pr-4 py-1.5 bg-bg-base border border-border rounded-md text-xs text-text-subtle text-left flex justify-between items-center hover:border-border-strong transition-all">
          <span>Search everything...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-bg-elevated px-1.5 font-mono text-[10px] font-medium text-text-subtle opacity-100 group-hover:border-primary/50 group-hover:text-primary">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="bg-bg-surface border-t border-border">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/orders"))}>
              <Receipt className="mr-2 h-4 w-4" />
              <span>Orders</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/menu"))}>
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              <span>Menu</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/inventory"))}>
              <Package className="mr-2 h-4 w-4" />
              <span>Inventory</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/staff"))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Staff</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="bg-border" />

          <CommandGroup heading="Menu Items">
            {items.slice(0, 10).map((item) => (
              <CommandItem key={item.id} onSelect={() => runCommand(() => router.push(`/menu?id=${item.id}`))}>
                <UtensilsCrossed className="mr-2 h-4 w-4 opacity-50" />
                <span>{item.name}</span>
                <span className="ml-auto text-[10px] text-text-subtle font-mono">{item.sku}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="bg-border" />

          <CommandGroup heading="Recent Orders">
            {orders.slice(0, 5).map((order) => (
              <CommandItem key={order.id} onSelect={() => runCommand(() => router.push(`/orders?id=${order.id}`))}>
                <Receipt className="mr-2 h-4 w-4 opacity-50" />
                <span>{order.order_number}</span>
                <span className="ml-auto text-[10px] text-text-subtle">{order.status}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
