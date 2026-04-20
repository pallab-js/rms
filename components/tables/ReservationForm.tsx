"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTableStore } from "@/stores/useTableStore"
import { Reservation, ReservationStatus } from "@/types"
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

const reservationSchema = z.object({
  guest_name: z.string().min(1, "Guest name is required"),
  guest_phone: z.string().optional(),
  party_size: z.number().min(1),
  table_id: z.number().nullable(),
  reserved_date: z.string(),
  reserved_time: z.string(),
  duration_min: z.number().min(1),
  status: z.enum(["confirmed", "seated", "cancelled", "no-show"]),
  notes: z.string().optional(),
})

type ReservationFormValues = z.infer<typeof reservationSchema>

interface ReservationFormProps {
  initialData?: Reservation | null
  onSuccess: () => void
}

export default function ReservationForm({ initialData, onSuccess }: ReservationFormProps) {
  const { tables, addReservation, updateReservation, selectedDate } = useTableStore()

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: initialData
      ? {
          guest_name: initialData.guest_name,
          guest_phone: initialData.guest_phone || "",
          party_size: initialData.party_size,
          table_id: initialData.table_id,
          reserved_date: initialData.reserved_date,
          reserved_time: initialData.reserved_time,
          duration_min: initialData.duration_min,
          status: initialData.status,
          notes: initialData.notes || "",
        }
      : {
          guest_name: "",
          guest_phone: "",
          party_size: 2,
          table_id: null,
          reserved_date: selectedDate,
          reserved_time: "19:00",
          duration_min: 90,
          status: "confirmed",
          notes: "",
        },
  })

  const onSubmit = async (data: ReservationFormValues) => {
    try {
      if (initialData) {
        await updateReservation(initialData.id, data)
        toast.success("Reservation updated")
      } else {
        await addReservation(data)
        toast.success("Reservation confirmed")
      }
      onSuccess()
    } catch {
      toast.error("Failed to save reservation")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="guest_name">Guest Name</Label>
        <Input id="guest_name" {...form.register("guest_name")} placeholder="Full Name" className="bg-bg-base border-border" />
        {form.formState.errors.guest_name && (
          <p className="text-xs text-danger">{form.formState.errors.guest_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guest_phone">Phone Number</Label>
          <Input id="guest_phone" {...form.register("guest_phone")} placeholder="+91 ..." className="bg-bg-base border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="party_size">Party Size</Label>
          <Input id="party_size" type="number" {...form.register("party_size")} className="bg-bg-base border-border" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reserved_date">Date</Label>
          <Input id="reserved_date" type="date" {...form.register("reserved_date")} className="bg-bg-base border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reserved_time">Time</Label>
          <Input id="reserved_time" type="time" {...form.register("reserved_time")} className="bg-bg-base border-border" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="table_id">Assigned Table</Label>
          <Select
            onValueChange={(val) => form.setValue("table_id", val === "none" ? null : Number(val))}
            defaultValue={form.getValues("table_id") ? String(form.getValues("table_id")) : "none"}
          >
            <SelectTrigger className="bg-bg-base border-border">
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent className="bg-bg-elevated border-border max-h-[200px]">
              <SelectItem value="none">Unassigned</SelectItem>
              {tables.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>{t.table_number} ({t.capacity} seats)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (min)</Label>
          <Input id="duration" type="number" {...form.register("duration_min")} className="bg-bg-base border-border" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="res_status">Status</Label>
        <Select
          onValueChange={(val) => form.setValue("status", val as ReservationStatus)}
          defaultValue={form.getValues("status")}
        >
          <SelectTrigger className="bg-bg-base border-border">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-bg-elevated border-border">
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="seated">Seated</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No-Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...form.register("notes")} placeholder="Special requests, allergies..." className="bg-bg-base border-border min-h-[80px]" />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="w-full">
          {initialData ? "Update Reservation" : "Confirm Reservation"}
        </Button>
      </div>
    </form>
  )
}
