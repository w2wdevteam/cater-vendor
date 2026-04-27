import { dashboardApi } from '@/api/endpoints/dashboard.api'

export interface DashboardStats {
  todayOrderCount: number
  todayRevenue: number
  pendingRequestCount: number
  cutoffTime: string
  isCutoffPassed: boolean
}

export interface CompanyOrderSummary {
  companyId: string
  companyName: string
  orderCount: number
  revenue: number
}

export interface CapacityItem {
  menuItemId: string
  menuItemName: string
  currentOrders: number
  dailyCap: number
  percentage: number
}

export interface DashboardData {
  stats: DashboardStats
  companyOrders: CompanyOrderSummary[]
  capacityAlerts: CapacityItem[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const res = await dashboardApi.get()
  return {
    stats: {
      todayOrderCount: res.todayOrderCount,
      todayRevenue: res.todayRevenue,
      pendingRequestCount: res.pendingRequestCount,
      cutoffTime: res.cutoffTime ?? '—',
      isCutoffPassed: res.cutoffStatus === 'closed',
    },
    companyOrders: res.ordersPerCompany.map((c) => ({
      companyId: c.companyId,
      companyName: c.companyName,
      orderCount: c.orderCount,
      revenue: 0,
    })),
    capacityAlerts: res.itemsNearCap.map((i) => ({
      menuItemId: i.menuItemId,
      menuItemName: i.menuItemName,
      currentOrders: i.ordered,
      dailyCap: i.cap,
      percentage: i.cap > 0 ? Math.round((i.ordered / i.cap) * 100) : 0,
    })),
  }
}
