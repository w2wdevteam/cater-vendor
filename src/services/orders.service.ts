import { ordersApi, type ApiOrder } from '@/api/endpoints/orders.api'
import { lookupsApi } from '@/api/endpoints/lookups.api'
import type { CreateOrderInput, KitchenPrepItem, Order, OrderFilters } from '@/types/order.types'
import type { OrderStatus } from '@/lib/constants'


function mapOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    employeeName: o.employeeName ?? (o.isCompanyLevel ? 'Company-level' : '—'),
    companyId: o.companyId ?? '',
    companyName: o.companyName ?? '—',
    departmentId: o.departmentId ?? '',
    departmentName: o.departmentName ?? '—',
    menuItemId: o.menuItemId,
    menuItemName: o.menuItemName,
    menuItemPrice: o.unitPrice,
    quantity: o.quantity,
    menuItemImageUrl: undefined,
    status: o.status as OrderStatus,
    rejectionReason: o.rejectionReason ?? undefined,
    date: o.date,
    createdAt: o.createdAt,
  }
}

export async function getTodayOrders(filters?: OrderFilters): Promise<Order[]> {
  const result = await ordersApi.list({
    // Empty string from the date picker means "all dates" — omit the param so
    // the backend returns orders across all days.
    date: filters?.date ? filters.date : undefined,
    companyId: filters?.companyId && filters.companyId !== 'all' ? filters.companyId : undefined,
    departmentId:
      filters?.departmentId && filters.departmentId !== 'all' ? filters.departmentId : undefined,
    menuItemId:
      filters?.menuItemId && filters.menuItemId !== 'all' ? filters.menuItemId : undefined,
    status: filters?.status && filters.status !== 'all' ? filters.status : undefined,
    search: filters?.search || undefined,
    limit: 100,
  })
  return result.data.map(mapOrder)
}

/**
 * The UI still collects `locationId`, but the backend derives it from the
 * employee (or company HQ) and does not accept it in CreateOrderDto. The page
 * is always company-level for now (no employee selector) — see API-QUESTIONS §9.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const order = await ordersApi.create({
    companyId: input.companyId,
    menuItemId: input.menuItemId,
    isCompanyLevel: true,
    quantity: Math.max(1, input.quantity),
    date: input.date || undefined,
  })
  return mapOrder(order)
}

export async function rejectOrder(orderId: string): Promise<Order> {
  return mapOrder(await ordersApi.reject(orderId))
}

export async function getKitchenPrep(date?: string): Promise<KitchenPrepItem[]> {
  const rows = await ordersApi.kitchenPrep(date)
  return rows.map((r) => ({
    menuItemId: r.menuItemId,
    menuItemName: r.menuItemName,
    totalQuantity: r.totalQuantity,
  }))
}

/**
 * Temporary helpers used by OrderCreatePage — will go away once the page is reworked
 * to use useEmployeesLookup + useMenuItemsLookup directly. These hit the lookup
 * endpoints lazily and cache nothing; prefer the React Query lookup hooks.
 */
export async function getEmployeesByCompany(companyId: string) {
  const items = await lookupsApi.employees({ companyId, status: 'active' })
  return items.map((e) => ({
    id: e.id,
    name: e.fullName,
    companyId: e.companyId,
    departmentId: e.departmentId ?? '',
  }))
}

export async function getAvailableMenuItems() {
  const items = await lookupsApi.menuItems({ status: 'active' })
  return items.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    imageUrl: i.imageUrl ?? undefined,
  }))
}
