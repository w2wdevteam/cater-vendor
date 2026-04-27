import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Package, ShoppingCart, UserPlus } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import {
  clientOrderItemCount,
  clientOrderTotal,
  useClientOrders,
  type ClientOrder,
  type ClientOrderStatus,
} from '@/hooks/useClientOrders'
import { formatCurrency, formatDateTime } from '@/lib/utils'

type StatusFilter = ClientOrderStatus | 'all'

interface Filters {
  date: string
  status: StatusFilter
  search: string
}

export default function ClientOrdersPage() {
  const navigate = useNavigate()

  const [filters, setFilters] = useState<Filters>({
    date: '',
    status: 'all',
    search: '',
  })

  const debouncedSearch = useDebounce(filters.search, 500)
  const { data: orders = [], isLoading } = useClientOrders({
    date: filters.date || undefined,
    status: filters.status,
    search: debouncedSearch || undefined,
  })

  useEffect(() => {
    document.title = 'Client Orders — Catering Admin'
  }, [])

  const totalRevenue = orders
    .filter((o) => o.status !== 'rejected')
    .reduce((sum, o) => sum + clientOrderTotal(o), 0)

  return (
    <>
      <PageHeader
        title="Client Orders"
        subtitle="Orders placed for external catering clients (walk-ins and event bookings)."
        action={
          <Button onClick={() => navigate('/orders/create-client')}>
            <UserPlus className="h-4 w-4" />
            Place Client Order
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search by client, phone, address"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            className="max-w-[280px]"
          />
          <div className="flex items-center gap-1">
            <DatePicker
              value={filters.date}
              onChange={(v) => setFilters((f) => ({ ...f, date: v }))}
              placeholder="All dates"
              className="w-[180px]"
            />
            {filters.date && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters((f) => ({ ...f, date: '' }))}
              >
                Clear
              </Button>
            )}
          </div>
          <Select
            value={filters.status}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, status: v as StatusFilter }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="on_the_way">On the Way</SelectItem>
              <SelectItem value="arrived">Arrived</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-white shadow-sm">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3 text-right">Qty</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => (
                  <ClientOrderRow key={o.id} order={o} />
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={<ShoppingCart className="h-12 w-12" />}
              title="No client orders found"
              description={
                filters.search || filters.date || filters.status !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No client orders have been placed yet.'
              }
            />
          )}
        </div>

        {orders.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </div>
            <div>Total: {formatCurrency(totalRevenue)}</div>
          </div>
        )}
      </div>
    </>
  )
}

function ClientOrderRow({ order }: { order: ClientOrder }) {
  const itemCount = clientOrderItemCount(order)
  const total = clientOrderTotal(order)
  const firstItem = order.items[0]
  const extraCount = order.items.length - 1

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-gray-900">{order.clientName}</span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700">{order.phone}</td>
      <td className="px-6 py-4 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <span className="max-w-[240px] truncate">{order.address}</span>
          {order.locationLink && (
            <a
              href={order.locationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
              title="Open location"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {firstItem?.menuItemName ?? '—'}
        {extraCount > 0 && (
          <span className="ml-1 text-xs text-gray-500">+{extraCount} more</span>
        )}
      </td>
      <td className="px-6 py-4 text-right text-sm text-gray-700">{itemCount}</td>
      <td className="px-6 py-4 text-right text-sm text-gray-700">
        {formatCurrency(total)}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-6 py-4 text-xs text-gray-500">
        {formatDateTime(order.createdAt)}
      </td>
    </tr>
  )
}
