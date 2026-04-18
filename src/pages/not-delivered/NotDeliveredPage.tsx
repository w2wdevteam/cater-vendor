import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, PackageX, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Textarea } from '@/components/ui/textarea'
import {
  useNotDeliveredRequests,
  useBulkApprove,
  useBulkReject,
} from '@/hooks/useNotDelivered'
import { useCompanies } from '@/hooks/useCompanies'
import type { NotDeliveredFilters } from '@/types/not-delivered.types'
import { formatDateTime } from '@/lib/utils'

export default function NotDeliveredPage() {
  const navigate = useNavigate()
  const { data: companies } = useCompanies()
  const [filters, setFilters] = useState<NotDeliveredFilters>({
    status: 'all',
    companyId: 'all',
  })
  const { data: requests, isLoading } = useNotDeliveredRequests(filters)
  const bulkApproveMutation = useBulkApprove()
  const bulkRejectMutation = useBulkReject()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null)
  const [bulkNote, setBulkNote] = useState('')

  useEffect(() => {
    document.title = 'Not Delivered Requests — Catering Admin'
  }, [])

  const pendingRequests = requests?.filter((r) => r.status === 'pending') ?? []
  const allPendingSelected =
    pendingRequests.length > 0 &&
    pendingRequests.every((r) => selected.has(r.id))

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allPendingSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(pendingRequests.map((r) => r.id)))
    }
  }

  function openBulkDialog(action: 'approve' | 'reject') {
    setBulkAction(action)
    setBulkNote('')
  }

  async function handleBulkAction() {
    if (!bulkAction) return
    const ids = Array.from(selected)
    try {
      if (bulkAction === 'approve') {
        await bulkApproveMutation.mutateAsync({
          ids,
          responseNote: bulkNote || undefined,
        })
        toast.success(`${ids.length} request${ids.length > 1 ? 's' : ''} approved`)
      } else {
        await bulkRejectMutation.mutateAsync({
          ids,
          responseNote: bulkNote || undefined,
        })
        toast.success(`${ids.length} request${ids.length > 1 ? 's' : ''} rejected`)
      }
      setSelected(new Set())
      setBulkAction(null)
    } catch {
      toast.error(`Failed to ${bulkAction} requests`)
    }
  }

  const isBulkPending =
    bulkApproveMutation.isPending || bulkRejectMutation.isPending

  return (
    <>
      <PageHeader
        title="Not Delivered Requests"
        subtitle="Review and respond to delivery issue reports from companies."
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(v) =>
              setFilters((f) => ({
                ...f,
                status: v as NotDeliveredFilters['status'],
              }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.companyId ?? 'all'}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, companyId: v }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {companies?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                dateFrom: e.target.value || undefined,
              }))
            }
            className="w-[160px]"
            placeholder="From date"
          />
          <Input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                dateTo: e.target.value || undefined,
              }))
            }
            className="w-[160px]"
            placeholder="To date"
          />
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
            <span className="text-sm font-medium text-primary-700">
              {selected.size} request{selected.size > 1 ? 's' : ''} selected
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => openBulkDialog('approve')}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Approve Selected
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => openBulkDialog('reject')}
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject Selected
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelected(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-white shadow-sm">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-4 w-4 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : requests && requests.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allPendingSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3 text-center">Orders</th>
                  <th className="px-6 py-3">Note</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/not-delivered/${req.id}`)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      req.status === 'pending'
                        ? 'border-l-2 border-l-amber-400'
                        : ''
                    }`}
                  >
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {req.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selected.has(req.id)}
                          onChange={() => toggleSelect(req.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {req.companyName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatDateTime(req.submittedAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                        {req.flaggedOrders.length}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 line-clamp-1 max-w-[240px]">
                        {req.note || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={<PackageX className="h-12 w-12" />}
              title="No requests found"
              description={
                filters.status !== 'all' || filters.companyId !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'No not-delivered requests have been submitted.'
              }
            />
          )}
        </div>

        {requests && requests.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <PackageX className="h-3.5 w-3.5" />
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </div>
            <div>
              {requests.filter((r) => r.status === 'pending').length} pending
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={bulkAction !== null}
        onOpenChange={(open) => !open && setBulkAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === 'approve'
                ? 'Approve Selected Requests'
                : 'Reject Selected Requests'}
            </DialogTitle>
            <DialogDescription>
              {bulkAction === 'approve'
                ? `Approve ${selected.size} selected request${selected.size > 1 ? 's' : ''}? Affected orders will be marked as not delivered.`
                : `Reject ${selected.size} selected request${selected.size > 1 ? 's' : ''}? Orders will remain unchanged.`}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Textarea
              placeholder="Response note (optional)"
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAction(null)}>
              Cancel
            </Button>
            <Button
              variant={bulkAction === 'reject' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
              disabled={isBulkPending}
            >
              {isBulkPending
                ? 'Processing...'
                : bulkAction === 'approve'
                  ? 'Approve'
                  : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
