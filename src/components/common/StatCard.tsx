import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  subLabel?: string
  iconColor?: string
  iconBg?: string
  alert?: boolean
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  subLabel,
  iconColor = 'text-primary-600',
  iconBg = 'bg-primary-100',
  alert = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-5 shadow-sm',
        alert && 'border-amber-300',
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            iconBg,
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subLabel && (
            <p className="mt-0.5 text-xs text-gray-400">{subLabel}</p>
          )}
        </div>
      </div>
    </div>
  )
}
