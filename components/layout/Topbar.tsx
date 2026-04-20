"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Bell, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

import GlobalSearch from "./GlobalSearch"

export default function Topbar() {
  const pathname = usePathname()
  
  // Format pathname to title (e.g., /dashboard -> Dashboard)
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) return "Dashboard"
    return segments[0].charAt(0).toUpperCase() + segments[0].slice(1)
  }

  return (
    <header className="flex items-center justify-between px-6 border-b border-border h-16 bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-black text-text-primary uppercase tracking-tight">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-6 flex-1 max-w-2xl mx-12">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary hover:bg-bg-hover">
          <Printer size={18} />
        </Button>
        <div className="relative">
          <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary hover:bg-bg-hover">
            <Bell size={18} />
          </Button>
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border border-bg-surface" />
        </div>
        <div className="w-[1px] h-6 bg-border mx-2" />
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium text-text-primary leading-none">Admin</span>
          <span className="text-[10px] text-success leading-tight">Shift Active</span>
        </div>
      </div>
    </header>
  )
}
