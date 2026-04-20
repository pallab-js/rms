"use client"

import React from "react"
import { Order } from "@/types"
import { format } from "date-fns"

interface KOTReceiptProps {
  order: Order | null
  restaurantName: string
}

export default function KOTReceipt({ order, restaurantName }: KOTReceiptProps) {
  if (!order) return null

  return (
    <div id="kot-receipt" className="hidden print:block p-4 w-[58mm] font-mono text-[10px] leading-tight">
      <div className="text-center border-b border-black pb-2 mb-2">
        <h1 className="text-sm font-bold uppercase">Kitchen Order Ticket</h1>
        <p>{restaurantName}</p>
      </div>

      <div className="flex justify-between mb-1">
        <span className="font-bold">Order #:</span>
        <span>{order.order_number}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="font-bold">Table/Type:</span>
        <span className="uppercase">{order.table_number ? `Table ${order.table_number}` : order.order_type}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="font-bold">Date/Time:</span>
        <span>{format(new Date(), "HH:mm:ss")}</span>
      </div>

      <div className="border-b border-black border-dashed mb-2" />

      <div className="space-y-2 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start gap-2">
            <span className="font-bold text-xs">{item.quantity} x</span>
            <div className="flex-1">
              <p className="font-bold uppercase text-xs">{item.menu_item_name || "Item"}</p>
              {item.item_notes && <p className="italic ml-2">Note: {item.item_notes}</p>}
            </div>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="border border-black p-1 mb-4">
          <p className="font-bold uppercase mb-0.5">Order Note:</p>
          <p>{order.notes}</p>
        </div>
      )}

      <div className="border-b border-black border-dashed mb-2" />
      <div className="text-center italic mt-4">
        *** END OF KOT ***
      </div>
    </div>
  )
}
