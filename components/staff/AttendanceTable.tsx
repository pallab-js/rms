"use client"

import React, { useEffect, useCallback } from "react"
import { useStaffStore } from "@/stores/useStaffStore"
import { AttendanceStatus } from "@/types"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import TableSkeleton from "@/components/shared/TableSkeleton"

export default function AttendanceTable() {
  const { staff, attendance, selectedDate, isLoading, fetchStaff, fetchAttendance, markAttendance } = useStaffStore()

  const loadData = useCallback(() => {
    fetchStaff(true)
    fetchAttendance(selectedDate)
  }, [fetchStaff, fetchAttendance, selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const statusColors: Record<AttendanceStatus, string> = {
    present: "text-success bg-success/10 border-success/20",
    absent: "text-danger bg-danger/10 border-danger/20",
    "half-day": "text-warning bg-warning/10 border-warning/20",
    leave: "text-info bg-info/10 border-info/20",
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-bg-elevated/30">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-[10px] uppercase font-black tracking-widest h-10">Staff Member</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest h-10">Check-In</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest h-10">Check-Out</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest h-10">Status</TableHead>
            <TableHead className="text-[10px] uppercase font-black tracking-widest h-10">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
             <TableRow>
               <TableCell colSpan={5} className="p-0">
                  <TableSkeleton columns={5} rows={8} />
               </TableCell>
             </TableRow>
          ) : staff.map((member) => {
            const record = attendance.find(a => a.staff_id === member.id)
            
            return (
              <TableRow key={member.id} className="border-border hover:bg-bg-hover/30 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-primary">{member.name}</span>
                    <span className="text-[10px] text-text-muted uppercase font-bold">{member.role}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Input 
                    type="time" 
                    className="h-8 w-24 bg-bg-base border-border text-[10px] font-mono"
                    defaultValue={record?.check_in || "09:00"}
                    onBlur={(e) => markAttendance({
                      staff_id: member.id,
                      date: selectedDate,
                      status: record?.status || 'present',
                      check_in: e.target.value,
                      check_out: record?.check_out
                    })}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="time" 
                    className="h-8 w-24 bg-bg-base border-border text-[10px] font-mono"
                    defaultValue={record?.check_out || "18:00"}
                    onBlur={(e) => markAttendance({
                      staff_id: member.id,
                      date: selectedDate,
                      status: record?.status || 'present',
                      check_in: record?.check_in,
                      check_out: e.target.value
                    })}
                  />
                </TableCell>
                <TableCell>
                   <Select 
                     value={record?.status || "none"} 
                     onValueChange={(val) => markAttendance({
                       staff_id: member.id,
                       date: selectedDate,
                       status: val as AttendanceStatus,
                       check_in: record?.check_in || "09:00",
                       check_out: record?.check_out || "18:00"
                     })}
                   >
                     <SelectTrigger className={cn(
                       "h-8 w-32 text-[10px] font-black uppercase border-border",
                       record ? statusColors[record.status] : "bg-bg-base text-text-muted"
                     )}>
                       <SelectValue placeholder="Select Status" />
                     </SelectTrigger>
                     <SelectContent className="bg-bg-elevated border-border">
                       <SelectItem value="present">Present</SelectItem>
                       <SelectItem value="absent">Absent</SelectItem>
                       <SelectItem value="half-day">Half Day</SelectItem>
                       <SelectItem value="leave">On Leave</SelectItem>
                     </SelectContent>
                   </Select>
                </TableCell>
                <TableCell>
                  <Input 
                    placeholder="Notes..." 
                    className="h-8 bg-bg-base border-border text-[10px]"
                    defaultValue={record?.notes || ""}
                    onBlur={(e) => markAttendance({
                      staff_id: member.id,
                      date: selectedDate,
                      status: record?.status || 'present',
                      check_in: record?.check_in,
                      check_out: record?.check_out,
                      notes: e.target.value
                    })}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
