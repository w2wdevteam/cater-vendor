import { apiClient } from '../client'
import { unwrap, unwrapList, type ListResult } from '../unwrap'

export interface ApiCateringClient {
  id: string
  name: string
  phone: string
  address: string
  locationLink: string | null
  notes: string | null
  cateringId: string
  balance: number
  createdAt: string
  updatedAt: string
}

export interface CateringClientListQuery {
  page?: number
  limit?: number
  search?: string
}

export interface CreateCateringClientBody {
  name: string
  phone: string
  address: string
  locationLink?: string
  notes?: string
}

export type UpdateCateringClientBody = Partial<CreateCateringClientBody>

export const cateringClientsApi = {
  list: (params: CateringClientListQuery = {}): Promise<ListResult<ApiCateringClient>> =>
    apiClient
      .get('/cater-admin/catering-clients', { params })
      .then((r) => unwrapList<ApiCateringClient>(r)),

  searchByPhone: (phone: string): Promise<ApiCateringClient[]> =>
    apiClient
      .get<ApiCateringClient[] | { data: ApiCateringClient[] }>(
        '/cater-admin/catering-clients/search',
        { params: { phone } },
      )
      .then(unwrap<ApiCateringClient[]>),

  get: (id: string): Promise<ApiCateringClient> =>
    apiClient
      .get<ApiCateringClient>(`/cater-admin/catering-clients/${id}`)
      .then(unwrap<ApiCateringClient>),

  create: (body: CreateCateringClientBody): Promise<ApiCateringClient> =>
    apiClient
      .post<ApiCateringClient>('/cater-admin/catering-clients', body)
      .then(unwrap<ApiCateringClient>),

  update: (id: string, body: UpdateCateringClientBody): Promise<ApiCateringClient> =>
    apiClient
      .patch<ApiCateringClient>(`/cater-admin/catering-clients/${id}`, body)
      .then(unwrap<ApiCateringClient>),

  remove: (id: string): Promise<{ id: string }> =>
    apiClient
      .delete<{ id: string }>(`/cater-admin/catering-clients/${id}`)
      .then(unwrap<{ id: string }>),
}
