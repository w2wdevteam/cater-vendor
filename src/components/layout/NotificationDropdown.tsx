import { useState } from 'react'
import { Bell, PackageX, AlertTriangle, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  message: string
  time: string
  read: boolean
  type: 'not-delivered' | 'sold-out'
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    message: 'Acme Corp submitted a not-delivered request (5 orders)',
    time: '5 min ago',
    read: false,
    type: 'not-delivered',
  },
  {
    id: '2',
    message: 'Chicken Rice reached daily cap — sold out',
    time: '20 min ago',
    read: false,
    type: 'sold-out',
  },
  {
    id: '3',
    message: 'GlobalTech submitted a not-delivered request (2 orders)',
    time: '1 hour ago',
    read: true,
    type: 'not-delivered',
  },
]

const iconMap = {
  'not-delivered': PackageX,
  'sold-out': AlertTriangle,
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold text-gray-900">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">
                    No new notifications
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.type]
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 border-b px-4 py-3 last:border-0',
                        !n.read && 'bg-primary-50/50',
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          n.type === 'sold-out'
                            ? 'bg-amber-100'
                            : 'bg-gray-100',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-3.5 w-3.5',
                            n.type === 'sold-out'
                              ? 'text-amber-600'
                              : 'text-gray-500',
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{n.message}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{n.time}</p>
                      </div>
                      {!n.read && (
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-600" />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
