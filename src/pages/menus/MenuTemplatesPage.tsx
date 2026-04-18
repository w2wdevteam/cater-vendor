import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CalendarCheck, Save, Trash2, UtensilsCrossed, X } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useApplyTemplate,
  useMenuItems,
  useTemplate,
  useUpdateTemplate,
} from '@/hooks/useMenus'
import { cn, formatCurrency } from '@/lib/utils'
import type { TemplateItem, WeekDay } from '@/types/menu.types'

const DAY_LABELS: Record<WeekDay, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

const DAY_ORDER: WeekDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

function DayColumn({
  day,
  items,
  itemsById,
  onAdd,
  onRemove,
  onUpdateMaxOrders,
  availableIds,
}: {
  day: WeekDay
  items: TemplateItem[]
  itemsById: Map<string, { id: string; name: string; price: number; dailyCap?: number; imageUrl?: string }>
  onAdd: (day: WeekDay, id: string, maxOrders: number) => void
  onRemove: (day: WeekDay, id: string) => void
  onUpdateMaxOrders: (day: WeekDay, id: string, maxOrders: number) => void
  availableIds: string[]
}) {
  const [selected, setSelected] = useState('')
  const [maxOrders, setMaxOrders] = useState<number | ''>('')

  function handleSelect(id: string) {
    setSelected(id)
    const item = itemsById.get(id)
    setMaxOrders(item?.dailyCap ?? 50)
  }

  function handleAdd() {
    if (!selected) return
    onAdd(day, selected, maxOrders || 50)
    setSelected('')
    setMaxOrders('')
  }

  return (
    <div className="flex min-h-[260px] flex-col rounded-lg border bg-white shadow-sm">
      <div className="border-b px-3 py-2">
        <h3 className="text-sm font-semibold text-gray-900">
          {DAY_LABELS[day]}
        </h3>
        <p className="text-xs text-gray-500">{items.length} items</p>
      </div>
      <div className="flex-1 space-y-1.5 p-2">
        {items.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">
            No items assigned
          </p>
        ) : (
          items.map((ti) => {
            const item = itemsById.get(ti.menuItemId)
            if (!item) return null
            return (
              <div
                key={ti.menuItemId}
                className="flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-2 py-1.5"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-7 w-7 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-gray-200 text-gray-400">
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-xs font-medium text-gray-900">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-gray-500">Max:</span>
                    <input
                      type="number"
                      min={1}
                      value={ti.maxOrders}
                      onChange={(e) =>
                        onUpdateMaxOrders(day, ti.menuItemId, Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-12 rounded border border-gray-200 px-1 py-0 text-[11px] text-gray-700"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(day, ti.menuItemId)}
                  className="text-gray-400 hover:text-red-600"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>
      <div className="border-t p-2 space-y-2">
        <Select value={selected} onValueChange={handleSelect}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="+ Add item" />
          </SelectTrigger>
          <SelectContent>
            {availableIds.length === 0 ? (
              <div className="p-2 text-xs text-gray-500">
                All items are assigned.
              </div>
            ) : (
              availableIds.map((id) => {
                const item = itemsById.get(id)
                if (!item) return null
                return (
                  <SelectItem key={id} value={id}>
                    {item.name} — {formatCurrency(item.price)}
                  </SelectItem>
                )
              })
            )}
          </SelectContent>
        </Select>
        {selected && (
          <>
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Max orders</Label>
              <Input
                type="number"
                min={1}
                value={maxOrders}
                onChange={(e) => setMaxOrders(parseInt(e.target.value) || '')}
                className="h-7 w-20 text-xs"
              />
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={handleAdd}
            >
              Add
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function ApplyTemplateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [startDate, setStartDate] = useState('')
  const apply = useApplyTemplate()

  function handleApply() {
    if (!startDate) return
    apply.mutate(startDate, {
      onSuccess: () => {
        toast.success('Template applied to calendar')
        onOpenChange(false)
        setStartDate('')
      },
      onError: () => toast.error('Failed to apply template'),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply template</DialogTitle>
          <DialogDescription>
            Auto-populate the calendar for 2 weeks starting from the date you
            select. Existing assignments on those days will be replaced.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Start date</Label>
          <DatePicker
            value={startDate}
            onChange={(v) => setStartDate(v)}
            placeholder="Select start date"
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={apply.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!startDate || apply.isPending}
          >
            {apply.isPending ? 'Applying…' : 'Apply template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function MenuTemplatesPage() {
  const { data: template, isLoading } = useTemplate()
  const { data: menuItems } = useMenuItems({ status: 'active' })
  const updateTemplate = useUpdateTemplate()
  const [draft, setDraft] = useState<Record<WeekDay, TemplateItem[]> | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)

  useEffect(() => {
    document.title = 'Menu Templates — Catering Admin'
  }, [])

  useEffect(() => {
    if (template) {
      setDraft(JSON.parse(JSON.stringify(template.days)))
    }
  }, [template])

  const itemsById = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; price: number; dailyCap?: number; imageUrl?: string }
    >()
    for (const item of menuItems ?? []) {
      map.set(item.id, {
        id: item.id,
        name: item.name,
        price: item.price,
        dailyCap: item.dailyCap,
        imageUrl: item.imageUrl,
      })
    }
    return map
  }, [menuItems])

  const isDirty = useMemo(() => {
    if (!template || !draft) return false
    return JSON.stringify(template.days) !== JSON.stringify(draft)
  }, [template, draft])

  function handleAdd(day: WeekDay, id: string, maxOrders: number) {
    setDraft((d) => {
      if (!d) return d
      if (d[day].some((ti) => ti.menuItemId === id)) return d
      return { ...d, [day]: [...d[day], { menuItemId: id, maxOrders }] }
    })
  }

  function handleRemove(day: WeekDay, id: string) {
    setDraft((d) => {
      if (!d) return d
      return { ...d, [day]: d[day].filter((ti) => ti.menuItemId !== id) }
    })
  }

  function handleUpdateMaxOrders(day: WeekDay, id: string, maxOrders: number) {
    setDraft((d) => {
      if (!d) return d
      return {
        ...d,
        [day]: d[day].map((ti) =>
          ti.menuItemId === id ? { ...ti, maxOrders } : ti,
        ),
      }
    })
  }

  function handleClearDay(day: WeekDay) {
    setDraft((d) => (d ? { ...d, [day]: [] } : d))
  }

  function handleSave() {
    if (!draft) return
    updateTemplate.mutate(draft, {
      onSuccess: () => toast.success('Template saved'),
      onError: () => toast.error('Failed to save template'),
    })
  }

  function handleReset() {
    if (template) setDraft(JSON.parse(JSON.stringify(template.days)))
  }

  if (isLoading || !draft) {
    return (
      <>
        <PageHeader
          title="Weekly Template"
          subtitle="Set a recurring 7-day rotation you can apply to the calendar."
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg border bg-gray-100"
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Weekly Template"
        subtitle="Set a recurring 7-day rotation you can apply to the calendar."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setApplyOpen(true)}>
              <CalendarCheck className="h-4 w-4" />
              Apply template
            </Button>
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={!isDirty || updateTemplate.isPending}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isDirty || updateTemplate.isPending}
            >
              <Save className="h-4 w-4" />
              {updateTemplate.isPending ? 'Saving…' : 'Save template'}
            </Button>
          </div>
        }
      />

      <div
        className={cn(
          'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7',
        )}
      >
        {DAY_ORDER.map((day) => {
          const usedIds = new Set(draft[day].map((ti) => ti.menuItemId))
          const availableIds = Array.from(itemsById.keys()).filter(
            (id) => !usedIds.has(id),
          )
          return (
            <div key={day} className="relative">
              <DayColumn
                day={day}
                items={draft[day]}
                itemsById={itemsById}
                onAdd={handleAdd}
                onRemove={handleRemove}
                onUpdateMaxOrders={handleUpdateMaxOrders}
                availableIds={availableIds}
              />
              {draft[day].length > 0 && (
                <button
                  type="button"
                  onClick={() => handleClearDay(day)}
                  className="absolute right-3 top-2 text-gray-400 hover:text-red-600"
                  aria-label={`Clear ${DAY_LABELS[day]}`}
                  title={`Clear ${DAY_LABELS[day]}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <ApplyTemplateDialog open={applyOpen} onOpenChange={setApplyOpen} />
    </>
  )
}
