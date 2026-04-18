import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { DatePicker } from '@/components/ui/date-picker'
import ExportButtons from '@/components/common/ExportButtons'
import { useDailyByLocationReport } from '@/hooks/useReports'

export default function DailyByLocationPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const { data, isLoading } = useDailyByLocationReport(date)

  useEffect(() => {
    document.title = 'Daily by Location — Catering Admin'
  }, [])

  const totalOrders = data?.reduce((s, r) => s + r.orderCount, 0) ?? 0
  const totalNd = data?.reduce((s, r) => s + r.notDeliveredCount, 0) ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DatePicker value={date} onChange={(v) => setDate(v)} className="w-[200px]" />
        <ExportButtons filename={`daily-by-location-${date}`} />
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3 text-right">Orders</th>
              <th className="px-6 py-3 text-right">Not Delivered</th>
              <th className="px-6 py-3 text-right">Effective Orders</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-36 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-4 w-12 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-4 w-12 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-4 w-12 animate-pulse rounded bg-gray-100" /></td>
                  </tr>
                ))
              : data?.map((row) => (
                  <tr key={row.locationId} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.locationName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.companyName}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{row.orderCount}</td>
                    <td className="px-6 py-4 text-right">
                      {row.notDeliveredCount > 0 ? (
                        <span className="text-sm font-medium text-red-600">{row.notDeliveredCount}</span>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {row.orderCount - row.notDeliveredCount}
                    </td>
                  </tr>
                ))}
          </tbody>
          {data && (
            <tfoot>
              <tr className="border-t bg-gray-50 font-semibold">
                <td className="px-6 py-3 text-sm text-gray-900">Total</td>
                <td className="px-6 py-3" />
                <td className="px-6 py-3 text-right text-sm text-gray-900">{totalOrders}</td>
                <td className="px-6 py-3 text-right text-sm text-red-600">{totalNd}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{totalOrders - totalNd}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
