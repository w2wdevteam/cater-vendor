import { useQuery } from '@tanstack/react-query'
import {
  getDailyReport,
  getDailyByLocationReport,
  getDailyByMenuReport,
  getMonthlyReport,
  getRevenueReport,
  getInvoiceData,
} from '@/services/reports.service'

export function useDailyReport(date: string) {
  return useQuery({
    queryKey: ['reports', 'daily', date],
    queryFn: () => getDailyReport(date),
    enabled: !!date,
  })
}

export function useDailyByLocationReport(date: string) {
  return useQuery({
    queryKey: ['reports', 'daily-by-location', date],
    queryFn: () => getDailyByLocationReport(date),
    enabled: !!date,
  })
}

export function useDailyByMenuReport(date: string) {
  return useQuery({
    queryKey: ['reports', 'daily-by-menu', date],
    queryFn: () => getDailyByMenuReport(date),
    enabled: !!date,
  })
}

export function useMonthlyReport(companyId: string, month: string) {
  return useQuery({
    queryKey: ['reports', 'monthly', companyId, month],
    queryFn: () => getMonthlyReport(companyId, month),
    enabled: !!companyId && !!month,
  })
}

export function useRevenueReport(date: string) {
  return useQuery({
    queryKey: ['reports', 'revenue', date],
    queryFn: () => getRevenueReport(date),
    enabled: !!date,
  })
}

export function useInvoiceData(companyId: string, month: string) {
  return useQuery({
    queryKey: ['reports', 'invoice', companyId, month],
    queryFn: () => getInvoiceData(companyId, month),
    enabled: !!companyId && !!month,
  })
}
