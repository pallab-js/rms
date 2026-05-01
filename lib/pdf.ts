import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Order, SettingsData } from "@/types"
import { format } from "date-fns"

export async function generateOrderPDF(order: Order, settings: SettingsData) {
  const doc = new jsPDF({
    unit: "mm",
    format: [80, 200], // 80mm thermal paper width
  })

  const centerX = 40
  let currentY = 10

  // Header
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(settings.restaurant_name.toUpperCase(), centerX, currentY, { align: "center" })
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  currentY += 5
  const addressLines = doc.splitTextToSize(settings.address, 70)
  doc.text(addressLines, centerX, currentY, { align: "center" })
  
  currentY += (addressLines.length * 4)
  doc.text(`Tel: ${settings.phone}`, centerX, currentY, { align: "center" })

  currentY += 5
  doc.setLineDashPattern([1, 1], 0)
  doc.line(5, currentY, 75, currentY)

  // Order Info
  currentY += 5
  doc.setFontSize(8)
  doc.text(`Receipt #: ${order.order_number}`, 5, currentY)
  currentY += 4
  doc.text(`Table: ${order.table_number || order.order_type.replace('_', ' ')}`, 5, currentY)
  currentY += 4
  doc.text(`Date: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 5, currentY)

  currentY += 3
  doc.line(5, currentY, 75, currentY)

  // Items Table
  currentY += 2
  autoTable(doc, {
    startY: currentY,
    margin: { left: 5, right: 5 },
    head: [['Item', 'Qty', 'Amt']],
    body: order.items.map(item => [
      (item.menu_item_name || 'Unknown Item').toUpperCase(),
      item.quantity.toString(),
      (item.unit_price * item.quantity).toFixed(2)
    ]),
    theme: 'plain',
    styles: { fontSize: 7, cellPadding: 1 },
    headStyles: { fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 15, halign: 'right' }
    },
    didDrawPage: (data) => {
      currentY = data.cursor?.y || currentY
    }
  })

  currentY += 2
  doc.line(5, currentY, 75, currentY)

  // Totals
  currentY += 5
  doc.setFontSize(8)
  doc.text("Subtotal:", 45, currentY)
  doc.text(`${settings.currency_symbol} ${order.subtotal.toFixed(2)}`, 75, currentY, { align: "right" })

  if (order.discount_val > 0) {
    currentY += 4
    const discLabel = order.discount_type === 'percent' ? `Discount (${order.discount_val}%):` : 'Discount (Flat):'
    doc.text(discLabel, 45, currentY)
    const discAmt = (order.subtotal - (order.total / (1 + settings.tax_rate/100))).toFixed(2)
    doc.text(`-${settings.currency_symbol} ${discAmt}`, 75, currentY, { align: "right" })
  }

  currentY += 4
  doc.text(`${settings.tax_label} (${settings.tax_rate}%):`, 45, currentY)
  doc.text(`${settings.currency_symbol} ${order.tax_amount.toFixed(2)}`, 75, currentY, { align: "right" })

  currentY += 5
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("TOTAL:", 45, currentY)
  doc.text(`${settings.currency_symbol} ${order.total.toFixed(2)}`, 75, currentY, { align: "right" })

  // Footer
  currentY += 10
  doc.setFont("helvetica", "italic")
  doc.setFontSize(8)
  const footerLines = doc.splitTextToSize(settings.receipt_footer, 70)
  doc.text(footerLines, centerX, currentY, { align: "center" })

  currentY += (footerLines.length * 4) + 2
  doc.setFontSize(6)
  doc.text("Powered by RestaurantOS", centerX, currentY, { align: "center" })

  // Save/Download
  doc.save(`Receipt_${order.order_number}.pdf`)
}
