import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  bulkApprove,
  bulkReject,
} from '@/services/not-delivered.service'
import type { NotDeliveredFilters } from '@/types/not-delivered.types'

export function useNotDeliveredRequests(filters?: NotDeliveredFilters) {
  return useQuery({
    queryKey: ['not-delivered', filters],
    queryFn: () => getRequests(filters),
    refetchInterval: 30_000,
  })
}

export function useNotDeliveredRequest(id: string) {
  return useQuery({
    queryKey: ['not-delivered', id],
    queryFn: () => getRequestById(id),
    enabled: !!id,
  })
}

export function useApproveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, responseNote }: { id: string; responseNote?: string }) =>
      approveRequest(id, responseNote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['not-delivered'] })
    },
  })
}

export function useRejectRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, responseNote }: { id: string; responseNote?: string }) =>
      rejectRequest(id, responseNote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['not-delivered'] })
    },
  })
}

export function useBulkApprove() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, responseNote }: { ids: string[]; responseNote?: string }) =>
      bulkApprove(ids, responseNote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['not-delivered'] })
    },
  })
}

export function useBulkReject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, responseNote }: { ids: string[]; responseNote?: string }) =>
      bulkReject(ids, responseNote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['not-delivered'] })
    },
  })
}
