import { Bot, Building2, ShoppingCart, XCircle } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import type {
  ApiOrderStatus,
  IncomingAggregatedRow,
  IncomingSource,
} from '@/api/endpoints/orders.api'

interface Props {
  rows: IncomingAggregatedRow[]
  filtersActive: boolean
  loading: boolean
  onReject: (row: IncomingAggregatedRow) => void
}

const sourceMeta: Record<IncomingSource, { label: string; Icon: typeof Bot }> = {
  bot: { label: 'Bot', Icon: Bot },
  company_admin: { label: 'Company Admin', Icon: Building2 },
}

const STATUS_ORDER: ApiOrderStatus[] = [
  'new',
  'on_the_way',
  'arrived',
  'delivered',
  'rejected',
  'cancelled',
  'not_delivered',
]

const ACTIVE_STATUSES: ApiOrderStatus[] = ['new', 'on_the_way', 'arrived']

function canReject(row: IncomingAggregatedRow): boolean {
  return ACTIVE_STATUSES.some((s) => (row.statusCounts[s] ?? 0) > 0)
}

export default function IncomingOrdersTable({
  rows,
  filtersActive,
  loading,
  onReject,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border bg-white shadow-sm">
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="No incoming orders"
          description={
            filtersActive
              ? 'Try adjusting your search or filters.'
              : 'Aggregated orders placed via Telegram bot or Company Admin panel will appear here.'
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
            <th className="px-6 py-3">Company</th>
            <th className="px-6 py-3">Menu Item</th>
            <th className="px-6 py-3 text-right">Qty</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Source</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {row.companyName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{row.menuItemName}</td>
              <td className="px-6 py-4 text-right text-sm font-semibold tabular-nums text-gray-900">
                {row.totalQty}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap items-center gap-1">
                  {STATUS_ORDER.map((status) => {
                    const count = row.statusCounts[status] ?? 0
                    if (count === 0) return null
                    return (
                      <StatusBadge key={status} status={status} className="!text-[11px]">
                        {count} {labelFor(status)}
                      </StatusBadge>
                    )
                  })}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap items-center gap-1">
                  {row.sources.map((src) => {
                    const meta = sourceMeta[src]
                    return (
                      <span
                        key={src}
                        className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-700"
                      >
                        <meta.Icon className="h-3 w-3 text-gray-400" />
                        {meta.label}
                      </span>
                    )
                  })}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                {canReject(row) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onReject(row)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject all
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function labelFor(status: ApiOrderStatus): string {
  switch (status) {
    case 'new':
      return 'New'
    case 'on_the_way':
      return 'On the Way'
    case 'arrived':
      return 'Arrived'
    case 'delivered':
      return 'Delivered'
    case 'rejected':
      return 'Rejected'
    case 'cancelled':
      return 'Cancelled'
    case 'not_delivered':
      return 'Not Delivered'
  }
}
