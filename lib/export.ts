import * as XLSX from "xlsx"
import { format } from "date-fns"

export function exportToExcel(data: Record<string, unknown>[], fileName: string, sheetName: string = "Sheet1") {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  
  const timestamp = format(new Date(), "yyyyMMdd_HHmmss")
  XLSX.writeFile(workbook, `${fileName}_${timestamp}.xlsx`)
}

export function exportToCSV(data: Record<string, unknown>[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  
  const timestamp = format(new Date(), "yyyyMMdd_HHmmss")
  link.setAttribute("href", url)
  link.setAttribute("download", `${fileName}_${timestamp}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
