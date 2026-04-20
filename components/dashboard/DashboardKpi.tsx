"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardKpiProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  trend?: string
  icon: React.ElementType
  color?: string
}

export default function DashboardKpi({ title, value, prefix = "", suffix = "", trend, icon: Icon, color }: DashboardKpiProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const totalDuration = 1000
    const increment = end / (totalDuration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(start)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  return (
    <Card className="bg-bg-surface border-border overflow-hidden relative">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] font-normal uppercase text-text-muted tracking-widest">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg bg-bg-elevated", color)}>
           <Icon size={14} />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-4xl font-normal text-text-primary tracking-tighter leading-none kpi-value">
          {prefix}{displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}{suffix}
        </div>
        {trend && (
          <p className="text-[10px] font-medium text-success mt-2 flex items-center gap-1">
            {trend} <span className="text-text-subtle font-normal text-[8px]">vs yesterday</span>
          </p>
        )}
      </CardContent>
      <div className={cn("absolute bottom-0 left-0 h-1 bg-primary/20", color?.replace('text-', 'bg-'))} style={{ width: '100%' }} />
    </Card>
  )
}
