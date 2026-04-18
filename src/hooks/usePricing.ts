import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOverrides,
  createOverride,
  updateOverride,
  deleteOverride,
} from '@/services/pricing.service'
import type { CreateOverrideInput, UpdateOverrideInput } from '@/types/pricing.types'

export function usePricingOverrides(companyId: string) {
  return useQuery({
    queryKey: ['pricing', companyId],
    queryFn: () => getOverrides(companyId),
    enabled: !!companyId,
  })
}

export function useCreateOverride() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOverrideInput) => createOverride(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['pricing', variables.companyId] })
    },
  })
}

export function useUpdateOverride(companyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateOverrideInput) => updateOverride(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricing', companyId] })
    },
  })
}

export function useDeleteOverride(companyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteOverride(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pricing', companyId] })
    },
  })
}
