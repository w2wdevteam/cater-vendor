import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  date: string | Date,
  pattern: string = 'MMM d, yyyy',
): string {
  if (!date) return '—'
  return format(new Date(date), pattern)
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '—'
  return format(new Date(date), 'MMM d, yyyy • h:mm a')
}

export function formatCurrency(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(value)) return '—'
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' UZS'
}

export function formatTime(value: string | Date): string {
  if (!value) return '—'
  if (typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    const [h, m] = value.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return format(d, 'h:mm a')
  }
  return format(new Date(value), 'h:mm a')
}
