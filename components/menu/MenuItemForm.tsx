"use client"

import React, { useMemo } from "react"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  RefreshCcw,
  Clock
} from "lucide-react"

import { useMenuStore } from "@/stores/useMenuStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { MenuItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category_id: z.coerce.number().min(1, "Category is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  cost_price: z.coerce.number().min(0, "Cost must be positive"),
  sku: z.string().optional(),
  prep_time_min: z.coerce.number().min(0),
  is_active: z.boolean(),
  is_available: z.boolean(),
  sort_order: z.coerce.number(),
})

type MenuItemFormValues = z.infer<typeof menuItemSchema>

interface MenuItemFormProps {
  initialData?: MenuItem | null
  onSuccess: () => void
}

export default function MenuItemForm({ initialData, onSuccess }: MenuItemFormProps) {
  const { categories, addItem, updateItem } = useMenuStore()
  const { settings } = useSettingsStore()

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema) as Resolver<MenuItemFormValues>,
    defaultValues: initialData ? {
      name: initialData.name,
      category_id: initialData.category_id,
      description: initialData.description || "",
      price: initialData.price,
      cost_price: initialData.cost_price,
      sku: initialData.sku || "",
      prep_time_min: initialData.prep_time_min,
      is_active: initialData.is_active,
      is_available: initialData.is_available,
      sort_order: initialData.sort_order,
    } : {
      name: "",
      category_id: categories.length > 0 ? categories[0].id : 0,
      description: "",
      price: 0,
      cost_price: 0,
      sku: "",
      prep_time_min: 0,
      is_active: true,
      is_available: true,
      sort_order: 0,
    }
  })

  const price = form.watch("price")
  const costPrice = form.watch("cost_price")
  const margin = useMemo(() => {
    if (price > 0) {
      return ((price - costPrice) / price) * 100
    }
    return 0
  }, [price, costPrice])

  const handleGenerateSku = () => {
    const name = form.getValues("name")
    const categoryId = form.getValues("category_id")
    const category = categories.find(c => c.id === categoryId)
    
    if (name) {
      const prefix = category ? category.name.substring(0, 3).toUpperCase() : "ITEM"
      const namePart = name.substring(0, 3).toUpperCase()
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
      form.setValue("sku", `${prefix}-${namePart}-${random}`)
    }
  }

  const onSubmit = async (data: MenuItemFormValues) => {
    try {
      if (initialData) {
        await updateItem(initialData.id, data)
        toast.success("Menu item updated")
      } else {
        await addItem({ ...data, image_path: "" }) // Image upload handled separately or in next phase
        toast.success("Menu item added")
      }
      onSuccess()
    } catch {
      toast.error("An error occurred")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input id="name" {...form.register("name")} placeholder="e.g. Grilled Chicken" className="bg-bg-base border-border" />
            {form.formState.errors.name && <p className="text-xs text-danger">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              onValueChange={(val) => form.setValue("category_id", Number(val))} 
              defaultValue={String(form.getValues("category_id"))}
            >
              <SelectTrigger className="bg-bg-base border-border">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-bg-elevated border-border">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...form.register("description")} placeholder="Item details..." className="bg-bg-base border-border min-h-[80px]" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ({settings.currency_symbol})</Label>
            <Input id="price" type="number" step="0.01" {...form.register("price")} className="bg-bg-base border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost_price">Cost Price ({settings.currency_symbol})</Label>
            <Input id="cost_price" type="number" step="0.01" {...form.register("cost_price")} className="bg-bg-base border-border" />
          </div>
          <div className="space-y-2">
            <Label>Margin (%)</Label>
            <div className={cn(
              "h-9 px-3 py-2 rounded-md border border-border bg-bg-elevated/50 text-sm font-semibold flex items-center",
              margin > 50 ? "text-success" : margin > 20 ? "text-warning" : "text-danger"
            )}>
              {margin.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <div className="flex gap-2">
              <Input id="sku" {...form.register("sku")} placeholder="AUTO-GEN-123" className="bg-bg-base border-border" />
              <Button type="button" variant="outline" size="icon" onClick={handleGenerateSku} className="shrink-0 border-border">
                <RefreshCcw size={14} />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prep_time">Prep Time (min)</Label>
            <div className="relative">
              <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" size={14} />
              <Input id="prep_time" type="number" {...form.register("prep_time_min")} className="bg-bg-base border-border pl-9" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-bg-base/30">
            <div className="space-y-0.5">
              <Label>Active Status</Label>
              <p className="text-[10px] text-text-muted">Show in menu</p>
            </div>
            <Switch checked={form.watch("is_active")} onCheckedChange={(val) => form.setValue("is_active", val)} />
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-bg-base/30">
            <div className="space-y-0.5">
              <Label>Availability</Label>
              <p className="text-[10px] text-text-muted">In stock</p>
            </div>
            <Switch checked={form.watch("is_available")} onCheckedChange={(val) => form.setValue("is_available", val)} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="submit" className="flex-1 gap-2">
          {initialData ? "Update Item" : "Create Item"}
        </Button>
      </div>
    </form>
  )
}
