"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useStaffStore } from "@/stores/useStaffStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { query } from "@/lib/db"
import { Staff } from "@/types"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Printer, Download } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"

interface PayrollMember extends Staff {
  presentDays: number
  calculatedPay: number
}

export default function SalaryOverview() {
  const { staff, selectedMonth } = useStaffStore()
  const { settings } = useSettingsStore()
  const [payrolls, setPayrolls] = useState<PayrollMember[]>([])

  const calculatePayroll = useCallback(async () => {
    const start = format(startOfMonth(new Date(selectedMonth)), "yyyy-MM-dd")
    const end = format(endOfMonth(new Date(selectedMonth)), "yyyy-MM-dd")
    const daysInMonth = eachDayOfInterval({ start: new Date(start), end: new Date(end) }).length

    const rows = await query<{ staff_id: number; days_present: number }>(`
      SELECT staff_id, COUNT(*) as days_present 
      FROM attendance 
      WHERE date >= ? AND date <= ? AND status = 'present'
      GROUP BY staff_id
    `, [start, end])

    return staff.map(member => {
      const attendance = rows.find(r => r.staff_id === member.id)
      const presentDays = attendance ? attendance.days_present : 0
      
      let calculatedPay = 0
      if (member.salary_type === 'monthly') {
        calculatedPay = (member.salary / daysInMonth) * presentDays
      } else if (member.salary_type === 'daily') {
        calculatedPay = member.salary * presentDays
      }

      return {
        ...member,
        presentDays,
        calculatedPay
      }
    })
  }, [selectedMonth, staff])

  useEffect(() => {
    let active = true
    calculatePayroll().then(data => {
      if (active) setPayrolls(data)
    })
    return () => { active = false }
  }, [calculatePayroll])

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-2 border-border h-8 text-[10px] uppercase font-medium">
          <Download size={14} /> Export CSV
        </Button>
        <Button variant="outline" size="sm" className="gap-2 border-border h-8 text-[10px] uppercase font-medium" onClick={() => window.print()}>
          <Printer size={14} /> Print Payroll
        </Button>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-bg-elevated/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] uppercase font-normal tracking-widest h-10">Staff Name</TableHead>
              <TableHead className="text-[10px] uppercase font-normal tracking-widest h-10">Role</TableHead>
              <TableHead className="text-[10px] uppercase font-normal tracking-widest h-10">Base Salary</TableHead>
              <TableHead className="text-[10px] uppercase font-normal tracking-widest h-10 text-center">Days Present</TableHead>
              <TableHead className="text-[10px] uppercase font-normal tracking-widest h-10 text-right">Calculated Pay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrolls.map((p) => (
              <TableRow key={p.id} className="border-border hover:bg-bg-hover/30 transition-colors">
                <TableCell className="font-normal text-text-primary">{p.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[8px] uppercase font-medium border-border bg-bg-base">{p.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-mono">{settings.currency_symbol} {p.salary.toLocaleString()}</span>
                    <span className="text-[8px] text-text-muted uppercase font-medium">Per {p.salary_type.replace('ly', '')}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono text-sm">{p.presentDays}</TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-normal text-primary font-mono">
                    {settings.currency_symbol} {p.calculatedPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
