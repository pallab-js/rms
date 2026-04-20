"use client"

import React, { useState } from "react"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Tag } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function InventoryCategoryManager() {
  const { categories, addCategory, deleteCategory } = useInventoryStore()
  const [newName, setNewName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async () => {
    if (!newName.trim()) return
    setIsSubmitting(true)
    try {
      await addCategory(newName.trim())
      setNewName("")
      toast.success("Category added")
    } catch {
      toast.error("Failed to add category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Delete category "${name}"? Items in this category will become uncategorized.`)) {
      try {
        await deleteCategory(id)
        toast.success("Category deleted")
      } catch {
        toast.error("Failed to delete category")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input 
          placeholder="New category name..." 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="bg-bg-base border-border"
          disabled={isSubmitting}
        />
        <Button onClick={handleAdd} disabled={isSubmitting || !newName.trim()} className="gap-2">
          <Plus size={16} /> Add
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] font-normal uppercase text-text-muted tracking-widest px-1">Existing Categories</h3>
        <ScrollArea className="h-[300px] border border-border rounded-lg bg-bg-base/30">
          <div className="p-2 space-y-1">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="flex items-center justify-between p-2 rounded-md hover:bg-bg-hover group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-text-subtle" />
                  <span className="text-sm text-text-primary">{cat.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-text-subtle hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(cat.id, cat.name)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="py-8 text-center text-text-muted text-xs italic">
                No categories found.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
