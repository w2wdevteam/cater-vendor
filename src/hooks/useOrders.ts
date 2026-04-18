import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTodayOrders,
  createOrder,
  rejectOrder,
  getKitchenPrep,
} from '@/services/orders.service'
import type { OrderFilters, CreateOrderInput } from '@/types/order.types'

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => getTodayOrders(filters),
    refetchInterval: 30_000,
  })
}

export function useKitchenPrep(date?: string) {
  return useQuery({
    queryKey: ['kitchen-prep', date],
    queryFn: () => getKitchenPrep(date),
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['kitchen-prep'] })
    },
  })
}

export function useRejectOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      rejectOrder(orderId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['kitchen-prep'] })
    },
  })
}
