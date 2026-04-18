import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  DollarSign,
  PackageX,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import PageHeader from '@/components/common/PageHeader'
import StatCard from '@/components/common/StatCard'
import StatusBadge from '@/components/common/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { useDashboard } from '@/hooks/useDashboard'
import type { CapacityItem } from '@/services/dashboard.service'

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-7 w-14 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

function CapacityBar({ item }: { item: CapacityItem }) {
  const isSoldOut = item.percentage >= 100
  const isWarning = item.percentage >= 80 && item.percentage < 100

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-white p-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-900 truncate">
            {item.menuItemName}
          </span>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-xs text-gray-500">
              {item.currentOrders} / {item.dailyCap}
            </span>
            {isSoldOut && <StatusBadge status="sold_out" />}
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className={cn(
              'h-2 rounded-full transition-all',
              isSoldOut
                ? 'bg-red-500'
                : isWarning
                  ? 'bg-amber-400'
                  : 'bg-green-400',
            )}
            style={{ width: `${Math.min(item.percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  useEffect(() => {
    document.title = 'Dashboard — Catering Admin'
  }, [])

  const { data, isLoading } = useDashboard()

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Today's overview" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Today's Orders"
              value={data?.stats.todayOrderCount ?? 0}
              icon={ShoppingCart}
              iconColor="text-primary-600"
              iconBg="bg-primary-100"
            />
            <StatCard
              label="Today's Revenue"
              value={formatCurrency(data?.stats.todayRevenue ?? 0)}
              icon={DollarSign}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-100"
            />
            <StatCard
              label="Pending Requests"
              value={data?.stats.pendingRequestCount ?? 0}
              icon={PackageX}
              iconColor="text-amber-600"
              iconBg="bg-amber-100"
              alert={(data?.stats.pendingRequestCount ?? 0) > 0}
              subLabel="not-delivered requests awaiting review"
            />
          </>
        )}
      </div>

      {/* Cutoff Status */}
      <div className="mt-6 flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
        <Clock className="h-5 w-5 text-gray-400" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">
            Daily cutoff: <span className="font-medium">{data?.stats.cutoffTime ?? '—'}</span>
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
              data?.stats.isCutoffPassed
                ? 'bg-red-50 text-red-700 animate-pulse-slow'
                : 'bg-green-50 text-green-700',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                data?.stats.isCutoffPassed ? 'bg-red-500' : 'bg-green-500',
              )}
            />
            {data?.stats.isCutoffPassed ? 'Cutoff Passed' : 'Ordering Open'}
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders per Company */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Orders by Company
          </h2>
          {isLoading ? (
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <TableSkeleton />
            </div>
          ) : data?.companyOrders && data.companyOrders.length > 0 ? (
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Company
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.companyOrders.map((co) => (
                    <tr
                      key={co.companyId}
                      className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/companies/${co.companyId}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600"
                        >
                          {co.companyName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        {co.orderCount}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(co.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {data.companyOrders.reduce((s, c) => s + c.orderCount, 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(
                        data.companyOrders.reduce((s, c) => s + c.revenue, 0),
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <EmptyState
                title="No orders yet"
                description="Orders will appear here once placed."
              />
            </div>
          )}
        </div>

        {/* Capacity Alerts */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Capacity Alerts
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg border bg-gray-100"
                />
              ))}
            </div>
          ) : data?.capacityAlerts && data.capacityAlerts.length > 0 ? (
            <div className="space-y-3">
              {data.capacityAlerts.map((item) => (
                <CapacityBar key={item.menuItemId} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <EmptyState
                title="All items have capacity remaining"
                description="No menu items are near their daily cap."
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
