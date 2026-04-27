import { apiClient } from '../client'
import { unwrap, unwrapList, type ListResult } from '../unwrap'

export type ApiRequestStatus = 'pending' | 'approved' | 'rejected'

export interface ApiNotDeliveredRequestSummary {
  id: string
  companyId: string
  companyName: string
  status: ApiRequestStatus
  note: string | null
  responseNote: string | null
  affectedOrderCount: number
  submittedAt: string
  resolvedAt: string | null
  submittedByName: string | null
}

export interface ApiFlaggedOrderDetail {
  orderId: string
  employeeName: string | null
  menuItemName: string
  date: string
  status: string
  menuItemImageUrl?: string | null
}

export interface ApiNotDeliveredRequestDetail extends ApiNotDeliveredRequestSummary {
  flaggedOrders: ApiFlaggedOrderDetail[]
}

export interface NotDeliveredListQuery {
  page?: number
  limit?: number
  companyId?: string
  status?: ApiRequestStatus
  dateFrom?: string
  dateTo?: string
}

export interface BulkActionBody {
  requestIds: string[]
  action: 'approve' | 'reject'
  responseNote?: string
}

export const notDeliveredApi = {
  list: (params: NotDeliveredListQuery = {}): Promise<ListResult<ApiNotDeliveredRequestSummary>> =>
    apiClient
      .get('/cater-admin/not-delivered-requests', { params })
      .then((r) => unwrapList<ApiNotDeliveredRequestSummary>(r)),

  get: (id: string): Promise<ApiNotDeliveredRequestDetail> =>
    apiClient
      .get<ApiNotDeliveredRequestDetail>(`/cater-admin/not-delivered-requests/${id}`)
      .then(unwrap<ApiNotDeliveredRequestDetail>),

  approve: (id: string, responseNote?: string): Promise<ApiNotDeliveredRequestDetail> =>
    apiClient
      .patch<ApiNotDeliveredRequestDetail>(
        `/cater-admin/not-delivered-requests/${id}/approve`,
        { responseNote: responseNote ?? null },
      )
      .then(unwrap<ApiNotDeliveredRequestDetail>),

  reject: (id: string, responseNote?: string): Promise<ApiNotDeliveredRequestDetail> =>
    apiClient
      .patch<ApiNotDeliveredRequestDetail>(
        `/cater-admin/not-delivered-requests/${id}/reject`,
        { responseNote: responseNote ?? null },
      )
      .then(unwrap<ApiNotDeliveredRequestDetail>),

  bulkAction: (body: BulkActionBody) =>
    apiClient
      .post<{ results: Array<{ requestId: string; status: 'approved' | 'rejected' | 'skipped'; reason?: string }> }>(
        '/cater-admin/not-delivered-requests/bulk-action',
        body,
      )
      .then(unwrap),
}
