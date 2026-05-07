import { paymentsApi, type ApiPayment } from '@/api/endpoints/payments.api'
import type {
  CreatePaymentInput,
  Payment,
  PaymentFilters,
} from '@/types/payment.types'

function mapPayment(p: ApiPayment): Payment {
  const recipientId =
    p.recipientType === 'client'
      ? (p.cateringClientId ?? '')
      : (p.companyId ?? '')
  const recipientName =
    p.recipientType === 'client'
      ? (p.cateringClientName ?? '—')
      : (p.companyName ?? '—')
  return {
    id: p.id,
    recipientType: p.recipientType,
    recipientId,
    recipientName,
    companyId: p.companyId,
    companyName: p.companyName,
    cateringClientId: p.cateringClientId,
    cateringClientName: p.cateringClientName,
    amount: p.amount,
    method: p.method,
    paidAt: p.paidAt,
    note: p.note ?? undefined,
    createdAt: p.createdAt,
  }
}

export async function getPayments(filters?: PaymentFilters): Promise<Payment[]> {
  const res = await paymentsApi.list({
    companyId:
      filters?.companyId && filters.companyId !== 'all'
        ? filters.companyId
        : undefined,
    cateringClientId:
      filters?.cateringClientId && filters.cateringClientId !== 'all'
        ? filters.cateringClientId
        : undefined,
    recipientType:
      filters?.recipientType && filters.recipientType !== 'all'
        ? filters.recipientType
        : undefined,
    dateFrom: filters?.dateFrom || undefined,
    dateTo: filters?.dateTo || undefined,
    limit: 100,
  })
  return res.data.map(mapPayment)
}

export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  return mapPayment(
    await paymentsApi.create({
      companyId: input.companyId,
      cateringClientId: input.cateringClientId,
      amount: input.amount,
      method: input.method,
      paidAt: input.paidAt,
      note: input.note || undefined,
    }),
  )
}

export async function deletePayment(id: string): Promise<void> {
  await paymentsApi.remove(id)
}
