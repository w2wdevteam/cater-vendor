import type { CutoffConfig, DeliveryStatus } from '@/types/delivery-config.types'

let cutoffState: CutoffConfig = {
  cutoffTime: '10:00',
  deliveryStatus: 'ordering_open',
  updatedAt: new Date().toISOString(),
}

export async function getCutoffTime(): Promise<CutoffConfig> {
  await new Promise((r) => setTimeout(r, 400))
  return { ...cutoffState }
}

export async function updateCutoffTime(time: string): Promise<CutoffConfig> {
  await new Promise((r) => setTimeout(r, 500))
  cutoffState = { ...cutoffState, cutoffTime: time, updatedAt: new Date().toISOString() }
  return { ...cutoffState }
}

export async function updateDeliveryStatus(status: DeliveryStatus): Promise<CutoffConfig> {
  await new Promise((r) => setTimeout(r, 400))
  cutoffState = { ...cutoffState, deliveryStatus: status, updatedAt: new Date().toISOString() }
  return { ...cutoffState }
}
