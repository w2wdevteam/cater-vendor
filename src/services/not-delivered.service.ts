import {
  notDeliveredApi,
  type ApiNotDeliveredRequestDetail,
  type ApiNotDeliveredRequestSummary,
} from '@/api/endpoints/not-delivered.api'
import type { NotDeliveredFilters, NotDeliveredRequest } from '@/types/not-delivered.types'
import type { RequestStatus } from '@/lib/constants'

function mapSummary(r: ApiNotDeliveredRequestSummary): NotDeliveredRequest {
  return {
    id: r.id,
    companyId: r.companyId,
    companyName: r.companyName,
    note: r.note ?? undefined,
    status: r.status as RequestStatus,
    responseNote: r.responseNote ?? undefined,
    flaggedOrders: [],
    submittedAt: r.submittedAt,
    resolvedAt: r.resolvedAt ?? undefined,
  }
}

function mapDetail(r: ApiNotDeliveredRequestDetail): NotDeliveredRequest {
  return {
    ...mapSummary(r),
    flaggedOrders: r.flaggedOrders.map((f) => ({
      orderId: f.orderId,
      employeeName: f.employeeName ?? 'Company-level',
      menuItemName: f.menuItemName,
      menuItemImageUrl: f.menuItemImageUrl ?? undefined,
      orderDate: f.date,
    })),
  }
}

export async function getRequests(filters?: NotDeliveredFilters): Promise<NotDeliveredRequest[]> {
  const result = await notDeliveredApi.list({
    companyId: filters?.companyId && filters.companyId !== 'all' ? filters.companyId : undefined,
    status: filters?.status && filters.status !== 'all' ? filters.status : undefined,
    dateFrom: filters?.dateFrom,
    dateTo: filters?.dateTo,
    limit: 100,
  })
  return result.data.map(mapSummary)
}

export async function getRequestById(id: string): Promise<NotDeliveredRequest | null> {
  try {
    return mapDetail(await notDeliveredApi.get(id))
  } catch {
    return null
  }
}

export async function approveRequest(
  id: string,
  responseNote?: string,
): Promise<NotDeliveredRequest> {
  return mapDetail(await notDeliveredApi.approve(id, responseNote))
}

export async function rejectRequest(
  id: string,
  responseNote?: string,
): Promise<NotDeliveredRequest> {
  return mapDetail(await notDeliveredApi.reject(id, responseNote))
}

export async function bulkApprove(ids: string[], responseNote?: string): Promise<void> {
  await notDeliveredApi.bulkAction({ requestIds: ids, action: 'approve', responseNote })
}

export async function bulkReject(ids: string[], responseNote?: string): Promise<void> {
  await notDeliveredApi.bulkAction({ requestIds: ids, action: 'reject', responseNote })
}
