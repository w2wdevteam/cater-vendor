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
import { useLocations } from '@/hooks/useLocations'
import { useCreateOrder } from '@/hooks/useOrders'
import { getAvailableMenuItems } from '@/services/orders.service'
import { formatCurrency } from '@/lib/utils'

export default function OrderCreatePage() {
  const navigate = useNavigate()
  const { data: companies } = useCompanies()
  const createMutation = useCreateOrder()

  const [companyId, setCompanyId] = useState('')
  const [menuItemId, setMenuItemId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [locationId, setLocationId] = useState('')

  const { data: locations } = useLocations(companyId || undefined)
  const activeLocations = locations?.filter((l) => l.status === 'active') ?? []

  const menuItems = getAvailableMenuItems()
  const selectedItem = menuItems.find((m) => m.id === menuItemId)

  useEffect(() => {
    document.title = 'Place Order — Catering Admin'
  }, [])

  useEffect(() => {
    setLocationId('')
  }, [companyId])

  const canSubmit = companyId && menuItemId && quantity > 0 && locationId

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    try {
      await createMutation.mutateAsync({
        companyId,
        menuItemId,
        quantity,
        locationId,
      })
      toast.success('Order placed successfully')
      navigate('/orders')
    } catch {
      toast.error('Failed to place order')
    }
  }

  return (
    <>
      <PageHeader
        title="Place Order"
        subtitle="Place a new order for a company."
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
            <Label>Company *</Label>
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
            <Label>Menu Item *</Label>
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
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-32"
            />
            {selectedItem && quantity > 1 && (
              <p className="text-sm text-gray-500">
                Total: {formatCurrency(selectedItem.price * quantity)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Location *</Label>
            <Select
              value={locationId}
              onValueChange={setLocationId}
              disabled={!companyId}
            >
              <SelectTrigger>
                <SelectValue placeholder={companyId ? 'Select a location' : 'Select a company first'} />
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

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={!canSubmit || createMutation.isPending}
          >
            {createMutation.isPending ? 'Placing order...' : 'Place Order'}
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
