import { apiClient } from '../client'
import { unwrap, unwrapList, type ListResult } from '../unwrap'
import type { PaymentMethod } from '@/types/payment.types'

export type PaymentRecipientType = 'company' | 'client'

export interface ApiPayment {
  id: string
  recipientType: PaymentRecipientType
  companyId: string | null
  companyName: string | null
  cateringClientId: string | null
  cateringClientName: string | null
  amount: number
  method: PaymentMethod
  paidAt: string
  note: string | null
  createdAt: string
}

export interface PaymentListQuery {
  page?: number
  limit?: number
  companyId?: string
  cateringClientId?: string
  recipientType?: PaymentRecipientType
  dateFrom?: string
  dateTo?: string
}

/**
 * Provide EITHER companyId OR cateringClientId — never both, never neither.
 * The backend enforces the XOR and rejects invalid combinations with 400.
 */
export interface CreatePaymentBody {
  companyId?: string
  cateringClientId?: string
  amount: number
  method: PaymentMethod
  paidAt: string
  note?: string
}

export const paymentsApi = {
  list: (params: PaymentListQuery = {}): Promise<ListResult<ApiPayment>> =>
    apiClient
      .get('/cater-admin/payments', { params })
      .then((r) => unwrapList<ApiPayment>(r)),

  create: (body: CreatePaymentBody): Promise<ApiPayment> =>
    apiClient
      .post<ApiPayment>('/cater-admin/payments', body)
      .then(unwrap<ApiPayment>),

  remove: (id: string): Promise<void> =>
    apiClient.delete(`/cater-admin/payments/${id}`).then(() => undefined),
}
