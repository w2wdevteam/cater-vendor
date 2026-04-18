import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { DatePicker } from '@/components/ui/date-picker'
import ExportButtons from '@/components/common/ExportButtons'
import { useRevenueReport } from '@/hooks/useReports'
import { formatCurrency } from '@/lib/utils'

export default function RevenueReportPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const { data, isLoading } = useRevenueReport(date)

  useEffect(() => {
    document.title = 'Revenue Report — Catering Admin'
  }, [])

  const totalOrders = data?.reduce((s, r) => s + r.orderCount, 0) ?? 0
  const totalRevenue = data?.reduce((s, r) => s + r.revenue, 0) ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DatePicker value={date} onChange={setDate} className="w-[200px]" />
        <ExportButtons filename={`revenue-${date}`} />
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3 text-right">Orders</th>
              <th className="px-6 py-3 text-right">Revenue</th>
              <th className="px-6 py-3 text-right">Avg / Order</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-32 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-4 w-12 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-100" /></td>
                  </tr>
                ))
              : data?.map((row) => (
                  <tr key={row.companyId} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.companyName}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{row.orderCount}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">{formatCurrency(row.revenue)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {formatCurrency(row.orderCount > 0 ? row.revenue / row.orderCount : 0)}
                    </td>
                  </tr>
                ))}
          </tbody>
          {data && (
            <tfoot>
              <tr className="border-t bg-gray-50 font-semibold">
                <td className="px-6 py-3 text-sm text-gray-900">Total</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{totalOrders}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{formatCurrency(totalRevenue)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-500">
                  {formatCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
