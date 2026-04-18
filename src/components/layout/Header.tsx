import { useLocation } from 'react-router-dom'
import { ChevronRight, LogOut, User, ShoppingCart, Truck, PackageCheck } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useCutoffTime } from '@/hooks/useDeliveryConfig'
import { Button } from '@/components/ui/button'
import type { DeliveryStatus } from '@/types/delivery-config.types'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/delivery-config': 'Delivery Config',
  '/menus': 'Menus',
  '/menus/create': 'Create Menu Item',
  '/menus/calendar': 'Menu Calendar',
  '/menus/templates': 'Menu Templates',
  '/orders': 'Orders',
  '/orders/create': 'Place Order',
  '/orders/kitchen-prep': 'Kitchen Prep',
  '/companies': 'Companies',
  '/locations': 'Locations',
  '/pricing': 'Pricing',
  '/not-delivered': 'Not Delivered Requests',
  '/reports/by-company': 'By Company',
  '/reports/by-location': 'By Location',
  '/reports/by-menu': 'By Menu',
  '/reports/revenue': 'Revenue',
  '/reports/monthly': 'Monthly Report',
  '/reports/invoice': 'Invoice',
  '/settings': 'Settings',
  '/settings/audit-log': 'Audit Log',
}

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; path: string }[] = []

  if (routeLabels[pathname]) {
    const segments = pathname.split('/').filter(Boolean)
    let built = ''
    for (const seg of segments) {
      built += '/' + seg
      const label = routeLabels[built]
      if (label) crumbs.push({ label, path: built })
    }
  }

  if (crumbs.length === 0) {
    crumbs.push({ label: 'Dashboard', path: '/dashboard' })
  }

  return crumbs
}

export default function Header() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const crumbs = getBreadcrumbs(location.pathname)
  const { data: cutoffData } = useCutoffTime()

  const deliveryStatus: DeliveryStatus = cutoffData?.deliveryStatus ?? 'ordering_open'

  const statusConfig: Record<DeliveryStatus, { label: string; icon: typeof ShoppingCart; bg: string; text: string; dot: string }> = {
    ordering_open: { label: 'Ordering Open', icon: ShoppingCart, bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    on_the_way: { label: 'On the Way', icon: Truck, bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    delivered: { label: 'Delivered', icon: PackageCheck, bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  }

  const status = statusConfig[deliveryStatus]
  const StatusIcon = status.icon

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-white px-6">
      <nav className="flex items-center gap-1 text-sm">
        {crumbs.map((c, i) => (
          <span key={c.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
            <span
              className={
                i === crumbs.length - 1
                  ? 'font-medium text-gray-900'
                  : 'text-gray-500'
              }
            >
              {c.label}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            status.bg,
            status.text,
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden text-sm font-medium text-gray-700 sm:inline-block">
              {user?.name ?? 'Admin'}
            </span>
          </Button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                <div className="border-b px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    logout()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
