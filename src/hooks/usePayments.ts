import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPayments,
  createPayment,
  deletePayment,
} from '@/services/payments.service'
import type { CreatePaymentInput, PaymentFilters } from '@/types/payment.types'

export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['payments', filters ?? {}],
    queryFn: () => getPayments(filters),
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePaymentInput) => createPayment(input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      // A payment shifts the recipient's balance — refresh whichever caches
      // hold that balance so list rows / detail pages reflect the new state.
      if (vars.companyId) {
        qc.invalidateQueries({ queryKey: ['companies'] })
        qc.invalidateQueries({ queryKey: ['company', vars.companyId] })
      }
      if (vars.cateringClientId) {
        qc.invalidateQueries({ queryKey: ['catering-clients'] })
      }
    },
  })
}

export function useDeletePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      // Don't have the recipient on the input — invalidate both stores so
      // whichever side held the balance is refreshed.
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['companies'] })
      qc.invalidateQueries({ queryKey: ['catering-clients'] })
    },
  })
}
