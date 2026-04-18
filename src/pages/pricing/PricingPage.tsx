import { useEffect, useState, useRef } from 'react'
import { DollarSign, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
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
import { useCompanies } from '@/hooks/useCompanies'
import {
  usePricingOverrides,
  useCreateOverride,
  useUpdateOverride,
  useDeleteOverride,
} from '@/hooks/usePricing'
import { getMenuItemsForPricing } from '@/services/pricing.service'
import { formatCurrency } from '@/lib/utils'

function InlinePrice({
  value,
  onSave,
}: {
  value: number
  onSave: (price: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value.toString())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(value.toString())
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [editing, value])

  function commit() {
    const parsed = parseFloat(draft)
    if (!isNaN(parsed) && parsed > 0 && parsed !== value) {
      onSave(parsed)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        step="0.5"
        min="0.01"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="h-8 w-24 text-right text-sm"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-bold text-primary-600 hover:bg-primary-50 transition-colors"
      title="Click to edit"
    >
      {formatCurrency(value)}
    </button>
  )
}

export default function PricingPage() {
  const { data: companies } = useCompanies()
  const [companyId, setCompanyId] = useState('')
  const { data: overrides, isLoading } = usePricingOverrides(companyId)
  const createMutation = useCreateOverride()
  const updateMutation = useUpdateOverride(companyId)
  const deleteMutation = useDeleteOverride(companyId)

  const [addOpen, setAddOpen] = useState(false)
  const [addMenuItemId, setAddMenuItemId] = useState('')
  const [addPrice, setAddPrice] = useState('')

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteTarget = overrides?.find((o) => o.id === deleteId)

  const allMenuItems = getMenuItemsForPricing()
  const overriddenItemIds = new Set(overrides?.map((o) => o.menuItemId) ?? [])
  const availableItems = allMenuItems.filter((m) => !overriddenItemIds.has(m.id))

  useEffect(() => {
    document.title = 'Pricing — Catering Admin'
  }, [])

  async function handleAdd() {
    if (!companyId || !addMenuItemId || !addPrice) return
    const price = parseFloat(addPrice)
    if (isNaN(price) || price <= 0) return

    try {
      await createMutation.mutateAsync({
        companyId,
        menuItemId: addMenuItemId,
        overridePrice: price,
      })
      toast.success('Pricing override added')
      setAddOpen(false)
      setAddMenuItemId('')
      setAddPrice('')
    } catch {
      toast.error('Failed to add override')
    }
  }

  async function handleUpdate(id: string, overridePrice: number) {
    try {
      await updateMutation.mutateAsync({ id, overridePrice })
      toast.success('Price updated')
    } catch {
      toast.error('Failed to update price')
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success('Override removed — default price restored')
      setDeleteId(null)
    } catch {
      toast.error('Failed to remove override')
    }
  }

  const selectedAddItem = allMenuItems.find((m) => m.id === addMenuItemId)

  return (
    <>
      <PageHeader
        title="Pricing"
        subtitle="Configure per-company pricing overrides for menu items."
      />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies
                ?.filter((c) => c.status === 'active')
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {companyId && (
            <Button
              onClick={() => {
                setAddMenuItemId('')
                setAddPrice('')
                setAddOpen(true)
              }}
              disabled={availableItems.length === 0}
            >
              <Plus className="h-4 w-4" />
              Add Override
            </Button>
          )}
        </div>

        {!companyId ? (
          <div className="rounded-lg border bg-white py-16 text-center shadow-sm">
            <DollarSign className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-900">
              Select a company
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Choose a company to view and manage its pricing overrides.
            </p>
          </div>
        ) : isLoading ? (
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        ) : overrides && overrides.length > 0 ? (
          <div className="rounded-lg border bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Menu Item</th>
                  <th className="px-6 py-3 text-right">Default Price</th>
                  <th className="px-6 py-3 text-right">Override Price</th>
                  <th className="px-6 py-3 text-right">Savings</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {overrides.map((override) => {
                  const savings = override.defaultPrice - override.overridePrice
                  return (
                    <tr
                      key={override.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {override.menuItemImageUrl && (
                            <img
                              src={override.menuItemImageUrl}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {override.menuItemName}
                            </span>
                            <span className="inline-flex items-center rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">
                              CUSTOM
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-400 line-through">
                          {formatCurrency(override.defaultPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <InlinePrice
                          value={override.overridePrice}
                          onSave={(price) =>
                            handleUpdate(override.id, price)
                          }
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`text-sm font-medium ${
                            savings > 0
                              ? 'text-green-600'
                              : savings < 0
                                ? 'text-red-600'
                                : 'text-gray-400'
                          }`}
                        >
                          {savings > 0 ? '−' : savings < 0 ? '+' : ''}
                          {formatCurrency(Math.abs(savings))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(override.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<DollarSign className="h-12 w-12" />}
            title="No pricing overrides"
            description="No pricing overrides for this company. Default menu prices apply."
            action={
              availableItems.length > 0 ? (
                <Button
                  onClick={() => {
                    setAddMenuItemId('')
                    setAddPrice('')
                    setAddOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Override
                </Button>
              ) : undefined
            }
          />
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Pricing Override</DialogTitle>
            <DialogDescription>
              Set a custom price for a menu item for this company.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Menu Item</Label>
              <Select value={addMenuItemId} onValueChange={setAddMenuItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a menu item" />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} — {formatCurrency(item.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAddItem && (
                <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3">
                  {selectedAddItem.imageUrl && (
                    <img
                      src={selectedAddItem.imageUrl}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAddItem.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Default: {formatCurrency(selectedAddItem.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Override Price</Label>
              <Input
                type="number"
                step="0.5"
                min="0.01"
                placeholder="0.00"
                value={addPrice}
                onChange={(e) => setAddPrice(e.target.value)}
                className="max-w-[160px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                !addMenuItemId ||
                !addPrice ||
                parseFloat(addPrice) <= 0 ||
                createMutation.isPending
              }
            >
              {createMutation.isPending ? 'Adding...' : 'Add Override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Override</DialogTitle>
            <DialogDescription>
              Remove the pricing override for{' '}
              <span className="font-medium">{deleteTarget?.menuItemName}</span>?
              The default price of{' '}
              {formatCurrency(deleteTarget?.defaultPrice ?? 0)} will apply.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removing...' : 'Remove Override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
