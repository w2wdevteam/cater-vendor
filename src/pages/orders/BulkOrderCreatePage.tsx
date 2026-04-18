import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/common/PageHeader'
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
import { useCompanies } from '@/hooks/useCompanies'
import { useCreateBulkOrder } from '@/hooks/useOrders'
import { getAvailableMenuItems } from '@/services/orders.service'
import { formatCurrency } from '@/lib/utils'

export default function BulkOrderCreatePage() {
  const navigate = useNavigate()
  const { data: companies } = useCompanies()
  const createMutation = useCreateBulkOrder()

  const [companyId, setCompanyId] = useState('')
  const [menuItemId, setMenuItemId] = useState('')
  const [quantity, setQuantity] = useState('1')

  const menuItems = getAvailableMenuItems()
  const selectedItem = menuItems.find((m) => m.id === menuItemId)
  const qty = parseInt(quantity) || 0

  useEffect(() => {
    document.title = 'Bulk Order — Catering Admin'
  }, [])

  const canSubmit = companyId && menuItemId && qty > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const company = companies?.find((c) => c.id === companyId)
    try {
      await createMutation.mutateAsync({
        companyId,
        menuItemId,
        quantity: qty,
      })
      toast.success(`Company order placed for ${company?.name}`)
      navigate('/orders')
    } catch {
      toast.error('Failed to place bulk order')
    }
  }

  return (
    <>
      <PageHeader
        title="Bulk Order"
        subtitle="Place a company-level order not attributed to a specific employee."
        action={
          <Button variant="outline" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm space-y-5">
          <div className="space-y-2">
            <Label>Company</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label>Menu Item</Label>
            <Select value={menuItemId} onValueChange={setMenuItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a menu item" />
              </SelectTrigger>
              <SelectContent>
                {menuItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} — {formatCurrency(item.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedItem && (
              <div className="flex items-center gap-3 mt-2 rounded-md bg-gray-50 p-3">
                {selectedItem.imageUrl && (
                  <img
                    src={selectedItem.imageUrl}
                    alt=""
                    className="h-12 w-12 rounded object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedItem.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(selectedItem.price)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="max-w-[120px]"
            />
          </div>

          {selectedItem && qty > 0 && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                Total:{' '}
                <span className="font-semibold text-gray-900">
                  {formatCurrency(selectedItem.price * qty)}
                </span>{' '}
                ({qty} × {formatCurrency(selectedItem.price)})
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={!canSubmit || createMutation.isPending}
          >
            {createMutation.isPending
              ? 'Placing order...'
              : 'Place Bulk Order'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/orders')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  )
}
