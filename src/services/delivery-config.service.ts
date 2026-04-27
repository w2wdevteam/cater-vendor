import { deliveryApi } from '@/api/endpoints/delivery.api'
import type {
  CutoffConfig,
  DeliveryConfig,
  DeliveryStatus,
} from '@/types/delivery-config.types'

export async function getDeliveryConfig(): Promise<DeliveryConfig> {
  const config = await deliveryApi.getConfig()
  return {
    cutoffTime: config.cutoffTime ?? '',
    companyDeliveryWindows: config.companyDeliveryWindows,
  }
}

export async function getCutoffTime(): Promise<CutoffConfig> {
  const [config, status] = await Promise.all([
    deliveryApi.getConfig(),
    deliveryApi.getStatus(),
  ])
  return {
    cutoffTime: config.cutoffTime ?? '',
    deliveryStatus: status.status,
    updatedAt: status.deliveredAt ?? status.arrivedAt ?? status.startedAt ?? new Date().toISOString(),
  }
}

export async function updateCutoffTime(time: string): Promise<CutoffConfig> {
  const [config, status] = await Promise.all([
    deliveryApi.updateCutoff(time),
    deliveryApi.getStatus(),
  ])
  return {
    cutoffTime: config.cutoffTime ?? '',
    deliveryStatus: status.status,
    updatedAt: new Date().toISOString(),
  }
}

export async function updateDeliveryStatus(status: DeliveryStatus): Promise<CutoffConfig> {
  const [statusLog, config] = await Promise.all([
    deliveryApi.updateStatus(status),
    deliveryApi.getConfig(),
  ])
  return {
    cutoffTime: config.cutoffTime ?? '',
    deliveryStatus: statusLog.status,
    updatedAt: new Date().toISOString(),
  }
}

export async function updateCompanyDeliveryWindow(
  companyId: string,
  start: string | null,
  end: string | null,
): Promise<void> {
  await deliveryApi.updateCompanyWindow(companyId, {
    deliveryWindowStart: start,
    deliveryWindowEnd: end,
  })
}
