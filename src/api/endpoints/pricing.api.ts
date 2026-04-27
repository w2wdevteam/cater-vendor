import { apiClient } from '../client'
import { unwrap, unwrapList, type ListResult } from '../unwrap'

export interface ApiPricingOverride {
  id: string
  companyId: string
  companyName: string
  menuItemId: string
  menuItemName: string
  defaultPrice: number
  overridePrice: number
  createdAt: string
  updatedAt: string
}

export interface PricingListQuery {
  page?: number
  limit?: number
  companyId?: string
  menuItemId?: string
}

export interface CreateOverrideBody {
  companyId: string
  menuItemId: string
  overridePrice: number
}

export const pricingApi = {
  list: (params: PricingListQuery = {}): Promise<ListResult<ApiPricingOverride>> =>
    apiClient
      .get('/cater-admin/pricing-overrides', { params })
      .then((r) => unwrapList<ApiPricingOverride>(r)),

  create: (body: CreateOverrideBody): Promise<ApiPricingOverride> =>
    apiClient
      .post<ApiPricingOverride>('/cater-admin/pricing-overrides', body)
      .then(unwrap<ApiPricingOverride>),

  update: (id: string, overridePrice: number): Promise<ApiPricingOverride> =>
    apiClient
      .patch<ApiPricingOverride>(`/cater-admin/pricing-overrides/${id}`, { overridePrice })
      .then(unwrap<ApiPricingOverride>),

  remove: (id: string): Promise<void> =>
    apiClient.delete(`/cater-admin/pricing-overrides/${id}`).then(() => undefined),
}
