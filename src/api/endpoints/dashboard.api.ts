import { apiClient } from '../client'
import { unwrap } from '../unwrap'

export type ApiDashboardDeliveryStatus = 'idle' | 'on_the_way' | 'arrived' | 'delivered'
export type ApiCutoffStatus = 'open' | 'closed' | 'not_configured'

export interface ApiDashboard {
  todayOrderCount: number
  todayRevenue: number
  pendingRequestCount: number
  cutoffTime: string | null
  cutoffStatus: ApiCutoffStatus
  ordersPerCompany: Array<{
    companyId: string
    companyName: string
    orderCount: number
  }>
  itemsNearCap: Array<{
    menuItemId: string
    menuItemName: string
    ordered: number
    cap: number
  }>
  deliveryStatus: ApiDashboardDeliveryStatus
}

export const dashboardApi = {
  get: (): Promise<ApiDashboard> =>
    apiClient.get<ApiDashboard>('/cater-admin/dashboard').then(unwrap<ApiDashboard>),
}
