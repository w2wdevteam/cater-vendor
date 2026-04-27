import { apiClient } from '../client'
import { unwrap } from '../unwrap'

export interface ApiDailyByCompany {
  date: string
  companies: Array<{
    companyId: string
    companyName: string
    orderCount: number
    notDeliveredCount: number
    menuBreakdown: Array<{ menuItemName: string; quantity: number }>
  }>
  totals: { orderCount: number; notDeliveredCount: number }
}

export interface ApiDailyRevenue {
  date: string
  totalRevenue: number
  companies: Array<{
    companyName: string
    revenue: number
    menuBreakdown: Array<{
      menuItemName: string
      quantity: number
      unitPrice: number
      subtotal: number
    }>
  }>
}

export interface ApiByMenu {
  dateFrom: string | null
  dateTo: string | null
  items: Array<{ menuItemId: string; menuItemName: string; totalOrders: number }>
}

export interface ApiMonthlyByCompany {
  companyName: string
  month: string
  menuBreakdown: Array<{
    menuItemName: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  days: Array<{
    date: string
    items: Array<{
      menuItemId: string
      menuItemName: string
      quantity: number
      unitPrice: number
    }>
  }>
  totalOrders: number
  totalPrice: number
  notDelivered: {
    count: number
    items: Array<{ menuItemName: string; quantity: number }>
  }
}

export interface ApiByLocation {
  dateFrom: string | null
  dateTo: string | null
  locations: Array<{
    locationName: string
    address: string | null
    totalOrders: number
    menuBreakdown: Array<{ menuItemName: string; quantity: number }>
  }>
}

export interface ApiCompanyOrderCount {
  dateFrom: string | null
  dateTo: string | null
  companies: Array<{
    companyName: string
    totalOrders: number
    menuBreakdown: Array<{ menuItemName: string; quantity: number }>
  }>
}

export interface ApiPopularItems {
  topItems: Array<{ menuItemName: string; orderCount: number }>
  bottomItems: Array<{ menuItemName: string; orderCount: number }>
}

export const reportsApi = {
  dailyByCompany: (date: string): Promise<ApiDailyByCompany> =>
    apiClient
      .get<ApiDailyByCompany>('/cater-admin/reports/daily-by-company', { params: { date } })
      .then(unwrap<ApiDailyByCompany>),

  dailyRevenue: (date: string): Promise<ApiDailyRevenue> =>
    apiClient
      .get<ApiDailyRevenue>('/cater-admin/reports/daily-revenue', { params: { date } })
      .then(unwrap<ApiDailyRevenue>),

  byMenu: (dateFrom: string, dateTo: string): Promise<ApiByMenu> =>
    apiClient
      .get<ApiByMenu>('/cater-admin/reports/by-menu', { params: { dateFrom, dateTo } })
      .then(unwrap<ApiByMenu>),

  byLocation: (dateFrom: string, dateTo: string): Promise<ApiByLocation> =>
    apiClient
      .get<ApiByLocation>('/cater-admin/reports/by-location', { params: { dateFrom, dateTo } })
      .then(unwrap<ApiByLocation>),

  monthlyByCompany: (companyId: string, month: string): Promise<ApiMonthlyByCompany> =>
    apiClient
      .get<ApiMonthlyByCompany>('/cater-admin/reports/monthly-by-company', {
        params: { companyId, month },
      })
      .then(unwrap<ApiMonthlyByCompany>),

  companyOrderCount: (dateFrom: string, dateTo: string): Promise<ApiCompanyOrderCount> =>
    apiClient
      .get<ApiCompanyOrderCount>('/cater-admin/reports/company-order-count', {
        params: { dateFrom, dateTo },
      })
      .then(unwrap<ApiCompanyOrderCount>),

  popularItems: (params: { dateFrom?: string; dateTo?: string; limit?: number }) =>
    apiClient
      .get<ApiPopularItems>('/cater-admin/reports/popular-items', { params })
      .then(unwrap<ApiPopularItems>),
}
