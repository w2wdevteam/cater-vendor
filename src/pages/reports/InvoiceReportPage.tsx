import { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import { Printer } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import ExportButtons from '@/components/common/ExportButtons'
import { useCompanies } from '@/hooks/useCompanies'
import { useInvoiceData } from '@/hooks/useReports'
import { formatCurrency } from '@/lib/utils'

export default function InvoiceReportPage() {
  const { data: companies } = useCompanies()
  const [companyId, setCompanyId] = useState('')
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const { data, isLoading } = useInvoiceData(companyId, month)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Invoice — Catering Admin'
  }, [])

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return format(d, 'yyyy-MM')
  })

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
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
        {companyId && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <ExportButtons formats={['pdf']} filename={`invoice-${companyId}-${month}`} />
          </div>
        )}
      </div>

      {!companyId ? (
        <div className="rounded-lg border bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-gray-500">Select a company and month to generate an invoice.</p>
        </div>
      ) : isLoading ? (
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-gray-100" style={{ width: `${60 + i * 5}%` }} />
            ))}
          </div>
        </div>
      ) : data ? (
        <div ref={invoiceRef} className="mx-auto max-w-3xl rounded-lg border bg-white p-8 shadow-sm print:border-0 print:shadow-none">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
              <p className="mt-1 text-sm text-gray-500">{data.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Catering Platform</p>
              <p className="text-sm text-gray-500">Billing Department</p>
              <p className="text-sm text-gray-500">billing@catering.com</p>
            </div>
          </div>

          <div className="mb-8 rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Bill To</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{data.companyName}</p>
            <p className="text-sm text-gray-600">{data.companyAddress}</p>
            <p className="text-sm text-gray-600">{data.contactName} • {data.contactEmail}</p>
            <p className="mt-2 text-sm text-gray-500">
              Period: {format(new Date(data.month + '-01'), 'MMMM yyyy')}
            </p>
          </div>

          <table className="mb-8 w-full">
            <thead>
              <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="pb-3">Item</th>
                <th className="pb-3 text-right">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.lines.map((line, i) => (
                <tr key={i}>
                  <td className="py-3 text-sm text-gray-900">{line.menuItemName}</td>
                  <td className="py-3 text-right text-sm text-gray-700">{line.quantity}</td>
                  <td className="py-3 text-right text-sm text-gray-700">{formatCurrency(line.unitPrice)}</td>
                  <td className="py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto max-w-xs space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(data.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service Charge (5%)</span>
              <span className="text-gray-900">{formatCurrency(data.serviceCharge)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax (8%)</span>
              <span className="text-gray-900">{formatCurrency(data.tax)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span className="text-gray-900">Grand Total</span>
              <span className="text-gray-900">{formatCurrency(data.grandTotal)}</span>
            </div>
          </div>

          <div className="mt-8 border-t pt-4 text-center text-xs text-gray-400">
            Thank you for your business. Payment is due within 30 days.
          </div>
        </div>
      ) : null}
    </div>
  )
}
