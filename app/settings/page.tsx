"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { 
  Store, 
  CreditCard, 
  ReceiptText, 
  Clock, 
  LayoutList, 
  Database as DbIcon, 
  Info,
  Save,
  Download,
  Upload,
  HardDrive
} from "lucide-react"

import { useSettingsStore } from "@/stores/useSettingsStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { DbInfo } from "@/types"

const settingsSchema = z.object({
  restaurant_name: z.string().min(1, "Restaurant name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  currency_symbol: z.string().min(1, "Currency symbol is required"),
  tax_rate: z.coerce.number().min(0, "Tax rate cannot be negative"),
  tax_label: z.string().min(1, "Tax label is required"),
  tax_inclusive: z.boolean(),
  receipt_header: z.string(),
  receipt_footer: z.string(),
  timezone: z.string(),
  order_prefix: z.string(),
  default_order_type: z.enum(["dine_in", "takeaway", "delivery"]),
  auto_refresh_interval: z.coerce.number().min(5, "Minimum 5 seconds"),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const { settings, fetchSettings, updateMultipleSettings } = useSettingsStore()
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null)
  const [appVersion, setAppVersion] = useState("")

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as Resolver<SettingsFormValues>,
    defaultValues: settings,
  })

  const loadSystemInfo = useCallback(async () => {
    try {
      const info = await invoke<DbInfo>("get_db_info")
      setDbInfo(info)
      const version = await invoke<string>("get_app_version")
      setAppVersion(version)
    } catch {
      console.error("Failed to load system info")
    }
  }, [])

  const loadData = useCallback(() => {
    fetchSettings()
    loadSystemInfo()
  }, [fetchSettings, loadSystemInfo])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    form.reset(settings)
  }, [settings, form])

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await updateMultipleSettings(data)
      toast.success("Settings updated successfully")
    } catch {
      toast.error("Failed to update settings")
    }
  }

  const handleExportDb = async () => {
    try {
      // In a real app, we'd use tauri-plugin-dialog to pick a path
      // For this phase, we'll just log or show a toast
      toast.info("Export functionality will be fully implemented with file dialog in later phase.")
    } catch {
      toast.error("Export failed")
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">Settings</h2>
          <p className="text-text-muted">Manage your restaurant configuration and system preferences.</p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} className="gap-2">
          <Save size={18} />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-bg-surface border border-border p-1">
          <TabsTrigger value="profile" className="gap-2">
            <Store size={16} /> Restaurant Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard size={16} /> Billing & Tax
          </TabsTrigger>
          <TabsTrigger value="receipt" className="gap-2">
            <ReceiptText size={16} /> Receipt & KOT
          </TabsTrigger>
          <TabsTrigger value="operations" className="gap-2">
            <Clock size={16} /> Operations
          </TabsTrigger>
          <TabsTrigger value="display" className="gap-2">
            <LayoutList size={16} /> Menu Display
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <DbIcon size={16} /> Data Management
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-2">
            <Info size={16} /> About
          </TabsTrigger>
        </TabsList>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Section 1: Restaurant Profile */}
          <TabsContent value="profile">
            <Card className="bg-bg-surface border-border">
              <CardHeader>
                <CardTitle>Restaurant Profile</CardTitle>
                <CardDescription>General information about your restaurant.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant_name">Restaurant Name</Label>
                    <Input id="restaurant_name" {...form.register("restaurant_name")} className="bg-bg-base border-border" />
                    {form.formState.errors.restaurant_name && (
                      <p className="text-xs text-danger">{form.formState.errors.restaurant_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...form.register("phone")} className="bg-bg-base border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...form.register("email")} className="bg-bg-base border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...form.register("address")} className="bg-bg-base border-border" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section 2: Billing & Tax */}
          <TabsContent value="billing">
            <Card className="bg-bg-surface border-border">
              <CardHeader>
                <CardTitle>Billing & Tax</CardTitle>
                <CardDescription>Configure currency and tax settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency_symbol">Currency Symbol</Label>
                    <Input id="currency_symbol" {...form.register("currency_symbol")} className="bg-bg-base border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_label">Tax Label (e.g. GST, VAT)</Label>
                    <Input id="tax_label" {...form.register("tax_label")} className="bg-bg-base border-border" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                    <Input id="tax_rate" type="number" step="0.01" {...form.register("tax_rate")} className="bg-bg-base border-border" />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-md bg-bg-base/50 mt-8">
                    <div className="space-y-0.5">
                      <Label>Tax Inclusive Pricing</Label>
                      <p className="text-xs text-text-muted">Prices already include tax</p>
                    </div>
                    <Switch 
                      checked={form.watch("tax_inclusive")} 
                      onCheckedChange={(val) => form.setValue("tax_inclusive", val)} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section 3: Receipt & KOT */}
          <TabsContent value="receipt">
            <Card className="bg-bg-surface border-border">
              <CardHeader>
                <CardTitle>Receipt & KOT</CardTitle>
                <CardDescription>Customize print output for customers and kitchen.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receipt_header">Receipt Header Text</Label>
                  <Input id="receipt_header" {...form.register("receipt_header")} className="bg-bg-base border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt_footer">Receipt Footer Text</Label>
                  <Input id="receipt_footer" {...form.register("receipt_footer")} className="bg-bg-base border-border" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section 4: Operations */}
          <TabsContent value="operations">
            <Card className="bg-bg-surface border-border">
              <CardHeader>
                <CardTitle>Operations</CardTitle>
                <CardDescription>General application behavior settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order_prefix">Order Number Prefix</Label>
                    <Input id="order_prefix" {...form.register("order_prefix")} className="bg-bg-base border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" {...form.register("timezone")} className="bg-bg-base border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auto_refresh_interval">Dashboard Auto-refresh (seconds)</Label>
                  <Input id="auto_refresh_interval" type="number" {...form.register("auto_refresh_interval")} className="bg-bg-base border-border" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section 5: Menu Display */}
          <TabsContent value="display">
            <Card className="bg-bg-surface border-border">
              <CardHeader>
                <CardTitle>Menu Display</CardTitle>
                <CardDescription>Configure how menu items are shown in POS.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-muted italic">Menu sorting and display preferences will be implemented in Phase 3.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section 6: Data Management */}
          <TabsContent value="data">
            <Card className="bg-bg-surface border-border">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Backup and restore your local database.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-bg-base/30">
                  <div className="p-3 bg-bg-elevated rounded-full text-primary">
                    <HardDrive size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary">SQLite Database</h4>
                    <p className="text-xs text-text-muted truncate max-w-md">{dbInfo?.path || "Loading..."}</p>
                    <p className="text-xs text-text-muted mt-1">Size: {dbInfo ? (dbInfo.size_bytes / 1024).toFixed(2) + " KB" : "..."}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button type="button" variant="outline" className="gap-2 border-border hover:bg-bg-hover" onClick={handleExportDb}>
                    <Download size={18} /> Export Database
                  </Button>
                  <Button type="button" variant="outline" className="gap-2 border-border hover:bg-bg-hover" disabled>
                    <Upload size={18} /> Import Database
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section 7: About */}
          <TabsContent value="about">
            <Card className="bg-bg-surface border-border">
              <CardHeader>
                <CardTitle>About RestaurantOS</CardTitle>
                <CardDescription>Application version and system details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-text-muted">Version</span>
                  <span className="text-sm font-mono text-text-primary">{appVersion || "1.0.0"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-text-muted">Target Platform</span>
                  <span className="text-sm text-text-primary">macOS Apple Silicon</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-text-muted">Database Engine</span>
                  <span className="text-sm text-text-primary">SQLite 3.x</span>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-xs text-text-subtle">RestaurantOS — Professional Restaurant Management System</p>
                  <p className="text-[10px] text-text-subtle mt-1">© 2026 RestaurantOS Team. All Rights Reserved.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}
