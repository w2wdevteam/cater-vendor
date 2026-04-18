import { NavLink, Outlet } from 'react-router-dom'
import {
  Building2,
  MapPin,
  UtensilsCrossed,
  TrendingUp,
  CalendarCheck,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'By Company', path: '/reports/by-company', icon: Building2 },
  { label: 'By Location', path: '/reports/by-location', icon: MapPin },
  { label: 'By Menu', path: '/reports/by-menu', icon: UtensilsCrossed },
  { label: 'Revenue', path: '/reports/revenue', icon: TrendingUp },
  { label: 'Monthly', path: '/reports/monthly', icon: CalendarCheck },
  { label: 'Invoice', path: '/reports/invoice', icon: FileText },
]

export default function ReportsLayout() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate and export reports for operations, billing, and analytics.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 rounded-lg border bg-white p-1 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                )
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </NavLink>
          )
        })}
      </div>

      <Outlet />
    </div>
  )
}
