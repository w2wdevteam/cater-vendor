import type {
  NotDeliveredRequest,
  NotDeliveredFilters,
} from '@/types/not-delivered.types'
import type { RequestStatus } from '@/lib/constants'

let requestsState: NotDeliveredRequest[] = [
  {
    id: 'nd-1',
    companyId: '1',
    companyName: 'Acme Corporation',
    note: 'Several employees reported that their meals were never delivered to the 3rd floor.',
    status: 'pending',
    flaggedOrders: [
      { orderId: 'o1', employeeName: 'John Smith', menuItemName: 'Chicken Rice', menuItemImageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', orderDate: new Date().toISOString().slice(0, 10) },
      { orderId: 'o2', employeeName: 'Emily Chen', menuItemName: 'Beef Noodles', menuItemImageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', orderDate: new Date().toISOString().slice(0, 10) },
      { orderId: 'o3', employeeName: 'Robert Taylor', menuItemName: 'Caesar Salad', menuItemImageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400', orderDate: new Date().toISOString().slice(0, 10) },
    ],
    submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'nd-2',
    companyId: '2',
    companyName: 'GlobalTech Inc.',
    note: 'Delivery was not received at reception today.',
    status: 'pending',
    flaggedOrders: [
      { orderId: 'o4', employeeName: 'Kevin Li', menuItemName: 'Grilled Salmon Bowl', menuItemImageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', orderDate: new Date().toISOString().slice(0, 10) },
      { orderId: 'o5', employeeName: 'Amy Foster', menuItemName: 'Veggie Wrap', menuItemImageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', orderDate: new Date().toISOString().slice(0, 10) },
    ],
    submittedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'nd-3',
    companyId: '3',
    companyName: 'Summit Partners',
    status: 'approved',
    responseNote: 'Confirmed with driver — delivery was missed. Orders will be credited.',
    flaggedOrders: [
      { orderId: 'o6', employeeName: 'Brian Moore', menuItemName: 'Chicken Rice', menuItemImageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', orderDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10) },
      { orderId: 'o7', employeeName: 'Diana Ross', menuItemName: 'Beef Noodles', menuItemImageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', orderDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10) },
      { orderId: 'o8', employeeName: 'Brian Moore', menuItemName: 'Caesar Salad', menuItemImageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400', orderDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10) },
      { orderId: 'o9', employeeName: 'Diana Ross', menuItemName: 'Veggie Wrap', menuItemImageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', orderDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10) },
    ],
    submittedAt: new Date(Date.now() - 25 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
  },
  {
    id: 'nd-4',
    companyId: '4',
    companyName: 'Vertex Solutions',
    note: 'Claim that lunch was not delivered, but our records show it was signed for.',
    status: 'rejected',
    responseNote: 'Delivery confirmed via photo proof and signature. Request denied.',
    flaggedOrders: [
      { orderId: 'o10', employeeName: 'Steve Kim', menuItemName: 'Grilled Salmon Bowl', menuItemImageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', orderDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10) },
    ],
    submittedAt: new Date(Date.now() - 50 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: 'nd-5',
    companyId: '1',
    companyName: 'Acme Corporation',
    note: 'Missing one order from yesterday batch.',
    status: 'pending',
    flaggedOrders: [
      { orderId: 'o11', employeeName: 'Maria Garcia', menuItemName: 'Chicken Rice', menuItemImageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', orderDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10) },
    ],
    submittedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
]

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getRequests(
  filters?: NotDeliveredFilters,
): Promise<NotDeliveredRequest[]> {
  await delay()
  let result = [...requestsState]

  if (filters?.status && filters.status !== 'all') {
    result = result.filter((r) => r.status === filters.status)
  }
  if (filters?.companyId && filters.companyId !== 'all') {
    result = result.filter((r) => r.companyId === filters.companyId)
  }
  if (filters?.dateFrom) {
    result = result.filter((r) => r.submittedAt >= filters.dateFrom!)
  }
  if (filters?.dateTo) {
    const to = filters.dateTo + 'T23:59:59'
    result = result.filter((r) => r.submittedAt <= to)
  }

  return result.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )
}

export async function getRequestById(
  id: string,
): Promise<NotDeliveredRequest | null> {
  await delay()
  return requestsState.find((r) => r.id === id) ?? null
}

export async function approveRequest(
  id: string,
  responseNote?: string,
): Promise<NotDeliveredRequest> {
  await delay(500)
  requestsState = requestsState.map((r) =>
    r.id === id
      ? {
          ...r,
          status: 'approved' as RequestStatus,
          responseNote,
          resolvedAt: new Date().toISOString(),
        }
      : r,
  )
  const req = requestsState.find((r) => r.id === id)
  if (!req) throw new Error('Request not found')
  return { ...req }
}

export async function rejectRequest(
  id: string,
  responseNote?: string,
): Promise<NotDeliveredRequest> {
  await delay(500)
  requestsState = requestsState.map((r) =>
    r.id === id
      ? {
          ...r,
          status: 'rejected' as RequestStatus,
          responseNote,
          resolvedAt: new Date().toISOString(),
        }
      : r,
  )
  const req = requestsState.find((r) => r.id === id)
  if (!req) throw new Error('Request not found')
  return { ...req }
}

export async function bulkApprove(
  ids: string[],
  responseNote?: string,
): Promise<void> {
  await delay(600)
  requestsState = requestsState.map((r) =>
    ids.includes(r.id) && r.status === 'pending'
      ? {
          ...r,
          status: 'approved' as RequestStatus,
          responseNote,
          resolvedAt: new Date().toISOString(),
        }
      : r,
  )
}

export async function bulkReject(
  ids: string[],
  responseNote?: string,
): Promise<void> {
  await delay(600)
  requestsState = requestsState.map((r) =>
    ids.includes(r.id) && r.status === 'pending'
      ? {
          ...r,
          status: 'rejected' as RequestStatus,
          responseNote,
          resolvedAt: new Date().toISOString(),
        }
      : r,
  )
}
