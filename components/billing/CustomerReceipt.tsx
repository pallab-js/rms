"use client"

import React from "react"
import { Order, SettingsData } from "@/types"
import { format } from "date-fns"

interface CustomerReceiptProps {
  order: Order | null
  settings: SettingsData
}

export default function CustomerReceipt({ order, settings }: CustomerReceiptProps) {
  if (!order) return null

  return (
    <div id="customer-receipt" className="hidden print:block p-4 w-[58mm] font-mono text-[10px] leading-tight text-black bg-white">
      <div className="text-center mb-4">
        <h1 className="text-sm font-bold uppercase">{settings.restaurant_name}</h1>
        <p className="whitespace-pre-line">{settings.address}</p>
        <p>Tel: {settings.phone}</p>
      </div>

      <div className="border-b border-black border-dashed mb-2" />
      
      <div className="flex justify-between mb-1">
        <span>Receipt #:</span>
        <span>{order.order_number}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span>Table:</span>
        <span>{order.table_number || order.order_type.replace('_', ' ')}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>Date:</span>
        <span>{format(new Date(), "dd/MM/yyyy HH:mm")}</span>
      </div>

      <div className="border-b border-black border-dashed mb-2" />

      <table className="w-full mb-4">
        <thead>
          <tr className="text-left">
            <th className="font-bold">Item</th>
            <th className="text-center font-bold">Qty</th>
            <th className="text-right font-bold">Amt</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 uppercase">{item.menu_item_name}</td>
              <td className="text-center py-1">{item.quantity}</td>
              <td className="text-right py-1">{(item.unit_price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-b border-black border-dashed mb-2" />

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{settings.currency_symbol} {order.subtotal.toFixed(2)}</span>
        </div>
        {order.discount_val > 0 && (
          <div className="flex justify-between">
            <span>Discount ({order.discount_type === 'percent' ? order.discount_val + '%' : 'Flat'}):</span>
            <span>-{settings.currency_symbol} {(order.subtotal - (order.total / (1 + settings.tax_rate/100))).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>{settings.tax_label} ({settings.tax_rate}%):</span>
          <span>{settings.currency_symbol} {order.tax_amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-black pt-1 mt-1">
          <span>TOTAL:</span>
          <span>{settings.currency_symbol} {order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 text-center italic">
        <p>{settings.receipt_footer}</p>
        <p className="mt-2 text-[8px]">Powered by RestaurantOS</p>
      </div>
    </div>
  )
}
