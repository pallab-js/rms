"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { 
  Plus, 
  Search, 
  Map as MapIcon, 
  CalendarDays, 
  MoreVertical, 
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter
} from "lucide-react"
import { format, addDays, subDays } from "date-fns"
import { useTableStore } from "@/stores/useTableStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Reservation } from "@/types"

import TableMap from "@/components/tables/TableMap"
import TableForm from "@/components/tables/TableForm"
import ReservationForm from "@/components/tables/ReservationForm"
import ReservationTimeline from "@/components/tables/ReservationTimeline"

export default function TablesPage() {
  const { 
    tables, 
    reservations, 
    fetchTables, 
    fetchReservations, 
    selectedDate, 
    setSelectedDate,
    updateReservationStatus,
    deleteReservation
  } = useTableStore()

  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") === "reservations" ? "reservations" : "map"
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  const loadData = useCallback(() => {
    fetchTables()
    fetchReservations(selectedDate)
  }, [selectedDate, fetchTables, fetchReservations])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handlePrevDay = () => setSelectedDate(format(subDays(new Date(selectedDate), 1), "yyyy-MM-dd"))
  const handleNextDay = () => setSelectedDate(format(addDays(new Date(selectedDate), 1), "yyyy-MM-dd"))
  const handleToday = () => setSelectedDate(format(new Date(), "yyyy-MM-dd"))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-normal tracking-tight text-text-primary leading-none">Tables & Seating</h2>
          <div className="flex items-center gap-1 bg-bg-surface border border-border rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevDay}><ChevronLeft size={16} /></Button>
            <Popover>
              <PopoverTrigger className="h-8 text-xs font-medium px-2 gap-2 flex items-center hover:bg-bg-hover rounded-md transition-colors">
                <CalendarIcon size={14} className="text-primary" />
                {format(new Date(selectedDate), "EEE, MMM d")}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-bg-elevated border-border" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(selectedDate)}
                  onSelect={(date) => date && setSelectedDate(format(date, "yyyy-MM-dd"))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextDay}><ChevronRight size={16} /></Button>
            <Separator orientation="vertical" className="h-4 bg-border mx-1" />
            <Button variant="ghost" className="h-8 text-xs font-medium px-2" onClick={handleToday}>Today</Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-border h-9" onClick={() => setIsTableModalOpen(true)}>
            <Plus size={16} /> Add Table
          </Button>
          <Button className="gap-2 h-9" onClick={() => {
            setSelectedReservation(null)
            setIsReservationModalOpen(true)
          }}>
            <Plus size={16} /> New Reservation
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-bg-surface border border-border">
            <TabsTrigger value="map" className="gap-2">
              <MapIcon size={16} /> Table Map
            </TabsTrigger>
            <TabsTrigger value="reservations" className="gap-2">
              <CalendarDays size={16} /> Reservations
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 mr-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-[10px] text-text-muted uppercase font-medium">Available</span>
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-[10px] text-text-muted uppercase font-medium">Occupied</span>
                </div>
             </div>
             <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" size={14} />
                <Input placeholder="Search tables..." className="pl-9 h-9 w-48 bg-bg-surface border-border focus:border-primary focus:ring-1 focus:ring-primary" />
             </div>
          </div>
        </div>

        <TabsContent value="map" className="mt-0">
          <TableMap />
        </TabsContent>

        <TabsContent value="reservations" className="mt-0 space-y-6">
          <ReservationTimeline />
          
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-bg-surface border-border">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 py-4">
                <CardTitle className="text-lg">Daily Schedule</CardTitle>
                <Button variant="ghost" size="sm" className="gap-2 h-8 text-text-muted">
                  <Filter size={14} /> Filter
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-bg-elevated/30">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase font-medium h-10">Time</TableHead>
                      <TableHead className="text-[10px] uppercase font-medium h-10">Guest</TableHead>
                      <TableHead className="text-[10px] uppercase font-medium h-10">Pax</TableHead>
                      <TableHead className="text-[10px] uppercase font-medium h-10">Table</TableHead>
                      <TableHead className="text-[10px] uppercase font-medium h-10">Status</TableHead>
                      <TableHead className="text-[10px] uppercase font-medium h-10 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.length > 0 ? reservations.map((res) => (
                      <TableRow key={res.id} className="border-border hover:bg-bg-hover/50 group">
                        <TableCell className="font-mono text-xs">{res.reserved_time}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{res.guest_name}</span>
                            <span className="text-[10px] text-text-muted">{res.guest_phone || "No phone"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="bg-bg-base border-border">{res.party_size}</Badge>
                        </TableCell>
                        <TableCell>
                          {res.table_id ? (
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              T{tables.find(t => t.id === res.table_id)?.table_number || res.table_id}
                            </Badge>
                          ) : (
                            <span className="text-xs text-text-subtle">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
<Badge className={cn(
                              "capitalize",
                              res.status === "confirmed" && "bg-info/20 text-info border-info/30",
                              res.status === "seated" && "bg-success/20 text-success border-success/30",
                              res.status === "cancelled" && "bg-danger/20 text-danger border-danger/30",
                              res.status === "no-show" && "bg-warning/20 text-warning border-warning/30"
                            )}>
                              {res.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted"><MoreVertical size={16} /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-bg-elevated border-border">
                              <DropdownMenuItem className="gap-2" onClick={() => updateReservationStatus(res.id, "seated")}>Seat Guest</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => {
                                setSelectedReservation(res)
                                setIsReservationModalOpen(true)
                              }}>Edit</DropdownMenuItem>
                              <Separator className="my-1 bg-border" />
<DropdownMenuItem className="gap-2" onClick={async () => {
                                  if (confirm("Cancel this reservation?")) {
                                    await updateReservationStatus(res.id, "cancelled")
                                  }
                                }}>Cancel</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-warning" onClick={async () => {
                                await updateReservationStatus(res.id, "no-show")
                              }}>Mark No-Show</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-danger" onClick={async () => {
                                if (confirm("Delete this reservation? This cannot be undone.")) {
                                  await deleteReservation(res.id)
                                }
                              }}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-text-muted">
                          No reservations for this date.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent className="bg-bg-surface border-border">
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>Create a table to be placed on the floor plan.</DialogDescription>
          </DialogHeader>
          <TableForm onSuccess={() => setIsTableModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isReservationModalOpen} onOpenChange={setIsReservationModalOpen}>
        <DialogContent className="bg-bg-surface border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedReservation ? "Edit Reservation" : "New Reservation"}</DialogTitle>
            <DialogDescription>Book a table for a guest. Tables can be assigned now or later.</DialogDescription>
          </DialogHeader>
          <ReservationForm 
            initialData={selectedReservation} 
            onSuccess={() => setIsReservationModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
