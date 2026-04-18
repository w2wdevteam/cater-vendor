import type {
  Order,
  OrderFilters,
  CreateOrderInput,
  KitchenPrepItem,
} from '@/types/order.types'
import type { OrderStatus } from '@/lib/constants'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

const employees = [
  { name: 'John Smith', companyId: '1', departmentId: 'd1' },
  { name: 'Emily Chen', companyId: '1', departmentId: 'd1' },
  { name: 'Robert Taylor', companyId: '1', departmentId: 'd2' },
  { name: 'Maria Garcia', companyId: '1', departmentId: 'd3' },
  { name: 'Kevin Li', companyId: '2', departmentId: 'd4' },
  { name: 'Amy Foster', companyId: '2', departmentId: 'd5' },
  { name: 'Brian Moore', companyId: '3', departmentId: 'd6' },
  { name: 'Diana Ross', companyId: '3', departmentId: 'd7' },
  { name: 'Steve Kim', companyId: '4', departmentId: 'd8' },
  { name: 'Mia Zhang', companyId: '4', departmentId: 'd9' },
  { name: 'Jake Brown', companyId: '5', departmentId: 'd10' },
]

const companyNames: Record<string, string> = {
  '1': 'Acme Corporation',
  '2': 'GlobalTech Inc.',
  '3': 'Summit Partners',
  '4': 'Vertex Solutions',
  '5': 'BlueWave Digital',
}

const departmentNames: Record<string, string> = {
  d1: 'Engineering',
  d2: 'Marketing',
  d3: 'HR & Admin',
  d4: 'Product',
  d5: 'Sales',
  d6: 'Finance',
  d7: 'Operations',
  d8: 'Development',
  d9: 'Design',
  d10: 'Creative',
}

const menuItems: Record<string, { name: string; price: number; imageUrl?: string }> = {
  '1': { name: 'Chicken Rice', price: 25000, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
  '2': { name: 'Beef Noodles', price: 30000, imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
  '3': { name: 'Veggie Wrap', price: 22000, imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400' },
  '4': { name: 'Grilled Salmon Bowl', price: 35000, imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400' },
  '5': { name: 'Caesar Salad', price: 20000, imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400' },
}

const statuses: OrderStatus[] = ['new', 'on_the_way', 'arrived', 'delivered']

let ordersState: Order[] = (() => {
  const list: Order[] = []
  const d = today()
  const usedEmployees = employees.slice(0, 8)
  const menuItemIds = ['1', '2', '3', '5']

  for (const emp of usedEmployees) {
    const itemId = menuItemIds[Math.floor(Math.random() * menuItemIds.length)]
    const item = menuItems[itemId]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    list.push({
      id: uid(),
      employeeName: emp.name,
      companyId: emp.companyId,
      companyName: companyNames[emp.companyId],
      departmentId: emp.departmentId,
      departmentName: departmentNames[emp.departmentId],
      menuItemId: itemId,
      menuItemName: item.name,
      menuItemPrice: item.price,
      menuItemImageUrl: item.imageUrl,
      status,
      date: d,
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 3600000),
      ).toISOString(),
    })
  }

  list.push({
    id: uid(),
    employeeName: 'Sam Wilson',
    companyId: '1',
    companyName: 'Acme Corporation',
    departmentId: 'd1',
    departmentName: 'Engineering',
    menuItemId: '3',
    menuItemName: 'Veggie Wrap',
    menuItemPrice: 22000,
    menuItemImageUrl: menuItems['3'].imageUrl,
    status: 'rejected',
    rejectionReason: 'Item no longer available',
    date: d,
    createdAt: new Date(Date.now() - 2400000).toISOString(),
  })

  return list
})()

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getTodayOrders(
  filters?: OrderFilters,
): Promise<Order[]> {
  await delay()
  const date = filters?.date ?? today()
  let result = ordersState.filter((o) => o.date === date)

  if (filters?.companyId && filters.companyId !== 'all') {
    result = result.filter((o) => o.companyId === filters.companyId)
  }
  if (filters?.departmentId && filters.departmentId !== 'all') {
    result = result.filter((o) => o.departmentId === filters.departmentId)
  }
  if (filters?.status && filters.status !== 'all') {
    result = result.filter((o) => o.status === filters.status)
  }
  if (filters?.menuItemId && filters.menuItemId !== 'all') {
    result = result.filter((o) => o.menuItemId === filters.menuItemId)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter((o) => o.employeeName.toLowerCase().includes(q))
  }

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await delay(600)
  const item = menuItems[input.menuItemId]
  if (!item) throw new Error('Menu item not found')

  const order: Order = {
    id: uid(),
    employeeName: 'Order',
    companyId: input.companyId,
    companyName: companyNames[input.companyId],
    departmentId: '',
    departmentName: '—',
    menuItemId: input.menuItemId,
    menuItemName: item.name,
    menuItemPrice: item.price * input.quantity,
    menuItemImageUrl: item.imageUrl,
    status: 'new',
    date: today(),
    createdAt: new Date().toISOString(),
  }
  ordersState = [order, ...ordersState]
  return order
}

export async function rejectOrder(
  orderId: string,
  reason?: string,
): Promise<Order> {
  await delay(500)
  ordersState = ordersState.map((o) =>
    o.id === orderId
      ? { ...o, status: 'rejected' as OrderStatus, rejectionReason: reason }
      : o,
  )
  const order = ordersState.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')
  return { ...order }
}

export async function getKitchenPrep(date?: string): Promise<KitchenPrepItem[]> {
  await delay()
  const d = date ?? today()
  const orders = ordersState.filter(
    (o) => o.date === d && o.status !== 'rejected',
  )
  const map = new Map<string, KitchenPrepItem>()
  for (const o of orders) {
    const existing = map.get(o.menuItemId)
    if (existing) {
      existing.totalQuantity++
    } else {
      map.set(o.menuItemId, {
        menuItemId: o.menuItemId,
        menuItemName: o.menuItemName,
        menuItemImageUrl: o.menuItemImageUrl,
        totalQuantity: 1,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalQuantity - a.totalQuantity)
}

export function getEmployeesByCompany(companyId: string) {
  return employees.filter((e) => e.companyId === companyId)
}

export function getAvailableMenuItems() {
  return Object.entries(menuItems).map(([id, item]) => ({
    id,
    ...item,
  }))
}
