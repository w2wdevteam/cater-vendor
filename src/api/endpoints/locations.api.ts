import { apiClient } from '../client'
import { unwrap, unwrapList, type ListResult } from '../unwrap'
import type { ApiEntityStatus } from './companies.api'

export type ApiLocationCreatedBy = 'superadmin' | 'cater_admin' | 'company_admin'

export interface ApiLocation {
  id: string
  name: string
  address: string
  lat: number | null
  lng: number | null
  contactPerson: string | null
  notes: string | null
  createdBy: ApiLocationCreatedBy
  status: ApiEntityStatus
  companyId: string
  companyName: string
  cateringId: string
  referencedByCount: number
  createdAt: string
  updatedAt: string
}

export interface LocationListQuery {
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  search?: string
  companyId?: string
  cateringId?: string
  createdBy?: ApiLocationCreatedBy
  status?: ApiEntityStatus
}

export interface CreateLocationBody {
  name: string
  address: string
  companyId: string
  lat?: number
  lng?: number
  contactPerson?: string
  notes?: string
}

export type UpdateLocationBody = Partial<Omit<CreateLocationBody, 'companyId'>>

export const locationsApi = {
  list: (params: LocationListQuery = {}): Promise<ListResult<ApiLocation>> =>
    apiClient
      .get('/cater-admin/locations', { params })
      .then((r) => unwrapList<ApiLocation>(r)),

  get: (id: string): Promise<ApiLocation> =>
    apiClient.get<ApiLocation>(`/cater-admin/locations/${id}`).then(unwrap<ApiLocation>),

  create: (body: CreateLocationBody): Promise<ApiLocation> =>
    apiClient.post<ApiLocation>('/cater-admin/locations', body).then(unwrap<ApiLocation>),

  update: (id: string, body: UpdateLocationBody): Promise<ApiLocation> =>
    apiClient.patch<ApiLocation>(`/cater-admin/locations/${id}`, body).then(unwrap<ApiLocation>),

  setStatus: (id: string, status: ApiEntityStatus): Promise<ApiLocation> =>
    apiClient
      .patch<ApiLocation>(`/cater-admin/locations/${id}/status`, { status })
      .then(unwrap<ApiLocation>),
}
