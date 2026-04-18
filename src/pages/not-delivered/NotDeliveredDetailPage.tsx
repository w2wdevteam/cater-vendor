import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useNotDeliveredRequest,
  useApproveRequest,
  useRejectRequest,
} from '@/hooks/useNotDelivered'
import { formatDateTime, formatDate } from '@/lib/utils'

export default function NotDeliveredDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: request, isLoading } = useNotDeliveredRequest(id!)
  const approveMutation = useApproveRequest()
  const rejectMutation = useRejectRequest()

  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null)
  const [responseNote, setResponseNote] = useState('')

  useEffect(() => {
    document.title = request
      ? `${request.companyName} — Not Delivered Request`
      : 'Request Detail — Catering Admin'
  }, [request])

  async function handleAction() {
    if (!dialogAction || !id) return
    try {
      if (dialogAction === 'approve') {
        await approveMutation.mutateAsync({
          id,
          responseNote: responseNote || undefined,
        })
        toast.success('Request approved — company notified')
      } else {
        await rejectMutation.mutateAsync({
          id,
          responseNote: responseNote || undefined,
        })
        toast.success('Request rejected — company notified')
      }
      setDialogAction(null)
    } catch {
      toast.error(`Failed to ${dialogAction} request`)
    }
  }

  const isPending = approveMutation.isPending || rejectMutation.isPending

  if (isLoading) {
    return (
      <>
        <PageHeader title="Request Detail" />
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </>
    )
  }

  if (!request) {
    return (
      <>
        <PageHeader title="Request Not Found" />
        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            This request could not be found.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/not-delivered')}
          >
            Back to requests
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Request Detail"
        subtitle={`Not-delivered request from ${request.companyName}`}
        action={
          <Button variant="outline" onClick={() => navigate('/not-delivered')}>
            <ArrowLeft className="h-4 w-4" />
            Back to requests
          </Button>
        }
      />

      <div className="space-y-6 max-w-3xl">
        <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Request Information
            </h2>
            <StatusBadge status={request.status} className="text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Company</span>
              <span className="font-medium text-gray-900">
                {request.companyName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Submitted</span>
              <span className="font-medium text-gray-900">
                {formatDateTime(request.submittedAt)}
              </span>
            </div>
            {request.resolvedAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Resolved</span>
                <span className="font-medium text-gray-900">
                  {formatDateTime(request.resolvedAt)}
                </span>
              </div>
            )}
          </div>

          {request.note && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Company's Note
                </span>
              </div>
              <p className="text-sm text-amber-700">{request.note}</p>
            </div>
          )}

          {request.responseNote && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Response Note
                </span>
              </div>
              <p className="text-sm text-blue-700">{request.responseNote}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Flagged Orders ({request.flaggedOrders.length})
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3 w-8">#</th>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Menu Item</th>
                <th className="px-6 py-3">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {request.flaggedOrders.map((order, idx) => (
                <tr
                  key={order.orderId}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-xs font-medium text-gray-400">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {order.employeeName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {order.menuItemImageUrl && (
                        <img
                          src={order.menuItemImageUrl}
                          alt=""
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      <span className="text-sm text-gray-900">
                        {order.menuItemName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(order.orderDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {request.status === 'pending' && (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setResponseNote('')
                setDialogAction('approve')
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Approve Request
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setResponseNote('')
                setDialogAction('reject')
              }}
            >
              <XCircle className="h-4 w-4" />
              Reject Request
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={dialogAction !== null}
        onOpenChange={(open) => !open && setDialogAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve'
                ? 'Approve Request'
                : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve'
                ? `Approve this not-delivered request from ${request.companyName}? The ${request.flaggedOrders.length} flagged order${request.flaggedOrders.length > 1 ? 's' : ''} will be marked as not delivered.`
                : `Reject this not-delivered request from ${request.companyName}? Orders will remain unchanged.`}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Textarea
              placeholder="Response note (optional)"
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Cancel
            </Button>
            <Button
              variant={dialogAction === 'reject' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={isPending}
            >
              {isPending
                ? 'Processing...'
                : dialogAction === 'approve'
                  ? 'Approve'
                  : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
