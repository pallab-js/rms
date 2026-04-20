"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { InventoryItem, TransactionType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const transactionSchema = z.object({
  quantity: z.number().min(0.01, "Quantity must be greater than zero"),
  notes: z.string().optional(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  item: InventoryItem
  type: TransactionType
  onSuccess: () => void
}

export default function TransactionForm({ item, type, onSuccess }: TransactionFormProps) {
  const { recordTransaction } = useInventoryStore()

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      quantity: 1,
      notes: "",
    },
  })

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      await recordTransaction(item.id, type, data.quantity, data.notes)
      toast.success(`Inventory updated: ${type}`)
      onSuccess()
    } catch {
      toast.error("Failed to update inventory")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="p-3 bg-bg-base/30 rounded-lg border border-border mb-4">
        <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Item</p>
        <p className="text-sm font-bold text-text-primary">{item.name}</p>
        <p className="text-[10px] text-text-muted mt-1">Current Stock: {item.current_stock} {item.unit}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qty">Quantity to {type} ({item.unit})</Label>
        <Input id="qty" type="number" step="0.01" {...form.register("quantity")} className="bg-bg-base border-border" autoFocus />
        {form.formState.errors.quantity && (
          <p className="text-xs text-danger">{form.formState.errors.quantity.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Transaction Notes</Label>
        <Textarea id="notes" {...form.register("notes")} placeholder="e.g. Received from supplier, Weekly audit..." className="bg-bg-base border-border min-h-[80px]" />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="w-full">
          Confirm {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      </div>
    </form>
  )
}
