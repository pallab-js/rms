"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import OrderBoard from "@/components/orders/OrderBoard"
import OrderBuilder from "@/components/orders/OrderBuilder"
import KOTReceipt from "@/components/orders/KOTReceipt"
import { useOrderStore } from "@/stores/useOrderStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { FeatureErrorBoundary } from "@/components/layout/FeatureErrorBoundary"

function OrdersContent() {
  const { orders } = useOrderStore()
  const { settings } = useSettingsStore()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get("id")
  
  // Use the last placed order for KOT printing if needed
  const lastOrder = orders[0] || null

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel: Active Orders */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <OrderBoard highlightId={highlightId ? parseInt(highlightId) : undefined} />
      </div>

      {/* Right Panel: New Order Cart */}
      <div className="w-[400px] shrink-0 border-l border-border">
        <OrderBuilder />
      </div>

      {/* Hidden KOT Template for Printing */}
      <KOTReceipt order={lastOrder} restaurantName={settings.restaurant_name} />
    </div>
  )
}

export default function OrdersPage() {
  return (
    <FeatureErrorBoundary name="Orders">
      <Suspense fallback={<div className="p-8">Loading orders...</div>}>
        <OrdersContent />
      </Suspense>
    </FeatureErrorBoundary>
  )
}
