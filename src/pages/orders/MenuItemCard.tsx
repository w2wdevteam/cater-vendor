import { Check, ImageOff, Minus, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import type { MenuItem } from '@/types/menu.types'

interface MenuItemCardProps {
  item: MenuItem
  remaining: number | null
  isSoldOut: boolean
  selectedQuantity: number
  onChange: (quantity: number) => void
}

export default function MenuItemCard({
  item,
  remaining,
  isSoldOut,
  selectedQuantity,
  onChange,
}: MenuItemCardProps) {
  const isSelected = selectedQuantity > 0
  const disabled = isSoldOut
  const lowStock = remaining !== null && remaining > 0 && remaining <= 5
  const maxReached = remaining !== null && selectedQuantity >= remaining

  function handleAdd() {
    if (disabled) return
    onChange(1)
  }

  function handleIncrement(e: React.MouseEvent) {
    e.stopPropagation()
    if (maxReached) return
    onChange(selectedQuantity + 1)
  }

  function handleDecrement(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(Math.max(0, selectedQuantity - 1))
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(0)
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-white text-left transition-all',
        disabled && 'cursor-not-allowed opacity-60',
        !disabled && !isSelected && 'hover:border-gray-300 hover:shadow-sm',
        isSelected && 'border-primary ring-2 ring-primary/40 shadow-sm',
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={handleAdd}
        className="flex flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gray-100">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <ImageOff className="h-8 w-8" />
            </div>
          )}

          {isSelected && (
            <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow">
              <Check className="h-4 w-4" strokeWidth={3} />
            </span>
          )}

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Badge variant="destructive" className="text-xs">
                Sold out
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-gray-900 leading-tight">{item.name}</p>
            <p className="whitespace-nowrap font-semibold text-gray-900">
              {formatCurrency(item.price)}
            </p>
          </div>

          {item.description && (
            <p className="line-clamp-2 text-xs text-gray-500">{item.description}</p>
          )}

          <div className="mt-auto pt-2">
            {!isSoldOut && remaining !== null && (
              <Badge
                variant={lowStock ? 'destructive' : 'secondary'}
                className="text-[11px]"
              >
                {remaining} left
              </Badge>
            )}
            {!isSoldOut && remaining === null && (
              <span className="text-[11px] text-gray-400">Unlimited</span>
            )}
          </div>
        </div>
      </button>

      <div className="border-t bg-gray-50 px-3 py-2">
        {isSelected ? (
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center rounded-md border bg-white">
              <button
                type="button"
                onClick={handleDecrement}
                className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-50"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {selectedQuantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={maxReached}
                className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="flex h-8 items-center gap-1 rounded-md px-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Remove from order"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={handleAdd}
            className="flex h-8 w-full items-center justify-center gap-1 rounded-md text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add to order
          </button>
        )}
      </div>
    </div>
  )
}
