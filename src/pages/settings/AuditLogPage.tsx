import { useEffect, useState } from 'react'
import { ClipboardList, ChevronLeft, ChevronRight, X } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useAuditLog } from '@/hooks/useAuditLog'
import { AUDIT_ACTION_TYPES } from '@/services/audit-log.service'
import { formatDateTime } from '@/lib/utils'
import type { AuditLogFilters } from '@/types/audit-log.types'

export default function AuditLogPage() {
  useEffect(() => {
    document.title = 'Audit Log — Catering Admin'
  }, [])

  const [filters, setFilters] = useState<AuditLogFilters>({ limit: 20 })
  const { data, isLoading } = useAuditLog(filters)

  const hasActiveFilters = !!(filters.from || filters.to || filters.actionType)
  const totalPages = data ? Math.ceil(data.total / data.limit) : 0
  const currentPage = data?.page ?? 1

  function clearFilters() {
    setFilters({ limit: 20 })
  }

  return (
    <>
      <PageHeader title="Audit Log" subtitle="View all admin actions performed on the platform." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <DatePicker
          value={filters.from}
          onChange={(v) => setFilters((f) => ({ ...f, from: v || undefined, page: 1 }))}
          placeholder="From date"
          className="w-44"
        />
        <DatePicker
          value={filters.to}
          onChange={(v) => setFilters((f) => ({ ...f, to: v || undefined, page: 1 }))}
          placeholder="To date"
          className="w-44"
        />
        <Select
          value={filters.actionType ?? '_all'}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, actionType: v === '_all' ? undefined : v, page: 1 }))
          }
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Actions</SelectItem>
            {AUDIT_ACTION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="rounded-lg border bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Target Record</th>
                <th className="px-6 py-3">Performed By</th>
                <th className="px-6 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.data.map((entry) => (
                <tr key={entry.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{entry.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{entry.targetRecord}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{entry.performedBy}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{formatDateTime(entry.timestamp)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-3">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({data.total} entries)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: currentPage - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setFilters((f) => ({ ...f, page: currentPage + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-white py-8 shadow-sm">
          <EmptyState
            icon={<ClipboardList className="h-12 w-12" />}
            title="No actions recorded"
            description={hasActiveFilters ? 'No actions match the current filters.' : 'No admin actions have been recorded yet.'}
          />
        </div>
      )}
    </>
  )
}
