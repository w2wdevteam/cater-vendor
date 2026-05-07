import { apiClient } from '../client'
import { unwrap, unwrapList, type ListResult } from '../unwrap'

export type ApiOrderStatus =
  | 'new'
  | 'on_the_way'
  | 'arrived'
  | 'delivered'
  | 'cancelled'
  | 'rejected'
  | 'not_delivered'

export type ApiOrderSource = 'bot' | 'company_admin' | 'cater_admin' | 'cater_admin_client'

export interface ApiOrder {
  id: string
  date: string
  status: ApiOrderStatus
  placedVia: ApiOrderSource
  isCompanyLevel: boolean
  unitPrice: number
  quantity: number
  rejectionReason: string | null
  employeeId: string | null
  employeeName: string | null
  menuItemId: string
  menuItemName: string
  companyId: string | null
  companyName: string | null
  cateringClientId: string | null
  cateringClientName: string | null
  cateringClientPhone: string | null
  deliveryAddress: string | null
  locationLink: string | null
  departmentId: string | null
  departmentName: string | null
  locationId: string | null
  cateringId: string
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateClientOrderBody {
  date?: string
  clientName: string
  phone: string
  address: string
  locationLink?: string
  notes?: string
  items: Array<{ menuItemId: string; quantity: number }>
  markAsPaid?: boolean
}

export interface CreateClientOrderResponse {
  clientId: string
  orderIds: string[]
  paymentId?: string
}

export interface KitchenPrepEntry {
  menuItemId: string
  menuItemName: string
  totalQuantity: number
  byCompany: Array<{
    companyId: string
    companyName: string
    quantity: number
  }>
}

// ---------------------------------------------------------------------------
// Unified Orders page — incoming (aggregated) + mine (cater-placed bulk).
// ---------------------------------------------------------------------------

export type IncomingSource = 'bot' | 'company_admin'

export interface IncomingAggregatedRow {
  id: string
  date: string
  companyId: string
  companyName: string
  menuItemId: string
  menuItemName: string
  totalQty: number
  statusCounts: Partial<Record<ApiOrderStatus, number>>
  sources: IncomingSource[]
  lastActivityAt: string
}

export interface IncomingResponse {
  date: string
  rows: IncomingAggregatedRow[]
  totalActiveQty: number
}

export interface RejectIncomingBody {
  date: string
  companyId: string
  menuItemId: string
  reason?: string
}

export interface RejectIncomingResponse {
  rejectedCount: number
  row: IncomingAggregatedRow | null
}

export type MineOrderType = 'all' | 'company' | 'client'

export interface MineFilterQuery {
  date?: string
  type?: MineOrderType
  q?: string
  page?: number
  limit?: number
}

export interface CreateBulkCompanyOrderBody {
  companyId: string
  menuItemId: string
  quantity: number
  date?: string
}

export const ordersApi = {
  kitchenPrep: (date?: string): Promise<KitchenPrepEntry[]> =>
    apiClient
      .get<{
        data: { date: string; items: KitchenPrepEntry[]; totalOrders: number }
      }>('/cater-admin/orders/kitchen-prep', {
        params: date ? { date } : undefined,
      })
      .then((r) => r.data.data.items),

  // -------- Unified Orders page --------

  incoming: (params: { date?: string; q?: string } = {}): Promise<IncomingResponse> =>
    apiClient
      .get<IncomingResponse>('/cater-admin/orders/incoming', { params })
      .then(unwrap<IncomingResponse>),

  rejectIncoming: (body: RejectIncomingBody): Promise<RejectIncomingResponse> =>
    apiClient
      .post<RejectIncomingResponse>('/cater-admin/orders/incoming/reject', body)
      .then(unwrap<RejectIncomingResponse>),

  listMine: (params: MineFilterQuery = {}): Promise<ListResult<ApiOrder>> =>
    apiClient
      .get('/cater-admin/orders/mine', { params })
      .then((r) => unwrapList<ApiOrder>(r)),

  createBulkCompany: (body: CreateBulkCompanyOrderBody): Promise<ApiOrder> =>
    apiClient
      .post<ApiOrder>('/cater-admin/orders/mine/company', body)
      .then(unwrap<ApiOrder>),

  createBulkClient: (body: CreateClientOrderBody): Promise<CreateClientOrderResponse> =>
    apiClient
      .post<CreateClientOrderResponse>('/cater-admin/orders/mine/client', body)
      .then(unwrap<CreateClientOrderResponse>),

  rejectMine: (id: string, reason?: string): Promise<ApiOrder> =>
    apiClient
      .patch<ApiOrder>(`/cater-admin/orders/mine/${id}/reject`, { rejectionReason: reason })
      .then(unwrap<ApiOrder>),

  deleteMine: (id: string): Promise<void> =>
    apiClient.delete(`/cater-admin/orders/mine/${id}`).then(() => undefined),
}
