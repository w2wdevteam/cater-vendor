import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import ExportButtons from '@/components/common/ExportButtons'
import { useRevenueReport } from '@/hooks/useReports'
import { formatCurrency } from '@/lib/utils'
import type { MenuBreakdownItem } from '@/types/report.types'

function formatBreakdown(items: MenuBreakdownItem[]) {
  return items.map((i) => `${i.menuItemName} ×${i.quantity}`).join(', ')
}

export default function RevenueReportPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const { data, isLoading } = useRevenueReport(date)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    document.title = 'Revenue Report — Catering Admin'
  }, [])

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
              <th className="w-10 px-3 py-3" />
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3 text-right">Orders</th>
              <th className="px-6 py-3 text-right">Revenue</th>
              <th className="px-6 py-3 text-right">Avg / Order</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-3 py-4" />
                    <td className="px-6 py-4"><div className="h-4 w-32 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-4 w-12 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-100" /></td>
                  </tr>
                ))
              : data?.map((row) => {
                  const isExpanded = expandedIds.has(row.companyId)
                  return (
                    <>
                      <tr
                        key={row.companyId}
                        className="cursor-pointer border-b transition-colors hover:bg-gray-50"
                        onClick={() => toggleExpand(row.companyId)}
                      >
                        <td className="px-3 py-4 text-gray-400">
                          {isExpanded
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.companyName}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-700">{row.orderCount}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">{formatCurrency(row.revenue)}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                          {formatCurrency(row.orderCount > 0 ? row.revenue / row.orderCount : 0)}
                        </td>
                      </tr>
                      {isExpanded && row.menuBreakdown.map((item) => (
                        <tr key={`${row.companyId}-${item.menuItemId}`} className="border-b bg-gray-50">
                          <td className="px-3 py-2" />
                          <td className="px-6 py-2 text-sm text-gray-600">{item.menuItemName}</td>
                          <td className="px-6 py-2 text-right text-sm text-gray-700">{item.quantity}</td>
                          <td className="px-6 py-2" />
                          <td className="px-6 py-2" />
                        </tr>
                      ))}
                    </>
                  )
                })}
          </tbody>
          {data && (
            <tfoot>
              <tr className="border-t bg-gray-50 font-semibold">
                <td className="px-3 py-3" />
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
