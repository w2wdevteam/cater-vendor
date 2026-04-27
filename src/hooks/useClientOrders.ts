import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { ordersApi, type ApiOrder, type CreateClientOrderBody } from '@/api/endpoints/orders.api'

export type ClientOrderStatus =
  | 'new'
  | 'on_the_way'
  | 'arrived'
  | 'delivered'
  | 'rejected'
  | 'cancelled'
  | 'not_delivered'

export interface ClientOrderItem {
  menuItemId: string
  menuItemName: string
  unitPrice: number
  quantity: number
}

/**
 * One catering-client cart produces N API Order rows (one per menu item) that
 * share `cateringClientId` + `createdAt` + `date`. We group them back into a
 * single "client order" for the UI.
 */
export interface ClientOrder {
  id: string
  date: string
  clientName: string
  phone: string
  address: string
  locationLink: string | null
  items: ClientOrderItem[]
  status: ClientOrderStatus
  createdAt: string
}

export interface ClientOrderFilters {
  date?: string
  status?: ClientOrderStatus | 'all'
  search?: string
}

function groupIntoClientOrders(rows: ApiOrder[]): ClientOrder[] {
  const groups = new Map<string, ClientOrder>()
  for (const r of rows) {
    if (!r.cateringClientId) continue
    // Bucket by (client + date + minute of createdAt) — same cart submit.
    const bucketKey = `${r.cateringClientId}|${r.date}|${r.createdAt.slice(0, 16)}`
    const existing = groups.get(bucketKey)
    const line: ClientOrderItem = {
      menuItemId: r.menuItemId,
      menuItemName: r.menuItemName,
      unitPrice: r.unitPrice,
      quantity: r.quantity,
    }
    if (existing) {
      existing.items.push(line)
      continue
    }
    groups.set(bucketKey, {
      id: r.id,
      date: r.date,
      clientName: r.cateringClientName ?? '—',
      phone: r.cateringClientPhone ?? '',
      address: r.deliveryAddress ?? '',
      locationLink: r.locationLink,
      items: [line],
      status: r.status as ClientOrderStatus,
      createdAt: r.createdAt,
    })
  }
  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function useClientOrders(filters: ClientOrderFilters = {}) {
  return useQuery({
    queryKey: ['client-orders', filters],
    queryFn: async () => {
      const { data } = await ordersApi.listClients({
        date: filters.date || undefined,
        status:
          filters.status && filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined,
        limit: 100,
      })
      return groupIntoClientOrders(data)
    },
    placeholderData: keepPreviousData,
  })
}

export function useCreateClientOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateClientOrderBody) => ordersApi.createClient(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-orders'] })
      qc.invalidateQueries({ queryKey: ['catering-clients'] })
      qc.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

export function clientOrderTotal(order: ClientOrder): number {
  return order.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0)
}

export function clientOrderItemCount(order: ClientOrder): number {
  return order.items.reduce((sum, it) => sum + it.quantity, 0)
}
