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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

export function useDeletePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}
