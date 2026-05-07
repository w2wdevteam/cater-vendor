import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Clock,
  UtensilsCrossed,
  CalendarRange,
  LayoutTemplate,
  ShoppingCart,
  ChefHat,
  Building2,
  DollarSign,
  PackageX,
  CreditCard,
  Shield,
  UserPlus,
  CalendarDays,
  CalendarCheck,
  TrendingUp,
  FileText,
  MapPin,
  Settings,
  ClipboardList,
  UserRound,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { useMyCatering } from '@/hooks/useMyCatering'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navigation: (NavItem | NavGroup)[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    title: 'Operations',
    items: [
      { label: 'Delivery Config', path: '/delivery-config', icon: Clock },
      { label: 'Menus', path: '/menus', icon: UtensilsCrossed },
      { label: 'Menu Calendar', path: '/menus/calendar', icon: CalendarRange },
      { label: 'Menu Templates', path: '/menus/templates', icon: LayoutTemplate },
      { label: 'Orders', path: '/orders', icon: ShoppingCart },
      { label: 'Kitchen Prep', path: '/orders/kitchen-prep', icon: ChefHat },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'By Company', path: '/reports/by-company', icon: CalendarDays },
      { label: 'By Location', path: '/reports/by-location', icon: MapPin },
      { label: 'By Menu', path: '/reports/by-menu', icon: UtensilsCrossed },
      { label: 'Revenue', path: '/reports/revenue', icon: TrendingUp },
      { label: 'Monthly', path: '/reports/monthly', icon: CalendarCheck },
      // { label: 'Invoice', path: '/reports/invoice', icon: FileText },
    ],
  },
  {
    title: 'Clients',
    items: [
      { label: 'Companies', path: '/companies', icon: Building2 },
      { label: 'Clients', path: '/clients', icon: UserRound },
      { label: 'Locations', path: '/locations', icon: MapPin },
      // { label: 'Pricing', path: '/pricing', icon: DollarSign },
      { label: 'Payments', path: '/payments', icon: CreditCard },
      { label: 'Not Delivered', path: '/not-delivered', icon: PackageX },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', path: '/settings', icon: Settings },
      { label: 'Admins', path: '/settings/admins', icon: Shield },
      { label: 'Audit Log', path: '/settings/audit-log', icon: ClipboardList },
    ],
  },
]

function isGroup(item: NavItem | NavGroup): item is NavGroup {
  return 'items' in item
}

export default function Sidebar() {
  const location = useLocation()
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggle = useUiStore((s) => s.toggleSidebar)
  const profileCateringName = useAuthStore((s) => s.user?.cateringName ?? 'Catering')
  const { data: catering } = useMyCatering()
  const cateringName = catering?.name ?? profileCateringName
  const logoUrl = catering?.logoUrl ?? null

  function isActive(path: string) {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    if (path === '/orders/kitchen-prep') return location.pathname === '/orders/kitchen-prep'
    if (path === '/orders') {
      return (
        location.pathname === '/orders' ||
        location.pathname === '/orders/create' ||
        location.pathname === '/orders/create-client'
      )
    }
    if (path === '/menus/calendar') return location.pathname === '/menus/calendar'
    if (path === '/menus/templates') return location.pathname === '/menus/templates'
    if (path === '/menus') return location.pathname === '/menus' || location.pathname === '/menus/create' || location.pathname.startsWith('/menus/') && location.pathname.endsWith('/edit')
    if (path === '/settings') return location.pathname === '/settings'
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-white transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center border-b px-4',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={cateringName}
            className="h-8 w-8 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="h-4 w-4" />
          </div>
        )}
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-gray-900">
            {cateringName}
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navigation.map((item, i) => {
          if (isGroup(item)) {
            return (
              <div key={item.title} className={cn(i > 0 && 'mt-4')}>
                {!collapsed && (
                  <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {item.title}
                  </p>
                )}
                {collapsed && i > 0 && (
                  <div className="mx-3 mb-2 border-t" />
                )}
                <div className="space-y-0.5">
                  {item.items.map((nav) => (
                    <SidebarLink
                      key={nav.path}
                      item={nav}
                      active={isActive(nav.path)}
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              </div>
            )
          }
          return (
            <SidebarLink
              key={item.path}
              item={item}
              active={isActive(item.path)}
              collapsed={collapsed}
            />
          )
        })}
      </nav>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full', collapsed ? 'justify-center' : 'justify-start')}
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="ml-2 text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}

function SidebarLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-0',
        active
          ? 'bg-primary-50 text-primary-600'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      <Icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-primary-600')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}
