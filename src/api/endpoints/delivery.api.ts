import { apiClient } from '../client'
import { unwrap } from '../unwrap'

export type ApiDeliveryStatus = 'idle' | 'on_the_way' | 'arrived' | 'delivered'

export interface ApiDeliveryConfig {
  cutoffTime: string | null
  companyDeliveryWindows: Array<{
    companyId: string
    companyName: string
    deliveryWindowStart: string | null
    deliveryWindowEnd: string | null
  }>
}

export interface ApiDeliveryStatusLog {
  id: string
  date: string
  status: ApiDeliveryStatus
  cateringId: string
  startedAt: string | null
  arrivedAt: string | null
  deliveredAt: string | null
}

export const deliveryApi = {
  getConfig: (): Promise<ApiDeliveryConfig> =>
    apiClient
      .get<ApiDeliveryConfig>('/cater-admin/delivery-config')
      .then(unwrap<ApiDeliveryConfig>),

  updateCutoff: (cutoffTime: string): Promise<ApiDeliveryConfig> =>
    apiClient
      .patch<ApiDeliveryConfig>('/cater-admin/delivery-config', { cutoffTime })
      .then(unwrap<ApiDeliveryConfig>),

  updateCompanyWindow: (
    companyId: string,
    body: { deliveryWindowStart?: string | null; deliveryWindowEnd?: string | null },
  ) =>
    apiClient
      .patch<{
        companyId: string
        companyName: string
        deliveryWindowStart: string | null
        deliveryWindowEnd: string | null
      }>(`/cater-admin/delivery-config/companies/${companyId}`, body)
      .then(unwrap),

  getStatus: (): Promise<ApiDeliveryStatusLog> =>
    apiClient
      .get<ApiDeliveryStatusLog>('/cater-admin/delivery-status')
      .then(unwrap<ApiDeliveryStatusLog>),

  updateStatus: (status: ApiDeliveryStatus): Promise<ApiDeliveryStatusLog> =>
    apiClient
      .patch<ApiDeliveryStatusLog>('/cater-admin/delivery-status', { status })
      .then(unwrap<ApiDeliveryStatusLog>),
}
