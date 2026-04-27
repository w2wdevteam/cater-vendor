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

export interface OrderListQuery {
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  search?: string
  date?: string
  dateFrom?: string
  dateTo?: string
  companyId?: string
  departmentId?: string
  menuItemId?: string
  status?: ApiOrderStatus
}

export interface CreateOrderBody {
  companyId: string
  menuItemId: string
  employeeId?: string
  date?: string
  isCompanyLevel?: boolean
  quantity?: number
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

export const ordersApi = {
  list: (params: OrderListQuery = {}): Promise<ListResult<ApiOrder>> =>
    apiClient.get('/cater-admin/orders', { params }).then((r) => unwrapList<ApiOrder>(r)),

  get: (id: string): Promise<ApiOrder> =>
    apiClient.get<ApiOrder>(`/cater-admin/orders/${id}`).then(unwrap<ApiOrder>),

  create: (body: CreateOrderBody): Promise<ApiOrder> =>
    apiClient.post<ApiOrder>('/cater-admin/orders', body).then(unwrap<ApiOrder>),

  reject: (id: string): Promise<ApiOrder> =>
    apiClient
      .patch<ApiOrder>(`/cater-admin/orders/${id}/reject`, {})
      .then(unwrap<ApiOrder>),

  kitchenPrep: (date?: string): Promise<KitchenPrepEntry[]> =>
    apiClient
      .get<{ data: KitchenPrepEntry[] }>('/cater-admin/orders/kitchen-prep', {
        params: date ? { date } : undefined,
      })
      .then(unwrap<KitchenPrepEntry[]>),

  listClients: (params: OrderListQuery = {}): Promise<ListResult<ApiOrder>> =>
    apiClient
      .get('/cater-admin/orders/clients', { params })
      .then((r) => unwrapList<ApiOrder>(r)),

  getClient: (id: string): Promise<ApiOrder> =>
    apiClient
      .get<ApiOrder>(`/cater-admin/orders/clients/${id}`)
      .then(unwrap<ApiOrder>),

  createClient: (body: CreateClientOrderBody): Promise<CreateClientOrderResponse> =>
    apiClient
      .post<CreateClientOrderResponse>('/cater-admin/orders/clients', body)
      .then(unwrap<CreateClientOrderResponse>),
}
