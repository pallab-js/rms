"use client"

import React from "react"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import { useMenuStore } from "@/stores/useMenuStore"
import { MenuCategory } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().min(1),
  icon: z.string().min(1),
  sort_order: z.coerce.number(),
  is_active: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  initialData?: MenuCategory | null
  onSuccess: () => void
}

export default function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const { addCategory, updateCategory } = useMenuStore()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryFormValues>,
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          color: initialData.color,
          icon: initialData.icon || "UtensilsCrossed",
          sort_order: initialData.sort_order,
          is_active: initialData.is_active,
        }
      : {
          name: "",
          description: "",
          color: "#f59e0b",
          icon: "UtensilsCrossed",
          sort_order: 0,
          is_active: true,
        },
  })

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (initialData) {
        await updateCategory(initialData.id, data)
        toast.success("Category updated")
      } else {
        await addCategory(data)
        toast.success("Category added")
      }
      onSuccess()
    } catch {
      toast.error("An error occurred")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cat_name">Category Name</Label>
          <Input id="cat_name" {...form.register("name")} placeholder="e.g. Main Course" className="bg-bg-base border-border" />
          {form.formState.errors.name && <p className="text-xs text-danger">{form.formState.errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat_desc">Description</Label>
          <Textarea id="cat_desc" {...form.register("description")} placeholder="Category details..." className="bg-bg-base border-border min-h-[80px]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="color">Theme Color</Label>
            <div className="flex gap-2">
              <Input 
                id="color" 
                type="color" 
                {...form.register("color")} 
                className="w-12 h-10 p-1 bg-bg-base border-border cursor-pointer" 
              />
              <Input 
                value={form.watch("color")} 
                onChange={(e) => form.setValue("color", e.target.value)} 
                className="bg-bg-base border-border font-mono" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input id="sort_order" type="number" {...form.register("sort_order")} className="bg-bg-base border-border" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border border-border rounded-md bg-bg-base/30">
          <div className="space-y-0.5">
            <Label>Active Status</Label>
            <p className="text-[10px] text-text-muted">Show this category in menu</p>
          </div>
          <Switch checked={form.watch("is_active")} onCheckedChange={(val) => form.setValue("is_active", val)} />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  )
}
