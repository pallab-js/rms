"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTableStore } from "@/stores/useTableStore"
import { RestaurantTable, TableShape, TableStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const tableSchema = z.object({
  table_number: z.string().min(1, "Table number is required"),
  capacity: z.number().min(1, "Minimum capacity is 1"),
  section: z.string().min(1),
  shape: z.enum(["rectangle", "circle", "square"]),
  status: z.enum(["available", "occupied", "reserved", "cleaning"]),
})

type TableFormValues = z.infer<typeof tableSchema>

interface TableFormProps {
  initialData?: RestaurantTable | null
  onSuccess: () => void
}

export default function TableForm({ initialData, onSuccess }: TableFormProps) {
  const { addTable, updateTable } = useTableStore()

  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: initialData
      ? {
          table_number: initialData.table_number,
          capacity: initialData.capacity,
          section: initialData.section,
          shape: initialData.shape,
          status: initialData.status,
        }
      : {
          table_number: "",
          capacity: 4,
          section: "Main",
          shape: "rectangle",
          status: "available",
        },
  })

  const onSubmit = async (data: TableFormValues) => {
    try {
      if (initialData) {
        await updateTable(initialData.id, data)
        toast.success("Table updated")
      } else {
        await addTable({
          ...data,
          pos_x: 50,
          pos_y: 50,
        })
        toast.success("Table added to floor plan")
      }
      onSuccess()
    } catch {
      toast.error("Failed to save table")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="table_number">Table Number</Label>
          <Input id="table_number" {...form.register("table_number")} placeholder="e.g. T1" className="bg-bg-base border-border" />
          {form.formState.errors.table_number && (
            <p className="text-xs text-danger">{form.formState.errors.table_number.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input id="capacity" type="number" {...form.register("capacity")} className="bg-bg-base border-border" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="section">Section</Label>
        <Input id="section" {...form.register("section")} placeholder="Main, VIP, Terrace..." className="bg-bg-base border-border" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shape">Shape</Label>
          <Select
            onValueChange={(val) => form.setValue("shape", val as TableShape)}
            defaultValue={form.getValues("shape")}
          >
            <SelectTrigger className="bg-bg-base border-border">
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent className="bg-bg-elevated border-border">
              <SelectItem value="rectangle">Rectangle</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="square">Square</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Initial Status</Label>
          <Select
            onValueChange={(val) => form.setValue("status", val as TableStatus)}
            defaultValue={form.getValues("status")}
          >
            <SelectTrigger className="bg-bg-base border-border">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-bg-elevated border-border">
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="w-full">
          {initialData ? "Update Table" : "Add Table"}
        </Button>
      </div>
    </form>
  )
}
