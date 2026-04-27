import { pricingApi, type ApiPricingOverride } from '@/api/endpoints/pricing.api'
import { lookupsApi } from '@/api/endpoints/lookups.api'
import type {
  CreateOverrideInput,
  PricingOverride,
  UpdateOverrideInput,
} from '@/types/pricing.types'

function mapOverride(o: ApiPricingOverride): PricingOverride {
  return {
    id: o.id,
    companyId: o.companyId,
    menuItemId: o.menuItemId,
    menuItemName: o.menuItemName,
    menuItemImageUrl: undefined,
    defaultPrice: o.defaultPrice,
    overridePrice: o.overridePrice,
  }
}

export async function getOverrides(companyId: string): Promise<PricingOverride[]> {
  const result = await pricingApi.list({ companyId, limit: 100 })
  return result.data.map(mapOverride).sort((a, b) => a.menuItemName.localeCompare(b.menuItemName))
}

export async function createOverride(input: CreateOverrideInput): Promise<PricingOverride> {
  return mapOverride(await pricingApi.create(input))
}

export async function updateOverride(input: UpdateOverrideInput): Promise<PricingOverride> {
  return mapOverride(await pricingApi.update(input.id, input.overridePrice))
}

export async function deleteOverride(id: string): Promise<void> {
  await pricingApi.remove(id)
}

/**
 * The PricingPage uses this to populate the "add override" menu-item picker.
 * It returns a plain (non-react-query) promise so the existing page can keep
 * calling it synchronously — new code should use `useMenuItemsLookup()` instead.
 */
export async function getMenuItemsForPricing() {
  const items = await lookupsApi.menuItems({ status: 'active' })
  return items.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    imageUrl: i.imageUrl ?? undefined,
  }))
}
