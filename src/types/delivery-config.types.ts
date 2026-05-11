export type DeliveryStatus = 'idle' | 'on_the_way' | 'arrived' | 'delivered'

export interface CutoffConfig {
  cutoffTime: string
  deliveryStatus: DeliveryStatus
  updatedAt: string
  affectedOrderCount?: number
}

export interface CompanyDeliveryWindow {
  companyId: string
  companyName: string
  deliveryWindowStart: string | null
  deliveryWindowEnd: string | null
}

export interface DeliveryConfig {
  cutoffTime: string
  companyDeliveryWindows: CompanyDeliveryWindow[]
}
