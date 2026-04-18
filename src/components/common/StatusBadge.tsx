import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  new: 'bg-status-new-bg text-status-new-text',
  active: 'bg-status-active-bg text-status-active-text',
  approved: 'bg-status-approved-bg text-status-approved-text',
  pending: 'bg-status-pending-bg text-status-pending-text',
  rejected: 'bg-status-rejected-bg text-status-rejected-text',
  not_delivered: 'bg-status-not-delivered-bg text-status-not-delivered-text',
  inactive: 'bg-status-inactive-bg text-status-inactive-text',
  sold_out: 'bg-status-sold-out-bg text-status-sold-out-text',
  on_the_way: 'bg-blue-50 text-blue-700',
  arrived: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
}

const statusLabels: Record<string, string> = {
  new: 'New',
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  not_delivered: 'Not Delivered',
  sold_out: 'Sold Out',
  on_the_way: 'On the Way',
  arrived: 'Arrived',
  delivered: 'Delivered',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        statusStyles[status] ?? 'bg-gray-100 text-gray-600',
        className,
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  )
}
