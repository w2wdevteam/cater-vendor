import { reportsApi } from '@/api/endpoints/reports.api'
import { companiesApi } from '@/api/endpoints/companies.api'
import type {
  DailyByLocationRow,
  DailyByMenuRow,
  DailyReportRow,
  InvoiceData,
  MonthlyReport,
  RevenueReportRow,
} from '@/types/report.types'

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function getDailyReport(date: string): Promise<DailyReportRow[]> {
  const res = await reportsApi.dailyByCompany(date)
  return res.companies.map((c) => ({
    companyId: c.companyId,
    companyName: c.companyName,
    orderCount: c.orderCount,
    notDeliveredCount: c.notDeliveredCount,
    menuBreakdown: c.menuBreakdown.map((b) => ({
      menuItemId: slug(b.menuItemName),
      menuItemName: b.menuItemName,
      quantity: b.quantity,
    })),
  }))
}

export async function getDailyByLocationReport(date: string): Promise<DailyByLocationRow[]> {
  const res = await reportsApi.byLocation(date, date)
  return res.locations.map((l) => ({
    locationId: slug(l.locationName),
    locationName: l.locationName,
    companyName: l.address ?? '',
    orderCount: l.totalOrders,
    notDeliveredCount: 0,
    menuBreakdown: l.menuBreakdown.map((b) => ({
      menuItemId: slug(b.menuItemName),
      menuItemName: b.menuItemName,
      quantity: b.quantity,
    })),
  }))
}

export async function getDailyByMenuReport(date: string): Promise<DailyByMenuRow[]> {
  const res = await reportsApi.byMenu(date, date)
  return res.items.map((i) => ({
    menuItemId: i.menuItemId,
    menuItemName: i.menuItemName,
    orderCount: i.totalOrders,
    notDeliveredCount: 0,
  }))
}

export async function getMonthlyReport(
  companyId: string,
  month: string,
): Promise<MonthlyReport> {
  const res = await reportsApi.monthlyByCompany(companyId, month)
  return {
    companyId,
    companyName: res.companyName,
    month,
    rows: res.menuBreakdown.map((m) => ({
      menuItemId: slug(m.menuItemName),
      menuItemName: m.menuItemName,
      unitPrice: m.unitPrice,
      quantity: m.quantity,
      lineTotal: m.subtotal,
    })),
    days: res.days.map((d) => ({
      date: d.date,
      items: d.items.map((it) => ({
        menuItemId: it.menuItemId,
        menuItemName: it.menuItemName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
    })),
    totalOrders: res.totalOrders,
    totalAmount: res.totalPrice,
    notDeliveredOrders: res.notDelivered.count,
    notDeliveredAmount: res.notDelivered.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    ),
  }
}

export async function getRevenueReport(date: string): Promise<RevenueReportRow[]> {
  const res = await reportsApi.dailyRevenue(date)
  return res.companies.map((c, idx) => ({
    companyId: String(idx),
    companyName: c.companyName,
    orderCount: c.menuBreakdown.reduce((sum, b) => sum + b.quantity, 0),
    revenue: c.revenue,
    menuBreakdown: c.menuBreakdown.map((b) => ({
      menuItemId: slug(b.menuItemName),
      menuItemName: b.menuItemName,
      quantity: b.quantity,
    })),
  }))
}

/**
 * Invoice data isn't a single backend endpoint — we combine monthly-by-company
 * with the company detail (for address/contact). Service charge + tax are not
 * returned by the backend, so they default to 0; see API-QUESTIONS.md §10.
 */
export async function getInvoiceData(companyId: string, month: string): Promise<InvoiceData> {
  const [monthly, company] = await Promise.all([
    reportsApi.monthlyByCompany(companyId, month),
    companiesApi.get(companyId),
  ])

  const lines = monthly.menuBreakdown.map((m) => ({
    menuItemName: m.menuItemName,
    quantity: m.quantity,
    unitPrice: m.unitPrice,
    lineTotal: m.subtotal,
  }))

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0)
  const serviceCharge = 0
  const tax = 0
  const grandTotal = subtotal + serviceCharge + tax

  const [y, m] = month.split('-')
  const invoiceNumber = `INV-${company.id.slice(0, 6).toUpperCase()}-${y.slice(-2)}${m}`

  return {
    invoiceNumber,
    companyId,
    companyName: company.name,
    companyAddress: company.address ?? '',
    contactName: company.contactName ?? '',
    contactEmail: company.contactEmail ?? '',
    month,
    lines,
    subtotal,
    serviceCharge,
    tax,
    grandTotal,
  }
}
