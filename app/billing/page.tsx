"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useBillingStore } from "@/stores/useBillingStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Order, PaymentMethod } from "@/types"
import { cn } from "@/lib/utils"
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  History, 
  Clock, 
  Printer, 
  CheckCircle2,
  ArrowRightCircle,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { format } from "date-fns"
import CustomerReceipt from "@/components/billing/CustomerReceipt"
import { generateOrderPDF } from "@/lib/pdf"

export default function BillingPage() {
  const { pendingBills, paymentHistory, isLoading, fetchPendingBills, fetchPaymentHistory, processPayment } = useBillingStore()
  const { settings } = useSettingsStore()
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeView, setActiveView] = useState("pending")
  
  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [amountReceived, setAmountReceived] = useState<string>("")
  const [referenceNo, setReferenceNo] = useState("")

  const loadData = useCallback(() => {
    fetchPendingBills()
    fetchPaymentHistory()
  }, [fetchPendingBills, fetchPaymentHistory])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order)
    setAmountReceived(order.total.toString())
    setReferenceNo("")
  }

  const changeDue = parseFloat(amountReceived) - (selectedOrder?.total || 0)

  const handleCompletePayment = async () => {
    if (!selectedOrder) return
    
    if (paymentMethod === 'cash' && parseFloat(amountReceived) < selectedOrder.total) {
      toast.error("Insufficient amount received")
      return
    }

    try {
      await processPayment(selectedOrder.id, {
        order_id: selectedOrder.id,
        amount_paid: selectedOrder.total,
        payment_method: paymentMethod,
        change_given: Math.max(0, changeDue),
        reference_no: referenceNo,
        notes: ""
      })
      toast.success(`Payment completed for ${selectedOrder.order_number}`)
      setSelectedOrder(null)
    } catch {
      toast.error("Failed to process payment")
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel - Queue & History */}
      <div className="w-[450px] shrink-0 border-r border-border flex flex-col bg-bg-base/30">
        <div className="p-6 border-b border-border">
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-bg-surface border border-border p-1 h-10">
              <TabsTrigger value="pending" className="uppercase font-black text-[10px] tracking-widest gap-2">
                <Clock size={14} /> Pending Queue
              </TabsTrigger>
              <TabsTrigger value="history" className="uppercase font-black text-[10px] tracking-widest gap-2">
                <History size={14} /> Daily History
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {activeView === "pending" ? (
              pendingBills.length > 0 ? pendingBills.map((order) => (
                <button
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all group",
                    selectedOrder?.id === order.id 
                      ? "bg-primary/10 border-primary ring-1 ring-primary/20 shadow-lg" 
                      : "bg-bg-surface border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-black text-text-primary group-hover:text-primary transition-colors">{order.order_number}</span>
                    <span className="text-sm font-black text-text-primary">
                      {settings.currency_symbol} {order.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit text-[8px] uppercase font-black px-1.5 h-4 border-primary/20 text-primary bg-primary/5">
                        {order.table_number ? `Table ${order.table_number}` : order.order_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-[10px] text-text-muted font-bold uppercase">{order.items.length} Items</span>
                    </div>
                    <ArrowRightCircle size={18} className={cn(
                      "transition-transform",
                      selectedOrder?.id === order.id ? "text-primary translate-x-1" : "text-text-subtle"
                    )} />
                  </div>
                </button>
              )) : (
                <div className="py-20 text-center space-y-4 opacity-50">
                  <CheckCircle2 size={32} className="mx-auto text-success" />
                  <p className="text-xs font-black uppercase tracking-widest">No pending bills</p>
                </div>
              )
            ) : (
              paymentHistory.length > 0 ? paymentHistory.map((payment) => (
                <div key={payment.id} className="p-4 bg-bg-surface border border-border rounded-xl flex justify-between items-center group">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-text-primary">{payment.order_number}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="text-[8px] uppercase font-black px-1.5 h-4 bg-success/10 text-success border-success/20">
                        {payment.payment_method}
                      </Badge>
                      <span className="text-[10px] text-text-subtle font-bold uppercase">{format(new Date(payment.paid_at), "HH:mm")}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-text-primary">{settings.currency_symbol} {payment.amount_paid.toFixed(2)}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => window.print()}>
                      <Printer size={12} />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center space-y-4 opacity-50">
                  <History size={32} className="mx-auto" />
                  <p className="text-xs font-black uppercase tracking-widest">No payments today</p>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Processor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedOrder ? (
          <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-8 border-b border-border bg-bg-surface flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">Process Bill</h3>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Order: {selectedOrder.order_number}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2 border-border h-10 uppercase font-black text-[10px] tracking-widest" 
                  onClick={() => generateOrderPDF(selectedOrder, settings)}
                >
                  <Download size={16} /> Download PDF
                </Button>
                <Button variant="outline" className="gap-2 border-border h-10 uppercase font-black text-[10px] tracking-widest" onClick={() => window.print()}>
                  <Printer size={16} /> Print Draft Bill
                </Button>
              </div>
            </div>

            <div className="flex-1 flex gap-8 p-8 overflow-hidden">
              {/* Bill Details */}
              <div className="w-1/2 flex flex-col">
                <Card className="flex-1 flex flex-col bg-bg-surface border-border overflow-hidden shadow-sm">
                  <CardHeader className="bg-bg-elevated/20 py-4 border-b border-border">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-text-subtle">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 px-6 py-4">
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start group">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors uppercase">
                                {item.menu_item_name}
                                <span className="text-text-subtle ml-2 font-mono text-xs">x{item.quantity}</span>
                              </span>
                              <span className="text-[10px] text-text-muted font-medium">{settings.currency_symbol} {item.unit_price.toFixed(2)} each</span>
                            </div>
                            <span className="text-sm font-mono text-text-primary">
                              {settings.currency_symbol} {(item.unit_price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-6 bg-bg-elevated/10 border-t border-border space-y-2">
                       <div className="flex justify-between text-xs font-bold text-text-muted uppercase">
                          <span>Subtotal</span>
                          <span className="font-mono">{settings.currency_symbol} {selectedOrder.subtotal.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between text-xs font-bold text-text-muted uppercase">
                          <span>Tax ({settings.tax_rate}%)</span>
                          <span className="font-mono">{settings.currency_symbol} {selectedOrder.tax_amount.toFixed(2)}</span>
                       </div>
                       <Separator className="my-2 bg-border" />
                       <div className="flex justify-between items-end">
                          <span className="text-lg font-black uppercase text-text-primary">Total Amount</span>
                          <span className="text-3xl font-black text-primary font-mono leading-none tracking-tighter">
                            {settings.currency_symbol}{selectedOrder.total.toFixed(2)}
                          </span>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Form */}
              <div className="w-1/2 space-y-6">
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase text-text-subtle tracking-widest">Payment Method</Label>
                   <div className="grid grid-cols-3 gap-3">
                      {(['cash', 'card', 'upi'] as PaymentMethod[]).map((method) => {
                        const Icon = method === 'cash' ? Banknote : method === 'card' ? CreditCard : Smartphone
                        return (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={cn(
                              "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                              paymentMethod === method 
                                ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                                : "bg-bg-surface border-border text-text-muted hover:border-primary/50"
                            )}
                          >
                            <Icon size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{method}</span>
                          </button>
                        )
                      })}
                   </div>
                </div>

                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {paymentMethod === 'cash' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-text-muted">Amount Received</Label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-text-subtle">{settings.currency_symbol}</span>
                           <Input 
                             type="number" 
                             className="h-16 pl-12 text-3xl font-black font-mono bg-bg-base border-border focus:ring-1 focus:ring-primary" 
                             value={amountReceived}
                             onChange={(e) => setAmountReceived(e.target.value)}
                           />
                        </div>
                      </div>
                      <div className="p-4 bg-bg-surface border border-border rounded-xl flex justify-between items-center shadow-sm">
                        <span className="text-sm font-black uppercase text-text-muted tracking-tight">Change Due</span>
                        <span className={cn(
                          "text-2xl font-black font-mono tracking-tighter",
                          changeDue < 0 ? "text-danger" : "text-success"
                        )}>
                          {settings.currency_symbol} {Math.max(0, changeDue).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-text-muted">Transaction / Reference ID</Label>
                      <Input 
                        placeholder="Last 4 digits or Ref#" 
                        className="h-12 bg-bg-base border-border text-lg font-bold"
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full h-16 text-lg font-black uppercase tracking-widest gap-3 shadow-xl"
                  onClick={handleCompletePayment}
                  disabled={isLoading || (paymentMethod === 'cash' && changeDue < 0)}
                >
                  <CheckCircle2 size={24} /> Complete Settlement
                </Button>
              </div>
            </div>
            
            {/* Hidden Receipt Template */}
            <CustomerReceipt order={selectedOrder} settings={settings} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 space-y-4">
             <div className="w-24 h-24 rounded-full bg-bg-elevated flex items-center justify-center border-2 border-dashed border-border">
                <CreditCard size={48} />
             </div>
             <p className="text-sm font-black uppercase tracking-widest">Select an order to process payment</p>
          </div>
        )}
      </div>
    </div>
  )
}
