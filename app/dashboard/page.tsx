"use client"

import React, { useEffect } from "react"
import { useDashboardStore } from "@/stores/useDashboardStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { REFRESH_INTERVALS } from "@/lib/constants"
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  History,
  CalendarDays,
  LayoutGrid,
  Zap,
  ArrowRight
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import DashboardKpi from "@/components/dashboard/DashboardKpi"
import RecentOrders from "@/components/dashboard/RecentOrders"
import TableMiniMap from "@/components/dashboard/TableMiniMap"
import OrderStatusFunnel from "@/components/dashboard/OrderStatusFunnel"
import QuickActions from "@/components/dashboard/QuickActions"

export default function DashboardPage() {
  const { stats, fetchDashboardStats } = useDashboardStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    fetchDashboardStats()
    const interval = setInterval(() => fetchDashboardStats(), REFRESH_INTERVALS.DASHBOARD)
    return () => clearInterval(interval)
  }, [fetchDashboardStats])

  const revTrend = stats.yesterday_revenue > 0 
    ? `${(((stats.today_revenue - stats.yesterday_revenue) / stats.yesterday_revenue) * 100).toFixed(1)}%` 
    : undefined

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-normal tracking-tight text-text-primary uppercase leading-none">Mission Control</h2>
          <p className="text-text-muted font-medium italic text-xs">Real-time overview of {settings.restaurant_name} operations.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="h-8 gap-2 border-primary/20 text-primary bg-primary/5 px-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live Status
           </Badge>
           <Button variant="outline" size="sm" className="h-8 border-border" onClick={() => fetchDashboardStats()}>Refresh</Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKpi 
          title="Today's Revenue" 
          value={stats.today_revenue} 
          prefix={settings.currency_symbol} 
          trend={revTrend}
          icon={DollarSign}
          color="text-primary"
        />
        <DashboardKpi 
          title="Active Orders" 
          value={stats.active_orders} 
          icon={Zap}
          color="text-warning"
        />
        <DashboardKpi 
          title="Tables Occupied" 
          value={stats.tables_occupied} 
          suffix={` / ${stats.total_tables}`}
          icon={LayoutGrid}
          color="text-info"
        />
        <DashboardKpi 
          title="Avg Order Value" 
          value={stats.avg_order_value} 
          prefix={settings.currency_symbol}
          icon={TrendingUp}
          color="text-success"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN - Wide */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hourly Sales Chart */}
          <Card className="bg-bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <p className="text-[11px] font-normal uppercase text-text-muted tracking-[0.08em]">Hourly Revenue</p>
                <CardDescription className="text-[10px]">Today&apos;s sales volume trend</CardDescription>
              </div>
              <History size={16} className="text-text-subtle" />
            </CardHeader>
            <CardContent className="h-[250px] p-0 pb-4">
              {stats.hourly_sales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.hourly_sales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#242424" vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#4d4d4d" 
                      fontSize={10} 
                      tickFormatter={(val) => `${val}:00`}
                    />
                    <YAxis stroke="#4d4d4d" fontSize={10} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(41,41,41,0.96)', border: '1px solid #2e2e2e', borderRadius: '8px', backdropFilter: 'blur(12px)' }}
                      itemStyle={{ color: '#3ecf8e' }}
                    />
                    <Bar dataKey="revenue" fill="#3ecf8e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-text-muted text-sm">
                  No sales data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders Feed */}
          <Card className="bg-bg-surface border-border">
             <CardContent className="p-6">
                <RecentOrders orders={stats.recent_orders} />
             </CardContent>
          </Card>
        </div>

        {/* MIDDLE COLUMN - Medium */}
        <div className="lg:col-span-3 space-y-6">
          {/* Table Mini Map */}
          <Card className="bg-bg-surface border-border">
            <CardHeader>
              <p className="text-[11px] font-normal uppercase text-text-muted tracking-[0.08em]">Table Status</p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
               <TableMiniMap />
               <Link href="/tables">
                 <Button variant="ghost" className="w-full mt-4 h-8 text-[10px] uppercase font-medium text-primary hover:bg-primary/5 gap-2">
                    Floor Plan <ArrowRight size={14} />
                 </Button>
               </Link>
            </CardContent>
          </Card>

          {/* Order Status Funnel */}
          <Card className="bg-bg-surface border-border">
            <CardHeader>
              <p className="text-[11px] font-normal uppercase text-text-muted tracking-[0.08em]">Order Pipeline</p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
               <OrderStatusFunnel ordersByStatus={stats.active_orders_by_status} />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - Narrow */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card className="bg-bg-surface border-border">
            <CardHeader>
              <p className="text-[11px] font-normal uppercase text-text-muted tracking-[0.08em]">Quick Actions</p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
               <QuickActions />
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <div className="space-y-3">
             <h3 className="text-[10px] font-normal uppercase text-text-subtle tracking-widest px-1">Alerts</h3>
             
             {stats.low_stock_count > 0 && (
               <Link href="/inventory">
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl flex gap-3 group hover:border-danger transition-colors cursor-pointer">
                    <div className="p-2 bg-danger/20 rounded-lg text-danger">
                      <AlertTriangle size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-normal text-danger uppercase">Stock Alert</p>
                      <p className="text-xs font-medium text-text-primary leading-tight mt-0.5">{stats.low_stock_count} items critical</p>
                    </div>
                </div>
               </Link>
             )}

             {stats.upcoming_reservations.map((res) => (
               <div key={res.id} className="p-3 bg-info/10 border border-info/20 rounded-xl flex gap-3">
                  <div className="p-2 bg-info/20 rounded-lg text-info">
                    <CalendarDays size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-normal text-info uppercase">Reservation</p>
                    <p className="text-xs font-medium text-text-primary leading-tight mt-0.5">{res.reserved_time} - {res.guest_name}</p>
                  </div>
               </div>
             ))}

             {stats.low_stock_count === 0 && stats.upcoming_reservations.length === 0 && (
                <div className="p-8 text-center border border-dashed border-border rounded-xl opacity-30">
                   <p className="text-[10px] uppercase font-normal">All clear</p>
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  )
}
