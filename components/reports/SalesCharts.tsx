"use client"

import React from "react"
import { useReportStore } from "@/stores/useReportStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ShoppingCart, DollarSign } from "lucide-react"

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6']

export default function SalesCharts() {
  const { salesSummary, hourlySales, orderTypeSplit } = useReportStore()
  const { settings } = useSettingsStore()

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIItem 
          title="Total Revenue" 
          value={`${settings.currency_symbol}${salesSummary.total_revenue.toLocaleString()}`} 
          icon={DollarSign}
          color="text-primary"
        />
        <KPIItem 
          title="Total Orders" 
          value={salesSummary.total_orders} 
          icon={ShoppingCart}
          color="text-success"
        />
        <KPIItem 
          title="Avg Order Value" 
          value={`${settings.currency_symbol}${Math.round(salesSummary.avg_order_value).toLocaleString()}`} 
          icon={TrendingUp}
          color="text-info"
        />
        <KPIItem 
          title="Total Tax" 
          value={`${settings.currency_symbol}${salesSummary.total_tax.toLocaleString()}`} 
          icon={DollarSign}
          color="text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Sales Chart */}
        <Card className="bg-bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm font-normal uppercase tracking-widest text-text-muted">Hourly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e3347" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#555b75" 
                  fontSize={10} 
                  tickFormatter={(val) => `${val}:00`}
                />
                <YAxis stroke="#555b75" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2e3347', borderRadius: '8px' }}
                  itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Type Distribution */}
        <Card className="bg-bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm font-normal uppercase tracking-widest text-text-muted">Revenue by Order Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderTypeSplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="revenue"
                  nameKey="type"
                >
                  {orderTypeSplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2e3347', borderRadius: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '500' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface KPIItemProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
}

function KPIItem({ title, value, icon: Icon, color }: KPIItemProps) {
  return (
    <Card className="bg-bg-surface border-border">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] font-normal uppercase text-text-muted tracking-widest">{title}</CardTitle>
        <Icon size={14} className={color} />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-normal text-text-primary kpi-value">{value}</div>
      </CardContent>
    </Card>
  )
}
