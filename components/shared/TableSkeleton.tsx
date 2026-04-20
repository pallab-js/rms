"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

interface TableSkeletonProps {
  columns: number
  rows?: number
}

export default function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <Table>
      <TableHeader className="bg-bg-elevated/30">
        <TableRow className="border-border">
          {Array.from({ length: columns }).map((_, i) => (
            <TableHead key={i}><Skeleton className="h-4 w-24 bg-border" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i} className="border-border">
            {Array.from({ length: columns }).map((_, j) => (
              <TableCell key={j}><Skeleton className="h-4 w-full bg-border/50" /></TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
