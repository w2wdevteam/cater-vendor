import type { MenuItemStatus } from '@/lib/constants'

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  dailyCap?: number
  status: MenuItemStatus
  createdAt: string
  updatedAt: string
}

export interface MenuAssignment {
  id: string
  date: string
  menuItemId: string
  maxOrders: number
  currentOrders: number
}

export interface DayAssignment {
  date: string
  items: Array<{
    assignmentId: string
    menuItem: MenuItem
    maxOrders: number
    currentOrders: number
    isSoldOut: boolean
  }>
}

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface TemplateItem {
  menuItemId: string
  maxOrders: number
}

export interface MenuTemplate {
  id: string
  name: string
  isActive: boolean
  days: Record<WeekDay, TemplateItem[]>
  createdAt: string
  updatedAt: string
}

export interface MenuItemFilters {
  search?: string
  status?: MenuItemStatus | 'all'
}

export interface MenuItemInput {
  name: string
  description?: string
  price: number
  imageUrl?: string
  dailyCap?: number
}
