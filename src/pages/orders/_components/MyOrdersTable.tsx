import { Building2, ShoppingCart, Trash2, UserPlus, XCircle } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { ApiOrder } from '@/api/endpoints/orders.api'

interface Props {
  orders: ApiOrder[]
  filtersActive: boolean
  loading: boolean
  onReject: (id: string) => void
  onDelete: (id: string) => void
}

const typeBadge = {
  company: {
    label: 'Company',
    cls: 'bg-blue-50 text-blue-700',
    Icon: Building2,
  },
  client: {
    label: 'Client',
    cls: 'bg-orange-50 text-orange-700',
    Icon: UserPlus,
  },
} as const

function classifyOrder(o: ApiOrder): 'company' | 'client' {
  return o.placedVia === 'cater_admin_client' ? 'client' : 'company'
}

export default function MyOrdersTable({
  orders,
  filtersActive,
  loading,
  onReject,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border bg-white shadow-sm">
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="You haven't placed any orders yet"
          description={
            filtersActive
              ? 'Try adjusting your search or filters.'
              : 'Use the buttons above to place a bulk order for a company or client.'
          }
        />
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">For</th>
            <th className="px-6 py-3">Details</th>
            <th className="px-6 py-3">Menu Item</th>
            <th className="px-6 py-3 text-right">Qty</th>
            <th className="px-6 py-3 text-right">Total</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Placed</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((o) => {
            const type = classifyOrder(o)
            const t = typeBadge[type]
            const canReject = o.status === 'new'
            const isClient = type === 'client'
            return (
              <tr key={o.id} className="transition-colors hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${t.cls}`}
                  >
                    <t.Icon className="h-3 w-3" />
                    {t.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {isClient ? o.cateringClientName ?? '—' : o.companyName ?? '—'}
                  </div>
                  {isClient && o.cateringClientPhone && (
                    <div className="text-xs text-gray-500">{o.cateringClientPhone}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {isClient ? (
                    <span
                      className="block max-w-[240px] truncate"
                      title={o.deliveryAddress ?? ''}
                    >
                      {o.deliveryAddress ?? '—'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Catering-managed</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{o.menuItemName}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-700">{o.quantity}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(o.unitPrice * o.quantity)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {formatDateTime(o.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {canReject && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onReject(o.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => onDelete(o.id)}
                      title="Delete order"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export { classifyOrder }
