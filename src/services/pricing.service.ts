import type {
  PricingOverride,
  CreateOverrideInput,
  UpdateOverrideInput,
} from '@/types/pricing.types'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const menuItems: Record<string, { name: string; price: number; imageUrl?: string }> = {
  '1': { name: 'Chicken Rice', price: 25000, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
  '2': { name: 'Beef Noodles', price: 30000, imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
  '3': { name: 'Veggie Wrap', price: 22000, imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400' },
  '4': { name: 'Grilled Salmon Bowl', price: 35000, imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400' },
  '5': { name: 'Caesar Salad', price: 20000, imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400' },
}

let overridesState: PricingOverride[] = [
  {
    id: 'po-1',
    companyId: '1',
    menuItemId: '1',
    menuItemName: 'Chicken Rice',
    menuItemImageUrl: menuItems['1'].imageUrl,
    defaultPrice: 25000,
    overridePrice: 22000,
  },
  {
    id: 'po-2',
    companyId: '1',
    menuItemId: '4',
    menuItemName: 'Grilled Salmon Bowl',
    menuItemImageUrl: menuItems['4'].imageUrl,
    defaultPrice: 35000,
    overridePrice: 32000,
  },
  {
    id: 'po-3',
    companyId: '2',
    menuItemId: '2',
    menuItemName: 'Beef Noodles',
    menuItemImageUrl: menuItems['2'].imageUrl,
    defaultPrice: 30000,
    overridePrice: 27000,
  },
]

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getOverrides(companyId: string): Promise<PricingOverride[]> {
  await delay()
  return overridesState
    .filter((o) => o.companyId === companyId)
    .sort((a, b) => a.menuItemName.localeCompare(b.menuItemName))
}

export async function createOverride(input: CreateOverrideInput): Promise<PricingOverride> {
  await delay(500)
  const item = menuItems[input.menuItemId]
  if (!item) throw new Error('Menu item not found')

  const existing = overridesState.find(
    (o) => o.companyId === input.companyId && o.menuItemId === input.menuItemId,
  )
  if (existing) throw new Error('Override already exists for this item')

  const override: PricingOverride = {
    id: uid(),
    companyId: input.companyId,
    menuItemId: input.menuItemId,
    menuItemName: item.name,
    menuItemImageUrl: item.imageUrl,
    defaultPrice: item.price,
    overridePrice: input.overridePrice,
  }
  overridesState = [...overridesState, override]
  return override
}

export async function updateOverride(input: UpdateOverrideInput): Promise<PricingOverride> {
  await delay(300)
  overridesState = overridesState.map((o) =>
    o.id === input.id ? { ...o, overridePrice: input.overridePrice } : o,
  )
  const override = overridesState.find((o) => o.id === input.id)
  if (!override) throw new Error('Override not found')
  return { ...override }
}

export async function deleteOverride(id: string): Promise<void> {
  await delay(400)
  overridesState = overridesState.filter((o) => o.id !== id)
}

export function getMenuItemsForPricing() {
  return Object.entries(menuItems).map(([id, item]) => ({
    id,
    name: item.name,
    price: item.price,
    imageUrl: item.imageUrl,
  }))
}
