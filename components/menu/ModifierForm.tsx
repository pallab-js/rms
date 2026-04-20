"use client"

import React from "react"
import { useForm, useFieldArray, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Plus, X } from "lucide-react"

import { useMenuStore } from "@/stores/useMenuStore"
import { Modifier } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

const modifierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  menu_item_id: z.coerce.number().min(1, "Menu item is required"),
  is_required: z.boolean(),
  options: z.array(z.object({
    label: z.string().min(1, "Label is required"),
    price_delta: z.coerce.number(),
  })).min(1, "At least one option is required"),
})

type ModifierFormValues = z.infer<typeof modifierSchema>

interface ModifierFormProps {
  initialData?: Modifier | null
  onSuccess: () => void
}

export default function ModifierForm({ initialData, onSuccess }: ModifierFormProps) {
  const { items, addModifier, updateModifier } = useMenuStore()

  const form = useForm<ModifierFormValues>({
    resolver: zodResolver(modifierSchema) as Resolver<ModifierFormValues>,
    defaultValues: initialData
      ? {
          name: initialData.name,
          menu_item_id: initialData.menu_item_id,
          is_required: initialData.is_required,
          options: initialData.options,
        }
      : {
          name: "",
          menu_item_id: 0,
          is_required: false,
          options: [{ label: "", price_delta: 0 }],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  })

  const onSubmit = async (data: ModifierFormValues) => {
    try {
      if (initialData) {
        await updateModifier(initialData.id, data)
        toast.success("Modifier updated")
      } else {
        await addModifier(data)
        toast.success("Modifier added")
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
            <Label htmlFor="mod_name">Group Name</Label>
            <Input id="mod_name" {...form.register("name")} placeholder="e.g. Spice Level" className="bg-bg-base border-border" />
            {form.formState.errors.name && <p className="text-xs text-danger">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mod_item">Apply to Item</Label>
            <Select 
              onValueChange={(val) => form.setValue("menu_item_id", Number(val))} 
              defaultValue={String(form.getValues("menu_item_id"))}
            >
              <SelectTrigger className="bg-bg-base border-border">
                <SelectValue placeholder="Select Item" />
              </SelectTrigger>
              <SelectContent className="bg-bg-elevated border-border max-h-[200px]">
                {items.map((i) => (
                  <SelectItem key={i.id} value={String(i.id)}>{i.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.menu_item_id && <p className="text-xs text-danger">{form.formState.errors.menu_item_id.message}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border border-border rounded-md bg-bg-base/30">
          <div className="space-y-0.5">
            <Label>Is Required</Label>
            <p className="text-[10px] text-text-muted">Force selection at checkout</p>
          </div>
          <Switch checked={form.watch("is_required")} onCheckedChange={(val) => form.setValue("is_required", val)} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ label: "", price_delta: 0 })} className="h-7 text-xs gap-1 border-border">
              <Plus size={12} /> Add Option
            </Button>
          </div>
          
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input 
                    {...form.register(`options.${index}.label`)} 
                    placeholder="Option name" 
                    className="bg-bg-base border-border h-9" 
                  />
                  {form.formState.errors.options?.[index]?.label && (
                    <p className="text-[10px] text-danger mt-0.5">{form.formState.errors.options[index]?.label?.message}</p>
                  )}
                </div>
                <div className="w-24">
                  <Input 
                    type="number" 
                    step="0.01"
                    {...form.register(`options.${index}.price_delta`)} 
                    placeholder="+$0.00" 
                    className="bg-bg-base border-border h-9" 
                  />
                </div>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-9 w-9 text-text-muted hover:text-danger">
                    <X size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {form.formState.errors.options?.root && (
            <p className="text-xs text-danger">{form.formState.errors.options.root.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? "Update Modifier" : "Create Modifier"}
        </Button>
      </div>
    </form>
  )
}
