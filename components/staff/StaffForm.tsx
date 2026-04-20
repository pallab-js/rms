"use client"

import React from "react"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useStaffStore } from "@/stores/useStaffStore"
import { Staff, StaffRole, SalaryType } from "@/types"
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
import { format } from "date-fns"

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(['waiter', 'chef', 'cashier', 'manager', 'cleaner', 'delivery']),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  salary: z.coerce.number().min(0),
  salary_type: z.enum(['monthly', 'daily', 'hourly']),
  join_date: z.string().optional(),
  notes: z.string().optional(),
})

type StaffFormValues = z.infer<typeof staffSchema>

interface StaffFormProps {
  initialData?: Staff | null
  onSuccess: () => void
}

export default function StaffForm({ initialData, onSuccess }: StaffFormProps) {
  const { addStaff, updateStaff } = useStaffStore()

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema) as Resolver<StaffFormValues>,
    defaultValues: initialData
      ? {
          name: initialData.name,
          role: initialData.role,
          phone: initialData.phone || "",
          email: initialData.email || "",
          salary: initialData.salary,
          salary_type: initialData.salary_type,
          join_date: initialData.join_date || format(new Date(), "yyyy-MM-dd"),
          notes: initialData.notes || "",
        }
      : {
          name: "",
          role: "waiter",
          phone: "",
          email: "",
          salary: 0,
          salary_type: "monthly",
          join_date: format(new Date(), "yyyy-MM-dd"),
          notes: "",
        },
  })

  const onSubmit = async (data: StaffFormValues) => {
    try {
      if (initialData) {
        await updateStaff(initialData.id, data)
        toast.success("Staff details updated")
      } else {
        await addStaff(data)
        toast.success("New staff member added")
      }
      onSuccess()
    } catch {
      toast.error("Failed to save staff details")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...form.register("name")} placeholder="John Doe" className="bg-bg-base border-border" />
          {form.formState.errors.name && (
            <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            onValueChange={(val) => form.setValue("role", val as StaffRole)}
            defaultValue={form.getValues("role")}
          >
            <SelectTrigger className="bg-bg-base border-border">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-bg-elevated border-border">
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="chef">Chef</SelectItem>
              <SelectItem value="waiter">Waiter</SelectItem>
              <SelectItem value="cashier">Cashier</SelectItem>
              <SelectItem value="cleaner">Cleaner</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" {...form.register("phone")} placeholder="+91 ..." className="bg-bg-base border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" {...form.register("email")} placeholder="john@example.com" className="bg-bg-base border-border" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="salary">Salary / Pay Rate</Label>
          <Input id="salary" type="number" {...form.register("salary")} className="bg-bg-base border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_type">Type</Label>
          <Select
            onValueChange={(val) => form.setValue("salary_type", val as SalaryType)}
            defaultValue={form.getValues("salary_type")}
          >
            <SelectTrigger className="bg-bg-base border-border">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-bg-elevated border-border">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="join_date">Join Date</Label>
        <Input id="join_date" type="date" {...form.register("join_date")} className="bg-bg-base border-border" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...form.register("notes")} className="bg-bg-base border-border min-h-[80px]" />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="w-full">
          {initialData ? "Update Record" : "Add Staff Member"}
        </Button>
      </div>
    </form>
  )
}
