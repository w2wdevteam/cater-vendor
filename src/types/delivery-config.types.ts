export type DeliveryStatus = 'ordering_open' | 'on_the_way' | 'delivered'

export interface CutoffConfig {
  cutoffTime: string
  deliveryStatus: DeliveryStatus
  updatedAt: string
}
