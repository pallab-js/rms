"use client"

import React, { useEffect, useState, useCallback } from "react"
import { 
  Plus, 
  Search, 
  Users, 
  CalendarCheck, 
  Wallet,
  MoreVertical,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  CheckCircle2
} from "lucide-react"
import { format, addMonths, subMonths, addDays, subDays } from "date-fns"
import { useStaffStore } from "@/stores/useStaffStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Staff } from "@/types"

import StaffForm from "@/components/staff/StaffForm"
import AttendanceTable from "@/components/staff/AttendanceTable"
import SalaryOverview from "@/components/staff/SalaryOverview"

export default function StaffPage() {
  const { 
    staff, 
    fetchStaff, 
    selectedDate, 
    setSelectedDate, 
    selectedMonth, 
    setSelectedMonth,
    markAllPresent,
    deleteStaff
  } = useStaffStore()
  const { settings } = useSettingsStore()

  const [activeTab, setActiveTab] = useState("directory")
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Staff | null>(null)
  const [searchQuery, setSearchSearchQuery] = useState("")

  const loadData = useCallback(() => {
    fetchStaff()
  }, [fetchStaff])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePrevDate = () => setSelectedDate(format(subDays(new Date(selectedDate), 1), "yyyy-MM-dd"))
  const handleNextDate = () => setSelectedDate(format(addDays(new Date(selectedDate), 1), "yyyy-MM-dd"))
  
  const handlePrevMonth = () => setSelectedMonth(format(subMonths(new Date(selectedMonth + "-01"), 1), "yyyy-MM"))
  const handleNextMonth = () => setSelectedMonth(format(addMonths(new Date(selectedMonth + "-01"), 1), "yyyy-MM"))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-normal tracking-tight text-text-primary uppercase leading-none">Staff Management</h2>
          
          {activeTab === "attendance" && (
            <div className="flex items-center gap-1 bg-bg-surface border border-border rounded-lg p-1 animate-in fade-in duration-300">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevDate}><ChevronLeft size={16} /></Button>
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
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextDate}><ChevronRight size={16} /></Button>
            </div>
          )}

          {activeTab === "salary" && (
            <div className="flex items-center gap-1 bg-bg-surface border border-border rounded-lg p-1 animate-in fade-in duration-300">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}><ChevronLeft size={16} /></Button>
              <div className="px-3 text-xs font-black uppercase text-primary">
                {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}><ChevronRight size={16} /></Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === "attendance" && (
            <Button variant="outline" className="gap-2 border-border h-10 uppercase font-medium text-[10px] tracking-widest" onClick={() => markAllPresent(selectedDate)}>
              <CheckCircle2 size={16} /> Mark All Present
            </Button>
          )}
          <Button className="gap-2 h-10 uppercase font-medium text-[10px] tracking-widest" onClick={() => {
            setSelectedMember(null)
            setIsStaffModalOpen(true)
          }}>
            <Plus size={16} /> Add Staff
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-bg-surface border border-border p-1">
          <TabsTrigger value="directory" className="gap-2 uppercase font-medium text-[10px] px-6">
            <Users size={14} /> Directory
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2 uppercase font-medium text-[10px] px-6">
            <CalendarCheck size={14} /> Attendance
          </TabsTrigger>
          <TabsTrigger value="salary" className="gap-2 uppercase font-medium text-[10px] px-6">
            <Wallet size={14} /> Salary Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-0 space-y-6">
          <div className="flex items-center justify-between bg-bg-surface/50 p-4 rounded-xl border border-border">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" size={14} />
              <Input 
                placeholder="Search staff by name or role..." 
                className="pl-9 h-9 bg-bg-base border-border text-xs focus:ring-1 focus:ring-primary" 
                value={searchQuery}
                onChange={(e) => setSearchSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted font-normal uppercase">Total:</span>
                  <span className="text-sm font-normal text-text-primary">{staff.length}</span>
               </div>
               <Separator orientation="vertical" className="h-4 bg-border" />
               <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted font-normal uppercase">Active:</span>
                  <span className="text-sm font-normal text-success">{staff.filter(s => s.is_active).length}</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStaff.map((member) => (
              <Card key={member.id} className="bg-bg-surface border-border group hover:border-primary/30 transition-all overflow-hidden">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-bg-elevated text-primary font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <CardTitle className="text-sm font-normal text-text-primary leading-none">{member.name}</CardTitle>
                      <Badge variant="outline" className="w-fit text-[8px] uppercase font-medium px-1.5 h-4 mt-0.5 border-primary/20 text-primary bg-primary/5">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-bg-elevated border-border w-40">
                      <DropdownMenuItem className="gap-2 font-medium uppercase text-[10px]" onClick={() => {
                        setSelectedMember(member)
                        setIsStaffModalOpen(true)
                      }}>
                        <Edit size={14} /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 font-medium uppercase text-[10px] text-danger focus:text-danger" onClick={async () => {
                         if (confirm(`Remove ${member.name} from records?`)) {
                           await deleteStaff(member.id)
                           toast.success("Staff record deleted")
                         }
                      }}>
                        <Trash2 size={14} /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium">
                      <Phone size={12} className="text-text-subtle" /> {member.phone || "No phone"}
                    </div>
                    {member.email && (
                      <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium truncate">
                        <Mail size={12} className="text-text-subtle" /> {member.email}
                      </div>
                    )}
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-text-subtle uppercase font-normal tracking-widest">Base Pay</span>
                      <span className="text-xs font-mono font-normal text-text-primary">
                        {settings.currency_symbol} {member.salary.toLocaleString()}
                        <span className="text-[8px] text-text-muted ml-1 lowercase font-medium">/{member.salary_type.replace('ly', '')}</span>
                      </span>
                    </div>
                    <Badge variant={member.is_active ? "default" : "secondary"} className={cn(
                      "text-[8px] uppercase font-medium px-1.5 h-4",
                      member.is_active ? "bg-success/10 text-success border-success/20" : "bg-bg-elevated text-text-muted border-border"
                    )}>
                      {member.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-0">
          <AttendanceTable />
        </TabsContent>

        <TabsContent value="salary" className="mt-0">
          <SalaryOverview />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="bg-bg-surface border-border">
          <DialogHeader>
            <DialogTitle>{selectedMember ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
            <DialogDescription>Enter the personal and payroll details for your team member.</DialogDescription>
          </DialogHeader>
          <StaffForm initialData={selectedMember} onSuccess={() => setIsStaffModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
