import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCutoffTime,
  updateCutoffTime,
  updateDeliveryStatus,
} from '@/services/delivery-config.service'
import type { DeliveryStatus } from '@/types/delivery-config.types'

export function useCutoffTime() {
  return useQuery({
    queryKey: ['cutoff-time'],
    queryFn: getCutoffTime,
  })
}

export function useUpdateCutoffTime() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (time: string) => updateCutoffTime(time),
    onSuccess: (data) => {
      qc.setQueryData(['cutoff-time'], data)
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateDeliveryStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: DeliveryStatus) => updateDeliveryStatus(status),
    onSuccess: (data) => {
      qc.setQueryData(['cutoff-time'], data)
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
