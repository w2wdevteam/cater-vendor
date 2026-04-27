import { useEffect, useMemo, useState } from 'react'
import { format, parse } from 'date-fns'
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

  useEffect(() => {
    document.title = 'Monthly Report — Catering Admin'
  }, [])

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return format(d, 'yyyy-MM')
  })

  const selectedCompany = companies?.find((c) => c.id === companyId)
  const { data, isLoading } = useMonthlyReport(companyId, month)

  const days = useMemo(() => data?.days ?? [], [data])

  const { grandTotal, totalQty } = useMemo(() => {
    let gt = 0
    let qty = 0
    for (const d of days) {
      for (const it of d.items) {
        gt += it.quantity * it.unitPrice
        qty += it.quantity
      }
    }
    return { grandTotal: gt, totalQty: qty }
  }, [days])

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
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
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
                  {format(parse(m + '-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {companyId && (
          <ExportButtons
            filename={`monthly-${companyId}-${month}`}
            endpoint="/cater-admin/reports/monthly-by-company"
            params={{ companyId, month }}
          />
        )}
      </div>

      {!companyId ? (
        <div className="rounded-lg border bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            Select a company to view the monthly report.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {selectedCompany?.name ?? '—'} —{' '}
              {format(parse(month + '-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy')}
            </h3>
            <div className="text-xs text-gray-500">
              {days.length} day{days.length === 1 ? '' : 's'} · {totalQty} order
              {totalQty === 1 ? '' : 's'}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 px-6 py-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-gray-100"
                  style={{ width: `${90 - i * 8}%` }}
                />
              ))}
            </div>
          ) : days.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500">No orders for this month.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="border-r px-4 py-3">Date</th>
                    <th className="border-r px-4 py-3">Menu</th>
                    <th className="border-r px-4 py-3 text-right">Qty</th>
                    <th className="border-r px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => {
                    const dayTotal = day.items.reduce(
                      (s, i) => s + i.quantity * i.unitPrice,
                      0,
                    )
                    const span = day.items.length
                    return day.items.map((item, idx) => {
                      const isFirst = idx === 0
                      const isLastRowOfDay = idx === span - 1
                      const rowBorder = isLastRowOfDay ? 'border-b' : ''
                      return (
                        <tr
                          key={`${day.date}-${item.menuItemId}-${idx}`}
                          className="hover:bg-gray-50/60"
                        >
                          {isFirst && (
                            <td
                              rowSpan={span}
                              className="border-b border-r align-top px-4 py-3 font-medium text-gray-900"
                            >
                              {format(
                                parse(day.date, 'yyyy-MM-dd', new Date()),
                                'dd.MM.yyyy',
                              )}
                            </td>
                          )}
                          <td className={`border-r px-4 py-3 text-gray-700 ${rowBorder}`}>
                            {item.menuItemName}
                          </td>
                          <td className={`border-r px-4 py-3 text-right text-gray-700 ${rowBorder}`}>
                            {item.quantity}
                          </td>
                          <td className={`border-r px-4 py-3 text-right text-gray-700 ${rowBorder}`}>
                            {formatCurrency(item.unitPrice)}
                          </td>
                          {isFirst && (
                            <td
                              rowSpan={span}
                              className="border-b align-top px-4 py-3 text-right font-semibold text-gray-900"
                            >
                              {formatCurrency(dayTotal)}
                            </td>
                          )}
                        </tr>
                      )
                    })
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3 text-gray-900" colSpan={2}>
                      Grand Total
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {totalQty}
                    </td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatCurrency(grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
