import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, Trash2, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCompanies } from '@/hooks/useCompanies'
import { useLocations } from '@/hooks/useLocations'
import { useCreateOrder } from '@/hooks/useOrders'
import { useDayAssignments } from '@/hooks/useMenus'
import { formatCurrency } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api-errors'
import MenuItemCard from './MenuItemCard'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

// Cart item: a menu item queued for submission with its desired quantity.
interface CartItem {
  menuItemId: string
  quantity: number
}

export default function OrderCreatePage() {
  const navigate = useNavigate()
  const { data: companies } = useCompanies()
  const createMutation = useCreateOrder()

  const [companyId, setCompanyId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [date, setDate] = useState<string>(todayKey())
  const [cart, setCart] = useState<CartItem[]>([])
  const [submitting, setSubmitting] = useState(false)

  const { data: locations } = useLocations(companyId || undefined)
  const activeLocations = locations?.filter((l) => l.status === 'active') ?? []

  const { data: dayAssignments, isLoading: assignmentsLoading } = useDayAssignments(
    date || null,
  )
  const assignedItems = dayAssignments?.items ?? []

  // Lookup: menuItemId -> assignment (for prices, stock caps, etc.)
  const assignmentByItemId = useMemo(() => {
    const map = new Map<string, (typeof assignedItems)[number]>()
    assignedItems.forEach((a) => map.set(a.menuItem.id, a))
    return map
  }, [assignedItems])

  useEffect(() => {
    document.title = 'Place Order — Catering Admin'
  }, [])

  // Reset location whenever the company changes.
  useEffect(() => {
    setLocationId('')
  }, [companyId])

  // Auto-select the first active location as the default once locations load.
  useEffect(() => {
    if (!companyId || !locations || locationId) return
    const firstActive = locations.find((l) => l.status === 'active')
    if (firstActive) setLocationId(firstActive.id)
  }, [companyId, locations, locationId])

  // Reset the cart when the date changes — the set of assigned items changes.
  useEffect(() => {
    setCart([])
  }, [date])

  function setQuantity(menuItemId: string, quantity: number) {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((it) => it.menuItemId !== menuItemId)
      const existing = prev.find((it) => it.menuItemId === menuItemId)
      if (existing) {
        return prev.map((it) =>
          it.menuItemId === menuItemId ? { ...it, quantity } : it,
        )
      }
      return [...prev, { menuItemId, quantity }]
    })
  }

  function removeItem(menuItemId: string) {
    setCart((prev) => prev.filter((it) => it.menuItemId !== menuItemId))
  }

  const totalItems = cart.reduce((sum, it) => sum + it.quantity, 0)
  const totalAmount = cart.reduce((sum, it) => {
    const price = assignmentByItemId.get(it.menuItemId)?.menuItem.price ?? 0
    return sum + price * it.quantity
  }, 0)

  const canSubmit =
    companyId && locationId && date && cart.length > 0 && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    const failures: { menuItemId: string; message: string }[] = []

    // Submit sequentially — the backend decrements per-item stock, so parallel
    // calls can race against the assignment cap.
    for (const item of cart) {
      try {
        await createMutation.mutateAsync({
          companyId,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          locationId,
          date,
        })
      } catch (err) {
        failures.push({
          menuItemId: item.menuItemId,
          message: getApiErrorMessage(err, 'Failed to place order'),
        })
      }
    }

    setSubmitting(false)

    const succeeded = cart.length - failures.length
    if (failures.length === 0) {
      toast.success(
        succeeded === 1 ? 'Order placed successfully' : `${succeeded} orders placed`,
      )
      navigate('/orders')
      return
    }

    if (succeeded === 0) {
      toast.error(failures[0]?.message ?? 'Failed to place orders')
    } else {
      toast.warning(`${succeeded} placed, ${failures.length} failed`)
    }
    // Keep only failed items in the cart so the user can retry.
    setCart((prev) =>
      prev.filter((it) => failures.some((f) => f.menuItemId === it.menuItemId)),
    )
  }

  return (
    <>
      <PageHeader
        title="Place Order"
        subtitle="Place one or more orders for a company."
        action={
          <Button variant="outline" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <DatePicker
                value={date}
                onChange={(v) => setDate(v)}
                placeholder="Select a date"
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Company *</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies
                    ?.filter((c) => c.status === 'active' && !c.selfManaged)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Location *</Label>
              <Select
                value={locationId}
                onValueChange={setLocationId}
                disabled={!companyId || activeLocations.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      !companyId
                        ? 'Select a company first'
                        : activeLocations.length === 0
                          ? 'No active locations'
                          : 'Select a location'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {activeLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Menu for the day</h2>
                <p className="text-xs text-gray-500">
                  Add one or more items to the order and set their quantities.
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {assignedItems.length} item{assignedItems.length === 1 ? '' : 's'}
              </span>
            </div>

            <MenuGrid
              loading={assignmentsLoading}
              items={assignedItems}
              cart={cart}
              onChange={setQuantity}
            />
          </section>

          <aside className="lg:sticky lg:top-4 h-fit rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Order summary</h2>
              {cart.length > 0 && (
                <span className="text-xs text-gray-500">
                  {totalItems} item{totalItems === 1 ? '' : 's'}
                </span>
              )}
            </div>

            <CartList
              cart={cart}
              assignmentByItemId={assignmentByItemId}
              onChange={setQuantity}
              onRemove={removeItem}
            />

            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit}
              >
                {submitting
                  ? 'Placing orders...'
                  : cart.length > 1
                    ? `Place ${cart.length} orders`
                    : 'Place Order'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/orders')}
              >
                Cancel
              </Button>
            </div>
          </aside>
        </div>
      </form>
    </>
  )
}

interface MenuGridProps {
  loading: boolean
  items: NonNullable<ReturnType<typeof useDayAssignments>['data']>['items']
  cart: CartItem[]
  onChange: (menuItemId: string, quantity: number) => void
}

function MenuGrid({ loading, items, cart, onChange }: MenuGridProps) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-xl bg-gray-100"
          />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <UtensilsCrossed className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-2 text-sm text-gray-600">
          No menu items assigned to this date.
        </p>
        <p className="text-xs text-gray-400">
          Schedule them on the Menu Calendar first.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((a) => {
        const remaining =
          a.maxOrders > 0 ? Math.max(0, a.maxOrders - a.currentOrders) : null
        const inCart = cart.find((it) => it.menuItemId === a.menuItem.id)
        return (
          <MenuItemCard
            key={a.menuItem.id}
            item={a.menuItem}
            remaining={remaining}
            isSoldOut={a.isSoldOut}
            selectedQuantity={inCart?.quantity ?? 0}
            onChange={(q) => onChange(a.menuItem.id, q)}
          />
        )
      })}
    </div>
  )
}

