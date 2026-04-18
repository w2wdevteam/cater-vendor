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
  await new Promise((r) => setTimeout(r, 600))

  return {
    stats: {
      todayOrderCount: 147,
      todayRevenue: 3780000,
      pendingRequestCount: 3,
      cutoffTime: '10:00 AM',
      isCutoffPassed: false,
    },
    companyOrders: [
      { companyId: '1', companyName: 'Acme Corporation', orderCount: 52, revenue: 1350000 },
      { companyId: '2', companyName: 'GlobalTech Inc.', orderCount: 38, revenue: 980000 },
      { companyId: '3', companyName: 'Summit Partners', orderCount: 31, revenue: 790000 },
      { companyId: '4', companyName: 'Vertex Solutions', orderCount: 18, revenue: 460000 },
      { companyId: '5', companyName: 'BlueWave Digital', orderCount: 8, revenue: 200000 },
    ],
    capacityAlerts: [
      { menuItemId: '1', menuItemName: 'Chicken Rice', currentOrders: 50, dailyCap: 50, percentage: 100 },
      { menuItemId: '2', menuItemName: 'Beef Noodles', currentOrders: 38, dailyCap: 40, percentage: 95 },
      { menuItemId: '3', menuItemName: 'Veggie Wrap', currentOrders: 17, dailyCap: 20, percentage: 85 },
    ],
  }
}
