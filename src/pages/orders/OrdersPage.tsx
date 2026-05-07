import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useDeleteMyOrder,
  useIncomingOrders,
  useMyOrders,
  useRejectIncoming,
  useRejectMyOrder,
} from '@/hooks/useOrders'
import { getApiErrorMessage } from '@/lib/api-errors'
import IncomingOrdersTable from './_components/IncomingOrdersTable'
import MyOrdersTable, { classifyOrder } from './_components/MyOrdersTable'
import type { IncomingAggregatedRow } from '@/api/endpoints/orders.api'

type Tab = 'incoming' | 'mine'
type MyTypeFilter = 'all' | 'company' | 'client'

const TAB_VALUES: Tab[] = ['incoming', 'mine']

function todayKey(): string {
  // Use the browser's local timezone — matches what reports pages do.
  return format(new Date(), 'yyyy-MM-dd')
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as Tab | null
  const tab: Tab = TAB_VALUES.includes(tabParam as Tab) ? (tabParam as Tab) : 'mine'

  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<string>(todayKey())
  const [myTypeFilter, setMyTypeFilter] = useState<MyTypeFilter>('all')
  const debouncedSearch = useDebounce(search, 300)
  const q = debouncedSearch.trim()

  const incomingQuery = useIncomingOrders({ date: dateFilter, q: q || undefined })
  const mineQuery = useMyOrders({
    date: dateFilter,
    type: myTypeFilter,
    q: q || undefined,
    limit: 100,
  })

  const rejectIncomingMutation = useRejectIncoming()
  const rejectMineMutation = useRejectMyOrder()
  const deleteMineMutation = useDeleteMyOrder()

  const [rejectIncomingTarget, setRejectIncomingTarget] = useState<IncomingAggregatedRow | null>(null)
  const [rejectMineId, setRejectMineId] = useState<string | null>(null)
  const [deleteMineId, setDeleteMineId] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Orders — Catering Admin'
  }, [])

  const incomingRows = incomingQuery.data?.rows ?? []
  const totalActiveQty = incomingQuery.data?.totalActiveQty ?? 0
  const mineOrders = mineQuery.data?.data ?? []

  // Tab badge for "My Orders" reflects ALL types for the current date — independent
  // of the chip filter (so the user can see counts even when narrowed to one type).
  const allMineQuery = useMyOrders({ date: dateFilter, type: 'all', limit: 100 })
  const allMineForCount = allMineQuery.data?.data ?? []
  const mineTotalCount = allMineForCount.length
  const mineTypeCounts = useMemo(() => {
    const counts = { company: 0, client: 0, all: allMineForCount.length }
    for (const o of allMineForCount) {
      const t = classifyOrder(o)
      counts[t]++
    }
    return counts
  }, [allMineForCount])

  const isToday = dateFilter === todayKey()
  const filtersActive =
    !!q || !isToday || (tab === 'mine' && myTypeFilter !== 'all')

  function setTab(next: Tab) {
    const params = new URLSearchParams(searchParams)
    params.set('tab', next)
    setSearchParams(params, { replace: true })
  }

  async function handleRejectIncoming() {
    const target = rejectIncomingTarget
    if (!target) return
    try {
      const result = await rejectIncomingMutation.mutateAsync({
        date: target.date,
        companyId: target.companyId,
        menuItemId: target.menuItemId,
      })
      toast.success(
        result.rejectedCount > 0
          ? `${result.rejectedCount} order${result.rejectedCount === 1 ? '' : 's'} rejected — employees will be notified`
          : 'Nothing to reject — all orders already delivered or rejected',
      )
      setRejectIncomingTarget(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to reject orders'))
    }
  }

  async function handleRejectMine() {
    if (!rejectMineId) return
    try {
      await rejectMineMutation.mutateAsync({ id: rejectMineId })
      toast.success('Order rejected')
      setRejectMineId(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to reject order'))
    }
  }

  async function handleDeleteMine() {
    if (!deleteMineId) return
    try {
      await deleteMineMutation.mutateAsync(deleteMineId)
      toast.success('Order deleted')
      setDeleteMineId(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete order'))
    }
  }

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Track incoming customer orders (aggregated by company × menu) and manage the bulk orders you place."
        action={
          tab === 'mine' ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/orders/create')}>
                <Building2 className="h-4 w-4" />
                Order for Company
              </Button>
              <Button onClick={() => navigate('/orders/create-client')}>
                <UserPlus className="h-4 w-4" />
                Order for Client
              </Button>
            </div>
          ) : null
        }
      />

      <div className="flex flex-col gap-4">
        <nav className="flex items-center gap-6 border-b border-gray-200">
          <TabButton
            label="Incoming"
            count={totalActiveQty}
            active={tab === 'incoming'}
            onClick={() => setTab('incoming')}
          />
          <TabButton
            label="My Orders"
            count={mineTotalCount}
            active={tab === 'mine'}
            onClick={() => setTab('mine')}
          />
        </nav>

        {tab === 'incoming' ? (
          <div className="space-y-4">
            <FilterBar
              search={search}
              setSearch={setSearch}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              placeholder="Search by company or menu item"
            />
            <IncomingOrdersTable
              rows={incomingRows}
              filtersActive={filtersActive}
              loading={incomingQuery.isLoading}
              onReject={(row) => setRejectIncomingTarget(row)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              {(['all', 'company', 'client'] as MyTypeFilter[]).map((v) => {
                const count = mineTypeCounts[v]
                const label = v === 'all' ? 'All' : v === 'company' ? 'For Companies' : 'For Clients'
                const active = myTypeFilter === v
                return (
                  <button
                    key={v}
                    onClick={() => setMyTypeFilter(v)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      active
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {label}
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-px text-[10px] font-semibold',
                        active ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500',
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
            <FilterBar
              search={search}
              setSearch={setSearch}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              placeholder="Search by company, client, or menu item"
            />
            <MyOrdersTable
              orders={mineOrders}
              filtersActive={filtersActive}
              loading={mineQuery.isLoading}
              onReject={(id) => setRejectMineId(id)}
              onDelete={(id) => setDeleteMineId(id)}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!rejectIncomingTarget}
        onOpenChange={(o) => { if (!o) setRejectIncomingTarget(null) }}
        title="Reject all orders"
        description={
          rejectIncomingTarget
            ? `Reject every non-delivered ${rejectIncomingTarget.menuItemName} order for ${rejectIncomingTarget.companyName}. Each affected employee will be notified.`
            : ''
        }
        confirmLabel="Reject all"
        destructive
        loading={rejectIncomingMutation.isPending}
        onConfirm={handleRejectIncoming}
      />
      <ConfirmDialog
        open={!!rejectMineId}
        onOpenChange={(o) => { if (!o) setRejectMineId(null) }}
        title="Reject Order"
        description="Mark this order as rejected. The customer will be notified."
        confirmLabel="Reject"
        destructive
        loading={rejectMineMutation.isPending}
        onConfirm={handleRejectMine}
      />
      <ConfirmDialog
        open={!!deleteMineId}
        onOpenChange={(o) => { if (!o) setDeleteMineId(null) }}
        title="Delete Order"
        description="This permanently removes the order from your records. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteMineMutation.isPending}
        onConfirm={handleDeleteMine}
      />
    </>
  )
}

function FilterBar({
  search,
  setSearch,
  dateFilter,
  setDateFilter,
  placeholder,
}: {
  search: string
  setSearch: (v: string) => void
  dateFilter: string
  setDateFilter: (v: string) => void
  placeholder: string
}) {
  const isToday = dateFilter === todayKey()
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-[280px]"
      />
      <div className="flex items-center gap-1">
        <DatePicker
          value={dateFilter}
          onChange={(v) => setDateFilter(v || todayKey())}
          placeholder="Pick a date"
          className="w-[180px]"
        />
        {!isToday && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDateFilter(todayKey())}
            title="Reset to today"
          >
            Today
          </Button>
        )}
      </div>
    </div>
  )
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-sm font-medium transition-colors -mb-px',
        active
          ? 'border-primary-600 text-primary-700'
          : 'border-transparent text-gray-500 hover:text-gray-900',
      )}
    >
      {label}
      <span
        className={cn(
          'inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums',
          active
            ? 'bg-primary-100 text-primary-700'
            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200',
        )}
      >
        {count}
      </span>
    </button>
  )
}
