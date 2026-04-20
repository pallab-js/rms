"use client"

import React, { useState } from "react"
import { useReportStore } from "@/stores/useReportStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Plus, 
  Trash2, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  BarChart3
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const expenseSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  date: z.string(),
  paid_by: z.string().optional(),
  notes: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

export default function ExpenseManager() {
  const { expenses, salesSummary, addExpense, deleteExpense } = useReportStore()
  const { settings } = useSettingsStore()
  const [isOpen, setIsOpen] = useState(false)

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)
  const netProfit = salesSummary.total_revenue - totalExpenses

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as Resolver<ExpenseFormValues>,
    defaultValues: {
      category: "Supplies",
      description: "",
      amount: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      paid_by: "Admin",
      notes: ""
    }
  })

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      await addExpense(data)
      toast.success("Expense added successfully")
      setIsOpen(false)
      form.reset()
    } catch {
      toast.error("Failed to save expense")
    }

  }

  return (
    <div className="space-y-6">
      {/* P&L Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PLCard 
          title="Total Revenue" 
          value={salesSummary.total_revenue} 
          icon={ArrowUpCircle} 
          color="text-success"
          settings={settings}
        />
        <PLCard 
          title="Total Expenses" 
          value={totalExpenses} 
          icon={ArrowDownCircle} 
          color="text-danger"
          settings={settings}
        />
        <Card className={cn(
          "bg-bg-surface border-border",
          netProfit >= 0 ? "ring-1 ring-success/20" : "ring-1 ring-danger/20"
        )}>
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black uppercase text-text-muted tracking-widest">Net Profit / Loss</CardTitle>
            <BarChart3 size={14} className={netProfit >= 0 ? "text-success" : "text-danger"} />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={cn("text-2xl font-black", netProfit >= 0 ? "text-success" : "text-danger")}>
              {settings.currency_symbol}{netProfit.toLocaleString()}
            </div>
            <p className="text-[10px] text-text-muted mt-1 font-bold">For selected period</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card className="bg-bg-surface border-border overflow-hidden">
        <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-text-muted">Expense Logs</CardTitle>
            <CardDescription className="text-[10px]">Track all operational expenditures.</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger>
              <Button size="sm" className="gap-2 h-8 uppercase font-black text-[10px] tracking-widest">
                <Plus size={14} /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-bg-surface border-border">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select onValueChange={(val) => form.setValue("category", val || "Supplies")} defaultValue="Supplies">
                      <SelectTrigger className="bg-bg-base border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-bg-elevated border-border">
                        <SelectItem value="Supplies">Supplies</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Salary">Salary</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Rent">Rent</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" {...form.register("date")} className="bg-bg-base border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input {...form.register("description")} placeholder="e.g. Electricity Bill Jan" className="bg-bg-base border-border" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount ({settings.currency_symbol})</Label>
                    <Input type="number" step="0.01" {...form.register("amount")} className="bg-bg-base border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Paid By</Label>
                    <Input {...form.register("paid_by")} className="bg-bg-base border-border" />
                  </div>
                </div>
                <Button type="submit" className="w-full">Save Expense</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-bg-elevated/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[10px] uppercase font-black h-10">Date</TableHead>
                <TableHead className="text-[10px] uppercase font-black h-10">Category</TableHead>
                <TableHead className="text-[10px] uppercase font-black h-10">Description</TableHead>
                <TableHead className="text-[10px] uppercase font-black h-10 text-right">Amount</TableHead>
                <TableHead className="text-[10px] uppercase font-black h-10 w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id} className="border-border hover:bg-bg-hover/30">
                  <TableCell className="text-[10px] font-mono">{expense.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[8px] uppercase font-black border-border bg-bg-base">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-text-primary uppercase tracking-tight">{expense.description}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-danger">
                    {settings.currency_symbol}{expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-text-subtle hover:text-danger" onClick={() => deleteExpense(expense.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-text-muted italic text-xs">No expenses recorded for this period.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

interface PLCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
  settings: { currency_symbol: string }
}

function PLCard({ title, value, icon: Icon, color, settings }: PLCardProps) {
  return (
    <Card className="bg-bg-surface border-border">
      <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] font-black uppercase text-text-muted tracking-widest">{title}</CardTitle>
        <Icon size={14} className={color} />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-black text-text-primary">{settings.currency_symbol}{value.toLocaleString()}</div>
        <p className="text-[10px] text-text-muted mt-1 font-bold">For selected period</p>
      </CardContent>
    </Card>
  )
}
