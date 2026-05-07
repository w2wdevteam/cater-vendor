import { useEffect, useMemo, useState } from 'react'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import RecordPaymentDialog from '@/components/common/RecordPaymentDialog'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCompanies } from '@/hooks/useCompanies'
import { usePayments, useDeletePayment } from '@/hooks/usePayments'
import {
  PAYMENT_METHODS,
  type PaymentRecipientType,
} from '@/types/payment.types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api-errors'

export default function PaymentsPage() {
  const { data: companies } = useCompanies()
  const [companyId, setCompanyId] = useState<string>('all')
  const [recipientType, setRecipientType] = useState<PaymentRecipientType | 'all'>(
    'all',
  )
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: payments, isLoading } = usePayments({
    companyId,
    recipientType,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })
  const deleteMutation = useDeletePayment()

  const [createOpen, setCreateOpen] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteTarget = payments?.find((p) => p.id === deleteId)

  useEffect(() => {
    document.title = 'Payments — Catering Admin'
  }, [])

  const total = useMemo(
    () => (payments ?? []).reduce((sum, p) => sum + p.amount, 0),
    [payments],
  )

  const activeCompanies = companies?.filter((c) => c.status === 'active') ?? []

  function openCreate() {
    setCreateOpen(true)
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success('Payment deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete payment'))
    }
  }

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Record and track payments received from companies and clients."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Payment
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={recipientType}
            onValueChange={(v) =>
              setRecipientType(v as PaymentRecipientType | 'all')
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All recipients</SelectItem>
              <SelectItem value="company">Companies</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
            </SelectContent>
          </Select>
          {recipientType !== 'client' && (
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All companies</SelectItem>
                {activeCompanies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <DatePicker
            value={dateFrom}
            onChange={setDateFrom}
            placeholder="From date"
            className="w-[180px]"
          />
          <DatePicker
            value={dateTo}
            onChange={setDateTo}
            placeholder="To date"
            className="w-[180px]"
          />
          {(dateFrom || dateTo || companyId !== 'all' || recipientType !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateFrom('')
                setDateTo('')
                setCompanyId('all')
                setRecipientType('all')
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {payments && payments.length > 0 && (
          <div className="flex items-center gap-6 rounded-lg border bg-white px-6 py-4 shadow-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Payments
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {payments.length}
              </p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Total
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        ) : payments && payments.length > 0 ? (
          <div className="rounded-lg border bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Recipient</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Note</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(p.paidAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {p.recipientName}
                        </span>
                        {p.recipientType === 'client' && (
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                            Client
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {PAYMENT_METHODS[p.method]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="line-clamp-1 max-w-[280px]">
                        {p.note || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setDeleteId(p.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<CreditCard className="h-12 w-12" />}
            title="No payments yet"
            description={
              companyId !== 'all' || dateFrom || dateTo
                ? 'No payments match these filters.'
                : 'Record your first payment to get started.'
            }
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                New Payment
              </Button>
            }
          />
        )}
      </div>

      <RecordPaymentDialog open={createOpen} onOpenChange={setCreateOpen} />

      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Delete the{' '}
              <span className="font-medium">
                {formatCurrency(deleteTarget?.amount ?? 0)}
              </span>{' '}
              payment from{' '}
              <span className="font-medium">{deleteTarget?.recipientName}</span>?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
