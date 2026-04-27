import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Minus,
  Plus,
  Trash2,
  UserCheck,
  UtensilsCrossed,
} from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { useDayAssignments } from '@/hooks/useMenus'
import {
  useCateringClientsByPhone,
  type CateringClient,
} from '@/hooks/useCateringClients'
import { useCreateClientOrder } from '@/hooks/useClientOrders'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency } from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/api-errors'
import MenuItemCard from './MenuItemCard'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

interface CartItem {
  menuItemId: string
  quantity: number
}

export default function OrderCreateClientPage() {
  const navigate = useNavigate()
  const createMutation = useCreateClientOrder()

  const [date, setDate] = useState<string>(todayKey())
  const [phone, setPhone] = useState('')
  const [clientName, setClientName] = useState('')
  const [address, setAddress] = useState('')
  const [locationLink, setLocationLink] = useState('')
  const [notes, setNotes] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [markAsPaid, setMarkAsPaid] = useState(false)

  const [phoneFocused, setPhoneFocused] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const suppressFocusOpenRef = useRef(false)

  const debouncedPhone = useDebounce(phone, 300)
  const { data: phoneMatches = [] } = useCateringClientsByPhone(
    debouncedPhone,
    phoneFocused && !selectedClientId,
  )

  const { data: dayAssignments, isLoading: assignmentsLoading } = useDayAssignments(
    date || null,
  )
  const assignedItems = dayAssignments?.items ?? []

  const assignmentByItemId = useMemo(() => {
    const map = new Map<string, (typeof assignedItems)[number]>()
    assignedItems.forEach((a) => map.set(a.menuItem.id, a))
    return map
  }, [assignedItems])

  const showPhoneDropdown =
    phoneFocused && phone.length > 0 && phoneMatches.length > 0 && !selectedClientId
  const submitting = createMutation.isPending

  useEffect(() => {
    document.title = 'Place Client Order — Catering Admin'
  }, [])

  useEffect(() => {
    setCart([])
  }, [date])

  function handleSelectClient(client: CateringClient) {
    setSelectedClientId(client.id)
    setPhone(client.phone)
    setClientName(client.name)
    setAddress(client.address)
    setLocationLink(client.locationLink ?? '')
    setPhoneFocused(false)
    suppressFocusOpenRef.current = true
    phoneInputRef.current?.blur()
    toast.success(`Loaded client: ${client.name}`)
  }

  function handlePhoneChange(value: string) {
    setPhone(value)
    if (selectedClientId) {
      setSelectedClientId(null)
      setClientName('')
      setAddress('')
      setLocationLink('')
    }
  }

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
    phone.trim() !== '' &&
    clientName.trim() !== '' &&
    address.trim() !== '' &&
    date !== '' &&
    cart.length > 0 &&
    !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    try {
      await createMutation.mutateAsync({
        date,
        clientName: clientName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        locationLink: locationLink.trim() || undefined,
        notes: notes.trim() || undefined,
        items: cart,
        markAsPaid: markAsPaid || undefined,
      })
      toast.success(
        markAsPaid
          ? 'Client order placed and payment recorded'
          : cart.length === 1
            ? 'Client order placed'
            : `${cart.length} orders placed`,
      )
      navigate('/orders/clients')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to place client order'))
    }
  }

  return (
    <>
      <PageHeader
        title="Place Client Order"
        subtitle="Place an order for an external catering client (walk-in or event booking)."
        action={
          <Button variant="outline" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <DatePicker
                value={date}
                onChange={(v) => setDate(v)}
                placeholder="Select a date"
                className="w-full"
              />
            </div>

            <div className="space-y-1.5 relative">
              <Label>Phone *</Label>
              <Input
                ref={phoneInputRef}
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onFocus={() => {
                  if (suppressFocusOpenRef.current) {
                    suppressFocusOpenRef.current = false
                    return
                  }
                  setPhoneFocused(true)
                }}
                onBlur={() => {
                  setTimeout(() => setPhoneFocused(false), 120)
                }}
                placeholder="+998..."
                autoComplete="off"
              />
              {showPhoneDropdown && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-md border bg-white shadow-lg">
                  {phoneMatches.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectClient(c)}
                      className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{c.name}</span>
                      <span className="text-xs text-gray-500">{c.phone}</span>
                      <span className="truncate text-xs text-gray-400">
                        {c.address}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {selectedClientId && (
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <UserCheck className="h-3 w-3" />
                  Existing client selected
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Client name *</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
              <Label>Delivery address *</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, building, apt"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Location link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={locationLink}
                  onChange={(e) => setLocationLink(e.target.value)}
                  placeholder="https://maps.google.com/... (optional)"
                />
                {locationLink.trim() !== '' && (
                  <a
                    href={locationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions (optional)"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Menu for the day</h2>
                <p className="text-xs text-gray-500">
                  Add items and set quantities.
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

          <aside className="h-fit rounded-xl border bg-white p-4 shadow-sm lg:sticky lg:top-4">
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

            <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-md border bg-gray-50 p-3 hover:bg-gray-100">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={markAsPaid}
                onChange={(e) => setMarkAsPaid(e.target.checked)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Already paid</p>
                <p className="text-xs text-gray-500">
                  Record a cash payment of {formatCurrency(totalAmount)} for this
                  client now. Balance stays at zero.
                </p>
              </div>
            </label>

            <div className="mt-4 space-y-2">
              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {submitting ? 'Placing...' : 'Place client order'}
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
          <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-100" />
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
