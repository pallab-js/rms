"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useReportStore } from "@/stores/useReportStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { 
  TrendingUp, 
  UtensilsCrossed, 
  Wallet, 
  Calendar as CalendarIcon,
  Printer,
  ChevronDown,
  Users
} from "lucide-react"
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

import SalesCharts from "@/components/reports/SalesCharts"
import MenuPerformance from "@/components/reports/MenuPerformance"
import ExpenseManager from "@/components/reports/ExpenseManager"
import SalaryOverview from "@/components/staff/SalaryOverview"

export default function ReportsPage() {
  const { dateRange, setDateRange, isLoading } = useReportStore()
  const { settings } = useSettingsStore()
  
  const [activeTab, setActiveTab] = useState("sales")

  const loadInitialData = useCallback(() => {
    setDateRange(
      format(startOfDay(new Date()), "yyyy-MM-dd HH:mm:ss"),
      format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss")
    )
  }, [setDateRange])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const applyRange = (from: Date, to: Date) => {
    setDateRange(
      format(startOfDay(from), "yyyy-MM-dd HH:mm:ss"),
      format(endOfDay(to), "yyyy-MM-dd HH:mm:ss")
    )
  }

  const presets = [
    { label: "Today", range: () => ({ from: new Date(), to: new Date() }) },
    { label: "Yesterday", range: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
    { label: "Last 7 Days", range: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: "This Month", range: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-normal tracking-tight text-text-primary uppercase leading-none">Analytics & Reports</h2>
          <p className="text-text-muted font-medium italic text-xs">Business intelligence insights for {settings.restaurant_name}.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-bg-surface border border-border rounded-lg p-1">
             {presets.map((p) => (
               <Button 
                 key={p.label} 
                 variant="ghost" 
                 size="sm" 
                 className="h-8 text-[10px] uppercase font-medium px-3 hover:text-primary"
                 onClick={() => applyRange(p.range().from, p.range().to)}
               >
                 {p.label}
               </Button>
             ))}
          </div>

          <Popover>
            <PopoverTrigger className="h-10 border border-border bg-transparent rounded-md gap-2 uppercase font-normal text-[10px] tracking-widest px-4 flex items-center hover:bg-bg-hover transition-colors">
              <CalendarIcon size={14} className="text-primary" />
              {format(new Date(dateRange.start), "MMM d")} - {format(new Date(dateRange.end), "MMM d, yyyy")}
              <ChevronDown size={14} className="text-text-subtle ml-1" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-bg-elevated border-border" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={new Date(dateRange.start)}
                selected={{
                  from: new Date(dateRange.start),
                  to: new Date(dateRange.end)
                }}
                onSelect={(range: DateRange | undefined) => {
                  if (range?.from && range?.to) {
                    applyRange(range.from, range.to)
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" className="h-10 w-10 border-border" onClick={() => window.print()}>
            <Printer size={16} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-bg-surface border border-border p-1">
          <TabsTrigger value="sales" className="gap-2 uppercase font-medium text-[10px] px-8">
            <TrendingUp size={14} /> Sales Overview
          </TabsTrigger>
          <TabsTrigger value="menu" className="gap-2 uppercase font-medium text-[10px] px-8">
            <UtensilsCrossed size={14} /> Menu Performance
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2 uppercase font-medium text-[10px] px-8">
            <Wallet size={14} /> Expense Tracker
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-2 uppercase font-medium text-[10px] px-8">
            <Users size={14} /> Staff Reports
          </TabsTrigger>
        </TabsList>

        <div className={cn("transition-opacity duration-300", isLoading ? "opacity-50" : "opacity-100")}>
          <TabsContent value="sales" className="mt-0">
            <SalesCharts />
          </TabsContent>
          
          <TabsContent value="menu" className="mt-0">
            <MenuPerformance />
          </TabsContent>
          
          <TabsContent value="expenses" className="mt-0">
            <ExpenseManager />
          </TabsContent>

          <TabsContent value="staff" className="mt-0">
            <SalaryOverview />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
