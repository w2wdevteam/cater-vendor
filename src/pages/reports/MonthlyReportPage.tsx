import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ExportButtons from '@/components/common/ExportButtons'
import { useCompanies } from '@/hooks/useCompanies'
import { useMonthlyReport } from '@/hooks/useReports'
import { formatCurrency } from '@/lib/utils'

export default function MonthlyReportPage() {
  const { data: companies } = useCompanies()
  const [companyId, setCompanyId] = useState('')
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const { data, isLoading } = useMonthlyReport(companyId, month)

  useEffect(() => {
    document.title = 'Monthly Report — Catering Admin'
  }, [])

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return format(d, 'yyyy-MM')
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies
                ?.filter((c) => c.status === 'active')
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {format(new Date(m + '-01'), 'MMMM yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {companyId && <ExportButtons filename={`monthly-${companyId}-${month}`} />}
      </div>

      {!companyId ? (
        <div className="rounded-lg border bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-gray-500">Select a company to view the monthly report.</p>
        </div>
      ) : isLoading ? (
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      ) : data ? (
        <div className="space-y-4">
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="border-b px-6 py-3">
              <h3 className="text-sm font-semibold text-gray-900">
                {data.companyName} — {format(new Date(data.month + '-01'), 'MMMM yyyy')}
              </h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Menu Item</th>
                  <th className="px-6 py-3 text-right">Unit Price</th>
                  <th className="px-6 py-3 text-right">Quantity</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.rows.map((row) => (
                  <tr key={row.menuItemId} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.menuItemName}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{formatCurrency(row.unitPrice)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{row.quantity}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">{formatCurrency(row.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-gray-50 font-semibold">
                  <td className="px-6 py-3 text-sm text-gray-900">Billable Total</td>
                  <td className="px-6 py-3" />
                  <td className="px-6 py-3 text-right text-sm text-gray-900">{data.totalOrders}</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-900">{formatCurrency(data.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {data.notDeliveredOrders > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4">
              <p className="text-sm font-medium text-amber-800">
                Not Delivered: {data.notDeliveredOrders} orders ({formatCurrency(data.notDeliveredAmount)}) — excluded from billable total
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
