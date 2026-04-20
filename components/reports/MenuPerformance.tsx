"use client"

import React from "react"
import { useReportStore } from "@/stores/useReportStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer
} from "recharts"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import TableSkeleton from "@/components/shared/TableSkeleton"

export default function MenuPerformance() {
  const { menuPerformance, isLoading } = useReportStore()
  const { settings } = useSettingsStore()

  const top5 = menuPerformance.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Best Sellers Chart */}
        <Card className="lg:col-span-1 bg-bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-text-muted">Top 5 Best Sellers</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top5} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="item_name" 
                  type="category" 
                  stroke="#555b75" 
                  fontSize={10} 
                  width={100}
                />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2e3347', borderRadius: '8px' }}
                />
                <Bar dataKey="quantity_sold" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Full Performance Table */}
        <Card className="lg:col-span-2 bg-bg-surface border-border overflow-hidden">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-text-muted">Full Performance List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
               <TableHeader className="bg-bg-elevated/30">
                 <TableRow className="border-border hover:bg-transparent">
                   <TableHead className="text-[10px] uppercase font-black h-10">Item Name</TableHead>
                   <TableHead className="text-[10px] uppercase font-black h-10">Category</TableHead>
                   <TableHead className="text-[10px] uppercase font-black h-10 text-center">Qty Sold</TableHead>
                   <TableHead className="text-[10px] uppercase font-black h-10 text-right">Revenue</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="p-0">
                        <TableSkeleton columns={4} rows={10} />
                      </TableCell>
                    </TableRow>
                 ) : menuPerformance.map((item, idx) => (
                   <TableRow key={idx} className="border-border hover:bg-bg-hover/30">
                     <TableCell className="text-sm font-bold text-text-primary uppercase tracking-tight">{item.item_name}</TableCell>
                     <TableCell>
                       <Badge variant="outline" className="text-[8px] uppercase font-black border-border bg-bg-base">{item.category_name}</Badge>
                     </TableCell>
                     <TableCell className="text-center font-mono font-bold text-primary">{item.quantity_sold}</TableCell>
                     <TableCell className="text-right font-mono font-bold">
                       {settings.currency_symbol}{item.revenue.toLocaleString()}
                     </TableCell>
                   </TableRow>
                 ))}
                 {!isLoading && menuPerformance.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={4} className="h-32 text-center text-text-muted italic text-xs">No sales data for this period.</TableCell>
                   </TableRow>
                 )}
               </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