interface CartListProps {
  cart: CartItem[]
  assignmentByItemId: Map<
    string,
    NonNullable<ReturnType<typeof useDayAssignments>['data']>['items'][number]
  >
  onChange: (menuItemId: string, quantity: number) => void
  onRemove: (menuItemId: string) => void
}

function CartList({ cart, assignmentByItemId, onChange, onRemove }: CartListProps) {
  if (cart.length === 0) {
    return (
      <div className="mt-4 rounded-lg bg-gray-50 p-4 text-center">
        <UtensilsCrossed className="mx-auto h-6 w-6 text-gray-300" />
        <p className="mt-2 text-sm text-gray-500">No items added yet.</p>
        <p className="text-xs text-gray-400">
          Tap a menu card to add it to the order.
        </p>
      </div>
    )
  }

  return (
    <ul className="mt-4 space-y-2">
      {cart.map((it) => {
        const assignment = assignmentByItemId.get(it.menuItemId)
        if (!assignment) return null
        const { menuItem, maxOrders, currentOrders } = assignment
        const remaining =
          maxOrders > 0 ? Math.max(0, maxOrders - currentOrders) : null
        const maxReached = remaining !== null && it.quantity >= remaining
        const subtotal = menuItem.price * it.quantity

        return (
          <li
            key={it.menuItemId}
            className="flex items-center gap-3 rounded-lg bg-gray-50 p-2"
          >
            {menuItem.imageUrl ? (
              <img
                src={menuItem.imageUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gray-200 text-gray-400">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {menuItem.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatCurrency(menuItem.price)} × {it.quantity} ={' '}
                <span className="font-medium text-gray-700">
                  {formatCurrency(subtotal)}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-1">
              <div className="inline-flex items-center rounded-md border bg-white">
                <button
                  type="button"
                  onClick={() => onChange(it.menuItemId, it.quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center text-gray-600 hover:bg-gray-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-medium">
                  {it.quantity}
                </span>
                <button
                  type="button"
                  disabled={maxReached}
                  onClick={() => onChange(it.menuItemId, it.quantity + 1)}
                  className="flex h-7 w-7 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onRemove(it.menuItemId)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
