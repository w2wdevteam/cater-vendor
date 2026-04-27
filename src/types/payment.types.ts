export const PAYMENT_METHODS = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  card: 'Card',
  other: 'Other',
} as const

export type PaymentMethod = keyof typeof PAYMENT_METHODS

export type PaymentRecipientType = 'company' | 'client'

export interface Payment {
  id: string
  recipientType: PaymentRecipientType
  recipientId: string
  recipientName: string
  companyId: string | null
  companyName: string | null
  cateringClientId: string | null
  cateringClientName: string | null
  amount: number
  method: PaymentMethod
  paidAt: string
  note?: string
  createdAt: string
}

export interface CreatePaymentInput {
  companyId: string
  amount: number
  method: PaymentMethod
  paidAt: string
  note?: string
}

export interface PaymentFilters {
  companyId?: string | 'all'
  cateringClientId?: string | 'all'
  recipientType?: PaymentRecipientType | 'all'
  dateFrom?: string
  dateTo?: string
}
