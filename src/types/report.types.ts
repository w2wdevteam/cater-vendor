export interface MenuBreakdownItem {
  menuItemId: string
  menuItemName: string
  quantity: number
}

export interface DailyReportRow {
  companyId: string
  companyName: string
  orderCount: number
  notDeliveredCount: number
  menuBreakdown: MenuBreakdownItem[]
}

export interface DailyByLocationRow {
  locationId: string
  locationName: string
  companyName: string
  orderCount: number
  notDeliveredCount: number
  menuBreakdown: MenuBreakdownItem[]
}

export interface DailyByMenuRow {
  menuItemId: string
  menuItemName: string
  orderCount: number
  notDeliveredCount: number
}

export interface MonthlyReportRow {
  menuItemId: string
  menuItemName: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface MonthlyReport {
  companyId: string
  companyName: string
  month: string
  rows: MonthlyReportRow[]
  totalOrders: number
  totalAmount: number
  notDeliveredOrders: number
  notDeliveredAmount: number
}

export interface RevenueReportRow {
  companyId: string
  companyName: string
  orderCount: number
  revenue: number
  menuBreakdown: MenuBreakdownItem[]
}

export interface InvoiceData {
  invoiceNumber: string
  companyId: string
  companyName: string
  companyAddress: string
  contactName: string
  contactEmail: string
  month: string
  lines: InvoiceLine[]
  subtotal: number
  serviceCharge: number
  tax: number
  grandTotal: number
}

export interface InvoiceLine {
  menuItemName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}
