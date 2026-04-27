import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Package,
  ShoppingCart,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
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
import { useOrders, useRejectOrder } from '@/hooks/useOrders'
import { useCompanies } from '@/hooks/useCompanies'
import { useMenuItemsLookup } from '@/hooks/useLookups'
import { useDebounce } from '@/hooks/useDebounce'
import type { OrderFilters } from '@/types/order.types'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api-errors'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<OrderFilters>({
    date: todayKey(),
    companyId: 'all',
    status: 'all',
    menuItemId: 'all',
    search: '',
  })
  const debouncedSearch = useDebounce(filters.search, 1000)
  const { data: orders, isLoading } = useOrders({ ...filters, search: debouncedSearch })
  const { data: companies } = useCompanies()
  const rejectMutation = useRejectOrder()
  const { data: menuItemsList = [] } = useMenuItemsLookup({ status: 'active' })

  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Orders — Catering Admin'
  }, [])

  async function handleReject() {
    if (!rejectOrderId) return
    try {
      await rejectMutation.mutateAsync(rejectOrderId)
      toast.success('Order rejected')
      setRejectOrderId(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to reject order'))
    }
  }

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Orders placed across all companies. Defaults to today — clear the date to see all."
        action={
          <Button onClick={() => navigate('/orders/create')}>
            <Building2 className="h-4 w-4" />
            Place Order
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search by employee name"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            className="max-w-[240px]"
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
                title="Clear date filter"
              >
                Clear
              </Button>
            )}
          </div>
          <Select
            value={filters.companyId}
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
          <Select
            value={filters.status}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, status: v as OrderFilters['status'] }))
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
          <Select
            value={filters.menuItemId}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, menuItemId: v }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All menu items</SelectItem>
              {menuItemsList.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-white shadow-sm">
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Menu Item</th>
                  <th className="px-6 py-3 text-right">Qty</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {order.employeeName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.companyName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.departmentName}
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
                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      {formatCurrency(order.menuItemPrice * order.quantity)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status !== 'rejected' &&
                        order.status !== 'delivered' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setRejectOrderId(order.id)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={<ShoppingCart className="h-12 w-12" />}
              title="No orders found"
              description={
                filters.search ||
                filters.companyId !== 'all' ||
                filters.status !== 'all' ||
                filters.menuItemId !== 'all' ||
                filters.date
                  ? 'Try adjusting your search or filters.'
                  : 'No orders have been placed yet.'
              }
            />
          )}
        </div>

        {orders && orders.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </div>
            <div>
              Total:{' '}
              {formatCurrency(
                orders
                  .filter((o) => o.status !== 'rejected')
                  .reduce((sum, o) => sum + o.menuItemPrice * o.quantity, 0),
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!rejectOrderId}
        onOpenChange={(open) => { if (!open) setRejectOrderId(null) }}
        title="Reject Order"
        description="Are you sure you want to reject this order? The employee will be notified."
        confirmLabel="Reject Order"
        destructive
        loading={rejectMutation.isPending}
        onConfirm={handleReject}
      />
    </>
  )
}
