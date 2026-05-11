import { useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { toast } from 'sonner'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  CopyPlus,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useAddAssignment,
  useCopyDay,
  useCopyWeek,
  useDayAssignments,
  useMenuItems,
  useMonthAssignments,
  useRemoveAssignment,
  useUpdateAssignmentMaxOrders,
} from '@/hooks/useMenus'
import { Input } from '@/components/ui/input'
import { cn, formatCurrency } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api-errors'
import type { DayAssignment } from '@/types/menu.types'

type DayAssignmentItem = DayAssignment['items'][number]

function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function AssignmentRow({
  item,
  onRemove,
  removing,
}: {
  item: DayAssignmentItem
  onRemove: (assignmentId: string) => void
  removing: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<number | ''>(item.maxOrders)
  const update = useUpdateAssignmentMaxOrders()

  // Floor: cannot drop the cap below the count of orders already placed.
  // Backend also requires maxOrders >= 1, so clamp accordingly.
  // Server is the final guard; this just prevents an obvious bad submit.
  const floor = Math.max(1, item.currentOrders)

  function handleSave() {
    if (draft === '' || typeof draft !== 'number') return
    if (draft === item.maxOrders) {
      setEditing(false)
      return
    }
    if (draft < floor) {
      toast.error(
        item.currentOrders > 0
          ? `Cap cannot be below ${item.currentOrders} (orders already placed)`
          : 'Cap must be at least 1',
      )
      return
    }
    update.mutate(
      { assignmentId: item.assignmentId, maxOrders: draft },
      {
        onSuccess: () => {
          toast.success('Cap updated')
          setEditing(false)
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to update cap')),
      },
    )
  }

  function handleCancel() {
    setDraft(item.maxOrders)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm">
      {item.menuItem.imageUrl ? (
        <img
          src={item.menuItem.imageUrl}
          alt={item.menuItem.name}
          className="h-12 w-12 rounded object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-gray-400">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {item.menuItem.name}
          </p>
          {item.isSoldOut && <StatusBadge status="sold_out" />}
        </div>
        {editing ? (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {item.currentOrders} ordered · cap
            </span>
            <Input
              type="number"
              min={floor}
              value={draft}
              onChange={(e) => {
                const n = parseInt(e.target.value)
                setDraft(Number.isNaN(n) ? '' : n)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
              className="h-7 w-20 text-xs"
              autoFocus
              aria-label="Max orders"
            />
            {item.currentOrders > 0 && (
              <span className="text-[11px] text-gray-400">
                min {item.currentOrders}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            {formatCurrency(item.menuItem.price)}
            <span className="ml-2">
              · {item.currentOrders}/{item.maxOrders} orders
            </span>
          </p>
        )}
      </div>
      {editing ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={update.isPending}
            aria-label="Save cap"
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={update.isPending}
            aria-label="Cancel"
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(item.maxOrders)
              setEditing(true)
            }}
            aria-label={`Edit cap for ${item.menuItem.name}`}
          >
            <Pencil className="h-4 w-4 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.assignmentId)}
            disabled={removing}
            aria-label={`Remove ${item.menuItem.name}`}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )}
    </div>
  )
}

function DayDetailSheet({
  open,
  onOpenChange,
  date,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string | null
}) {
  const { data: day, isLoading } = useDayAssignments(date)
  const { data: allItems } = useMenuItems({ status: 'active' })
  const add = useAddAssignment()
  const remove = useRemoveAssignment()
  const [adding, setAdding] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [maxOrders, setMaxOrders] = useState<number | ''>('')

  const availableItems = useMemo(() => {
    if (!allItems) return []
    const existing = new Set(day?.items.map((i) => i.menuItem.id) ?? [])
    return allItems.filter((m) => !existing.has(m.id))
  }, [allItems, day])

  const selectedItem = allItems?.find((m) => m.id === selectedId)

  function handleSelectItem(id: string) {
    setSelectedId(id)
    const item = allItems?.find((m) => m.id === id)
    setMaxOrders(item?.dailyCap ?? 50)
  }

  function handleAdd() {
    if (!date || !selectedId) return
    add.mutate(
      { date, menuItemId: selectedId, maxOrders: maxOrders || undefined },
      {
        onSuccess: () => {
          toast.success('Item added to day')
          setSelectedId('')
          setMaxOrders('')
          setAdding(false)
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to add item')),
      },
    )
  }

  function handleRemove(assignmentId: string) {
    remove.mutate(assignmentId, {
      onSuccess: () => toast.success('Item removed'),
      onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to remove item')),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {date ? format(new Date(date), 'EEEE, MMM d, yyyy') : ''}
          </SheetTitle>
          <SheetDescription>
            Menu items assigned for this day.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg border bg-gray-50"
              />
            ))
          ) : day && day.items.length > 0 ? (
            day.items.map((item) => (
              <AssignmentRow
                key={item.assignmentId}
                item={item}
                onRemove={handleRemove}
                removing={remove.isPending}
              />
            ))
          ) : (
            <EmptyState
              icon={<UtensilsCrossed className="h-10 w-10" />}
              title="No items assigned"
              description="Add menu items to this day below."
            />
          )}
        </div>

        <div className="mt-4 border-t pt-4">
          {adding ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Select menu item</Label>
                <Select value={selectedId} onValueChange={handleSelectItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.length === 0 ? (
                      <div className="p-2 text-xs text-gray-500">
                        All active items are already assigned.
                      </div>
                    ) : (
                      availableItems.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} — {formatCurrency(m.price)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedId && (
                <div className="space-y-1.5">
                  <Label htmlFor="maxOrders">Max orders</Label>
                  <Input
                    id="maxOrders"
                    type="number"
                    min={1}
                    value={maxOrders}
                    onChange={(e) => setMaxOrders(parseInt(e.target.value) || '')}
                    className="w-32"
                  />
                  {selectedItem?.dailyCap && (
                    <p className="text-xs text-gray-500">
                      Default daily cap: {selectedItem.dailyCap}
                    </p>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAdding(false)
                    setSelectedId('')
                    setMaxOrders('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!selectedId || add.isPending}
                >
                  Add item
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setAdding(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function CopyDayDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')
  const copy = useCopyDay()

  function handleCopy() {
    if (!source || !target) return
    copy.mutate(
      { sourceDate: source, targetDate: target },
      {
        onSuccess: () => {
          toast.success('Day copied')
          onOpenChange(false)
          setSource('')
          setTarget('')
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to copy day')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Copy a day</DialogTitle>
          <DialogDescription>
            Copy all assignments from one day to another. Existing assignments
            on the target date will be replaced.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Source date</Label>
            <DatePicker
              value={source}
              onChange={(v) => setSource(v)}
              placeholder="Select source date"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Target date</Label>
            <DatePicker
              value={target}
              onChange={(v) => setTarget(v)}
              placeholder="Select target date"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={copy.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!source || !target || copy.isPending}
          >
            Copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CopyWeekDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')
  const copy = useCopyWeek()

  function handleCopy() {
    if (!source || !target) return
    copy.mutate(
      { sourceWeekStart: source, targetWeekStart: target },
      {
        onSuccess: () => {
          toast.success('Week copied')
          onOpenChange(false)
          setSource('')
          setTarget('')
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to copy week')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Copy a week</DialogTitle>
          <DialogDescription>
            Copy a full Monday–Sunday block. Both dates must be Mondays;
            other days are disabled. Existing assignments in the target week
            will be replaced.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Source week (Monday)</Label>
            <DatePicker
              value={source}
              onChange={(v) => setSource(v)}
              placeholder="Select source Monday"
              disabled={(date) => date.getDay() !== 1}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Target week (Monday)</Label>
            <DatePicker
              value={target}
              onChange={(v) => setTarget(v)}
              placeholder="Select target Monday"
              disabled={(date) => date.getDay() !== 1}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={copy.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!source || !target || copy.isPending}
          >
            Copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function MenuCalendarPage() {
  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [copyDayOpen, setCopyDayOpen] = useState(false)
  const [copyWeekOpen, setCopyWeekOpen] = useState(false)

  useEffect(() => {
    document.title = 'Menu Calendar — Catering Admin'
  }, [])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const { data: monthData, isLoading } = useMonthAssignments(year, month)

  const byDate = useMemo(() => {
    const map = new Map<string, DayAssignment>()
    for (const d of monthData ?? []) {
      map.set(d.date, d)
    }
    return map
  }, [monthData])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    const list: Date[] = []
    let d = start
    while (d <= end) {
      list.push(d)
      d = new Date(d)
      d.setDate(d.getDate() + 1)
    }
    return list
  }, [cursor])

  const today = new Date()

  return (
    <>
      <PageHeader
        title="Menu Calendar"
        subtitle="Assign menu items to specific dates."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCopyDayOpen(true)}>
              <Copy className="h-4 w-4" />
              Copy Day
            </Button>
            <Button variant="outline" onClick={() => setCopyWeekOpen(true)}>
              <CopyPlus className="h-4 w-4" />
              Copy Week
            </Button>
          </div>
        }
      />

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCursor(subMonths(cursor, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="min-w-[140px] text-center text-base font-semibold text-gray-900">
              {format(cursor, 'MMMM yyyy')}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCursor(addMonths(cursor, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="grid grid-cols-7 border-b bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="px-2 py-2 text-center">
              {d}
            </div>
          ))}
        </div>

        <div className={cn('grid grid-cols-7', isLoading && 'opacity-60')}>
          {days.map((d) => {
            const key = toDateKey(d)
            const inMonth = isSameMonth(d, cursor)
            const isToday = isSameDay(d, today)
            const assignment = byDate.get(key)
            const items = assignment?.items ?? []
            const visible = items.slice(0, 3)
            const overflow = items.length - visible.length

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(key)}
                className={cn(
                  'flex min-h-[110px] flex-col items-start gap-1 border-b border-r p-2 text-left transition-colors hover:bg-gray-50',
                  !inMonth && 'bg-gray-50/60 text-gray-400',
                  isToday && 'bg-primary-50/60',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                    isToday
                      ? 'bg-primary-600 text-white'
                      : inMonth
                        ? 'text-gray-900'
                        : 'text-gray-400',
                  )}
                >
                  {d.getDate()}
                </span>
                <div className="flex w-full flex-col gap-1">
                  {visible.map((it) => (
                    <div
                      key={it.assignmentId}
                      className={cn(
                        'flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[11px]',
                        it.isSoldOut
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-primary-100 bg-primary-50 text-primary-700',
                      )}
                    >
                      <span className="truncate">{it.menuItem.name}</span>
                    </div>
                  ))}
                  {overflow > 0 && (
                    <span className="text-[11px] text-gray-500">
                      +{overflow} more
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <DayDetailSheet
        open={!!selectedDate}
        onOpenChange={(open) => !open && setSelectedDate(null)}
        date={selectedDate}
      />
      <CopyDayDialog open={copyDayOpen} onOpenChange={setCopyDayOpen} />
      <CopyWeekDialog open={copyWeekOpen} onOpenChange={setCopyWeekOpen} />
    </>
  )
}
