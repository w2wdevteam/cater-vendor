import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/ui.store'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex h-full bg-gray-50">
      <Sidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-[margin] duration-200',
          collapsed ? 'ml-16' : 'ml-64',
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
