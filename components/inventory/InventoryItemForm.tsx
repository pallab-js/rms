"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { InventoryItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category_id: z.number().nullable(),
  unit: z.string().min(1, "Unit is required"),
  current_stock: z.number().min(0),
  min_stock_alert: z.number().min(0),
  cost_per_unit: z.number().min(0),
  supplier_name: z.string().optional(),
  supplier_phone: z.string().optional(),
  notes: z.string().optional(),
})

type ItemFormValues = z.infer<typeof itemSchema>

interface ItemFormProps {
  initialData?: InventoryItem | null
  onSuccess: () => void
}

export default function InventoryItemForm({ initialData, onSuccess }: ItemFormProps) {
  const { categories, addItem, updateItem } = useInventoryStore()

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          category_id: initialData.category_id,
          unit: initialData.unit,
          current_stock: initialData.current_stock,
          min_stock_alert: initialData.min_stock_alert,
          cost_per_unit: initialData.cost_per_unit,
          supplier_name: initialData.supplier_name || "",
          supplier_phone: initialData.supplier_phone || "",
          notes: initialData.notes || "",
        }
      : {
          name: "",
          category_id: null,
          unit: "kg",
          current_stock: 0,
          min_stock_alert: 5,
          cost_per_unit: 0,
          supplier_name: "",
          supplier_phone: "",
          notes: "",
        },
  })

  const onSubmit = async (data: ItemFormValues) => {
    try {
      if (initialData) {
        await updateItem(initialData.id, data)
        toast.success("Item updated")
      } else {
        await addItem(data)
        toast.success("Item added to inventory")
      }
      onSuccess()
    } catch {
      toast.error("Failed to save item")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name</Label>
          <Input id="name" {...form.register("name")} placeholder="e.g. Chicken Breast" className="bg-bg-base border-border" />
          {form.formState.errors.name && (
            <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            onValueChange={(val) => form.setValue("category_id", val === "none" ? null : Number(val))}
            defaultValue={form.getValues("category_id") ? String(form.getValues("category_id")) : "none"}
          >
            <SelectTrigger className="bg-bg-base border-border">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-bg-elevated border-border">
              <SelectItem value="none">Uncategorized</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" {...form.register("unit")} placeholder="kg, L, pcs..." className="bg-bg-base border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="current_stock">Initial Stock</Label>
          <Input id="current_stock" type="number" step="0.01" {...form.register("current_stock")} className="bg-bg-base border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_stock">Alert Level</Label>
          <Input id="min_stock" type="number" step="0.01" {...form.register("min_stock_alert")} className="bg-bg-base border-border" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost">Cost per Unit</Label>
        <Input id="cost" type="number" step="0.01" {...form.register("cost_per_unit")} className="bg-bg-base border-border" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier_name">Supplier Name</Label>
          <Input id="supplier_name" {...form.register("supplier_name")} className="bg-bg-base border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier_phone">Supplier Phone</Label>
          <Input id="supplier_phone" {...form.register("supplier_phone")} className="bg-bg-base border-border" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...form.register("notes")} className="bg-bg-base border-border min-h-[80px]" />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="w-full">
          {initialData ? "Update Item" : "Add Item"}
        </Button>
      </div>
    </form>
  )
}
