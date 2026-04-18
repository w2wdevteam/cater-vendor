import type { RequestStatus } from '@/lib/constants'

export interface FlaggedOrder {
  orderId: string
  employeeName: string
  menuItemName: string
  menuItemImageUrl?: string
  orderDate: string
}

export interface NotDeliveredRequest {
  id: string
  companyId: string
  companyName: string
  note?: string
  status: RequestStatus
  responseNote?: string
  flaggedOrders: FlaggedOrder[]
  submittedAt: string
  resolvedAt?: string
}

export interface NotDeliveredFilters {
  status?: RequestStatus | 'all'
  companyId?: string | 'all'
  dateFrom?: string
  dateTo?: string
}
