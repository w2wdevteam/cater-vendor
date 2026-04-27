import { apiClient } from '../client'
import { unwrap, unwrapList, type ListResult } from '../unwrap'
import type { ApiEntityStatus } from './companies.api'

export type ApiAdminRole = 'superadmin' | 'cater_admin' | 'company_admin'

export interface ApiAdmin {
  id: string
  fullName: string
  phone: string
  email: string | null
  role: ApiAdminRole
  status: ApiEntityStatus
  cateringId: string | null
  cateringName: string | null
  companyId: string | null
  companyName: string | null
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminListQuery {
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  search?: string
  role?: ApiAdminRole
  status?: ApiEntityStatus
  cateringId?: string
  companyId?: string
}

export interface CreateScopedAdminBody {
  fullName: string
  phone: string
  email?: string
  password: string
}

export interface UpdateScopedAdminBody {
  fullName?: string
  phone?: string
  email?: string
}

export const adminsApi = {
  list: (params: AdminListQuery = {}): Promise<ListResult<ApiAdmin>> =>
    apiClient.get('/cater-admin/admins', { params }).then((r) => unwrapList<ApiAdmin>(r)),

  get: (id: string): Promise<ApiAdmin> =>
    apiClient.get<ApiAdmin>(`/cater-admin/admins/${id}`).then(unwrap<ApiAdmin>),

  create: (body: CreateScopedAdminBody): Promise<ApiAdmin> =>
    apiClient.post<ApiAdmin>('/cater-admin/admins', body).then(unwrap<ApiAdmin>),

  update: (id: string, body: UpdateScopedAdminBody): Promise<ApiAdmin> =>
    apiClient.patch<ApiAdmin>(`/cater-admin/admins/${id}`, body).then(unwrap<ApiAdmin>),

  setStatus: (id: string, status: ApiEntityStatus): Promise<ApiAdmin> =>
    apiClient
      .patch<ApiAdmin>(`/cater-admin/admins/${id}/status`, { status })
      .then(unwrap<ApiAdmin>),

  resetPassword: (id: string, newPassword: string): Promise<{ success: true }> =>
    apiClient
      .patch<{ success: true }>(`/cater-admin/admins/${id}/password`, { newPassword })
      .then(unwrap<{ success: true }>),
}
