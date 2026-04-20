"use client"

import React from "react"
import Link from "next/link"
import { 
  Plus, 
  Calendar, 
  Wallet,
  Users
} from "lucide-react"

export default function QuickActions() {
  const actions = [
    { label: "New Order", icon: Plus, href: "/orders", shortcut: "N" },
    { label: "Book Table", icon: Calendar, href: "/tables", shortcut: "B" },
    { label: "Record Expense", icon: Wallet, href: "/reports", shortcut: "E" },
    { label: "Mark Attendance", icon: Users, href: "/staff", shortcut: "A" },
  ]

  return (
    <div className="flex flex-col gap-1">
      {actions.map((action) => (
        <Link key={action.label} href={action.href} className="group">
          <div className="flex items-center gap-3 p-2 rounded-lg border border-transparent hover:border-primary/20 hover:bg-bg-hover transition-all cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-bg-elevated border border-border group-hover:border-primary/40 text-text-muted group-hover:text-primary transition-colors">
              <action.icon size={16} />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                {action.label}
              </span>
              <span className="text-[10px] font-mono text-text-subtle border border-border-subtlest px-1.5 py-0.5 rounded bg-bg-base tracking-wider">
                {action.shortcut}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
