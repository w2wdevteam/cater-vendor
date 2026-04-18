import type { OrderStatus } from '@/lib/constants'

export interface Order {
  id: string
  employeeName: string
  companyId: string
  companyName: string
  departmentId: string
  departmentName: string
  menuItemId: string
  menuItemName: string
  menuItemPrice: number
  menuItemImageUrl?: string
  status: OrderStatus
  rejectionReason?: string
  date: string
  createdAt: string
}

export interface OrderFilters {
  date?: string
  companyId?: string | 'all'
  departmentId?: string | 'all'
  status?: OrderStatus | 'all'
  menuItemId?: string | 'all'
  search?: string
}

export interface CreateOrderInput {
  companyId: string
  menuItemId: string
  quantity: number
  locationId: string
}

export interface KitchenPrepItem {
  menuItemId: string
  menuItemName: string
  menuItemImageUrl?: string
  totalQuantity: number
}
