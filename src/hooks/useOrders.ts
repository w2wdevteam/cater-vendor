import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getKitchenPrep } from '@/services/orders.service'
import { ordersApi } from '@/api/endpoints/orders.api'
import type {
  CreateBulkCompanyOrderBody,
  CreateClientOrderBody,
  MineFilterQuery,
  RejectIncomingBody,
} from '@/api/endpoints/orders.api'

export function useKitchenPrep(date?: string) {
  return useQuery({
    queryKey: ['kitchen-prep', date],
    queryFn: () => getKitchenPrep(date),
  })
}

// ---------------------------------------------------------------------------
// Unified Orders page hooks (incoming aggregated + mine bulk).
// ---------------------------------------------------------------------------

export function useIncomingOrders(params: { date?: string; q?: string } = {}) {
  return useQuery({
    queryKey: ['orders', 'incoming', params],
    queryFn: () => ordersApi.incoming(params),
    refetchInterval: 30_000,
  })
}

export function useRejectIncoming() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: RejectIncomingBody) => ordersApi.rejectIncoming(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['kitchen-prep'] })
    },
  })
}

export function useMyOrders(params: MineFilterQuery = {}) {
  return useQuery({
    queryKey: ['orders', 'mine', params],
    queryFn: () => ordersApi.listMine(params),
  })
}

export function useCreateBulkCompanyOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBulkCompanyOrderBody) => ordersApi.createBulkCompany(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['kitchen-prep'] })
    },
  })
}

export function useCreateBulkClientOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateClientOrderBody) => ordersApi.createBulkClient(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['kitchen-prep'] })
    },
  })
}

export function useRejectMyOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      ordersApi.rejectMine(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['kitchen-prep'] })
    },
  })
}

export function useDeleteMyOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ordersApi.deleteMine(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['kitchen-prep'] })
    },
  })
}
