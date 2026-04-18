import type {
  DailyReportRow,
  DailyByLocationRow,
  DailyByMenuRow,
  MonthlyReport,
  RevenueReportRow,
  InvoiceData,
} from '@/types/report.types'

const companyNames: Record<string, string> = {
  '1': 'Acme Corporation',
  '2': 'GlobalTech Inc.',
  '3': 'Summit Partners',
  '4': 'Vertex Solutions',
  '5': 'BlueWave Digital',
}

const companyLocations: Record<string, string> = {
  '1': '123 Main St, Floor 5, Lobby A',
  '2': '456 Tech Blvd, Building B',
  '3': '789 Summit Ave, Suite 300',
  '4': '321 Innovation Dr, Floor 2',
  '5': '555 Ocean Blvd, Floor 8',
}

const companyContacts: Record<string, { name: string; email: string }> = {
  '1': { name: 'Sarah Johnson', email: 'sarah@acme.com' },
  '2': { name: 'David Park', email: 'david@globaltech.com' },
  '3': { name: 'Rachel Green', email: 'rachel@summit.com' },
  '4': { name: 'James Wilson', email: 'james@vertex.com' },
  '5': { name: 'Emma Davis', email: 'emma@bluewave.com' },
}

const menuItems: Record<string, { name: string; price: number }> = {
  '1': { name: 'Chicken Rice', price: 25000 },
  '2': { name: 'Beef Noodles', price: 30000 },
  '3': { name: 'Veggie Wrap', price: 22000 },
  '4': { name: 'Grilled Salmon Bowl', price: 35000 },
  '5': { name: 'Caesar Salad', price: 20000 },
}

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function dateSeed(date: string) {
  let h = 0
  for (let i = 0; i < date.length; i++) {
    h = (h * 31 + date.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

export async function getDailyReport(date: string): Promise<DailyReportRow[]> {
  await delay()
  const rand = seededRandom(dateSeed(date))
  const activeCompanyIds = ['1', '2', '3', '4']
  return activeCompanyIds.map((id) => {
    const orders = Math.floor(rand() * 20) + 3
    const nd = rand() > 0.7 ? Math.floor(rand() * 3) + 1 : 0
    return {
      companyId: id,
      companyName: companyNames[id],
      orderCount: orders,
      notDeliveredCount: nd,
    }
  })
}

const locationNames: Record<string, string> = {
  'loc-1': 'Main Lobby - Building A',
  'loc-2': 'Executive Floor',
  'loc-3': 'Tech Hub Reception',
  'loc-4': 'R&D Lab Entrance',
  'loc-5': 'Summit Main Office',
  'loc-6': 'Innovation Center',
}

const locationCompanies: Record<string, string> = {
  'loc-1': 'Acme Corporation',
  'loc-2': 'Acme Corporation',
  'loc-3': 'GlobalTech Inc.',
  'loc-4': 'GlobalTech Inc.',
  'loc-5': 'Summit Partners',
  'loc-6': 'Vertex Solutions',
}

export async function getDailyByLocationReport(date: string): Promise<DailyByLocationRow[]> {
  await delay()
  const rand = seededRandom(dateSeed(date + 'loc'))
  return Object.entries(locationNames).map(([id, name]) => {
    const orders = Math.floor(rand() * 15) + 2
    const nd = rand() > 0.75 ? Math.floor(rand() * 2) + 1 : 0
    return {
      locationId: id,
      locationName: name,
      companyName: locationCompanies[id],
      orderCount: orders,
      notDeliveredCount: nd,
    }
  })
}

export async function getDailyByMenuReport(date: string): Promise<DailyByMenuRow[]> {
  await delay()
  const rand = seededRandom(dateSeed(date + 'menu'))
  return Object.entries(menuItems).map(([id, item]) => {
    const orders = Math.floor(rand() * 25) + 3
    const nd = rand() > 0.8 ? Math.floor(rand() * 2) + 1 : 0
    return {
      menuItemId: id,
      menuItemName: item.name,
      orderCount: orders,
      notDeliveredCount: nd,
    }
  })
}

export async function getMonthlyReport(
  companyId: string,
  month: string,
): Promise<MonthlyReport> {
  await delay()
  const seed = dateSeed(companyId + month)
  const rand = seededRandom(seed)

  const rows = Object.entries(menuItems).map(([id, item]) => {
    const qty = Math.floor(rand() * 30) + 2
    return {
      menuItemId: id,
      menuItemName: item.name,
      unitPrice: item.price,
      quantity: qty,
      lineTotal: item.price * qty,
    }
  })

  const totalOrders = rows.reduce((s, r) => s + r.quantity, 0)
  const totalAmount = rows.reduce((s, r) => s + r.lineTotal, 0)
  const ndOrders = Math.floor(rand() * 5)
  const ndAmount = ndOrders * 25000

  return {
    companyId,
    companyName: companyNames[companyId] ?? 'Unknown',
    month,
    rows,
    totalOrders,
    totalAmount,
    notDeliveredOrders: ndOrders,
    notDeliveredAmount: ndAmount,
  }
}

export async function getRevenueReport(date: string): Promise<RevenueReportRow[]> {
  await delay()
  const rand = seededRandom(dateSeed(date))
  const activeCompanyIds = ['1', '2', '3', '4']
  return activeCompanyIds.map((id) => {
    const orders = Math.floor(rand() * 20) + 5
    const avgPrice = 20000 + rand() * 15000
    return {
      companyId: id,
      companyName: companyNames[id],
      orderCount: orders,
      revenue: Math.round(orders * avgPrice),
    }
  })
}

export async function getInvoiceData(
  companyId: string,
  month: string,
): Promise<InvoiceData> {
  await delay()
  const seed = dateSeed(companyId + month)
  const rand = seededRandom(seed)

  const lines = Object.values(menuItems).map((item) => {
    const qty = Math.floor(rand() * 25) + 1
    return {
      menuItemName: item.name,
      quantity: qty,
      unitPrice: item.price,
      lineTotal: item.price * qty,
    }
  })

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const serviceCharge = Math.round(subtotal * 0.05)
  const tax = Math.round(subtotal * 0.08)
  const grandTotal = subtotal + serviceCharge + tax

  const monthNum = month.split('-')[1]
  const yearShort = month.split('-')[0].slice(-2)
  const invoiceNumber = `INV-${companyId.padStart(3, '0')}-${yearShort}${monthNum}`

  const contact = companyContacts[companyId] ?? { name: 'N/A', email: 'N/A' }

  return {
    invoiceNumber,
    companyId,
    companyName: companyNames[companyId] ?? 'Unknown',
    companyAddress: companyLocations[companyId] ?? '',
    contactName: contact.name,
    contactEmail: contact.email,
    month,
    lines,
    subtotal,
    serviceCharge,
    tax,
    grandTotal,
  }
}

