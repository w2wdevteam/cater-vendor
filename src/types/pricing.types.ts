export interface PricingOverride {
  id: string
  companyId: string
  menuItemId: string
  menuItemName: string
  menuItemImageUrl?: string
  defaultPrice: number
  overridePrice: number
}

export interface CreateOverrideInput {
  companyId: string
  menuItemId: string
  overridePrice: number
}

export interface UpdateOverrideInput {
  id: string
  overridePrice: number
}
