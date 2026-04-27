import { apiClient } from '../client'
import { unwrap, unwrapList, type ListResult } from '../unwrap'

export type ApiEntityStatus = 'active' | 'inactive'
export type ApiManagementMode = 'self_managed' | 'catering_managed'

export interface ApiCompany {
  id: string
  name: string
  address: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string
  notes: string | null
  managementMode: ApiManagementMode
  status: ApiEntityStatus
  cateringId: string
  cateringName: string
  deliveryWindowStart: string | null
  deliveryWindowEnd: string | null
  telegramGroupChatId: string | null
  logoId: string | null
  logoUrl: string | null
  employeeCount: number
  departmentCount: number
  balance: number
  createdAt: string
  updatedAt: string
}

export interface CompanyListQuery {
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  search?: string
  cateringId?: string
  managementMode?: ApiManagementMode
  status?: ApiEntityStatus
}

export interface CreateScopedCompanyBody {
  name: string
  contactPhone: string
  address?: string
  contactName?: string
  contactEmail?: string
  notes?: string
  deliveryWindowStart?: string
  deliveryWindowEnd?: string
  telegramGroupChatId?: string
}

export type UpdateScopedCompanyBody = Partial<CreateScopedCompanyBody>

export const companiesApi = {
  list: (params: CompanyListQuery = {}): Promise<ListResult<ApiCompany>> =>
    apiClient
      .get('/cater-admin/companies', { params })
      .then((r) => unwrapList<ApiCompany>(r)),

  get: (id: string): Promise<ApiCompany> =>
    apiClient.get<ApiCompany>(`/cater-admin/companies/${id}`).then(unwrap<ApiCompany>),

  create: (body: CreateScopedCompanyBody): Promise<ApiCompany> =>
    apiClient.post<ApiCompany>('/cater-admin/companies', body).then(unwrap<ApiCompany>),

  update: (id: string, body: UpdateScopedCompanyBody): Promise<ApiCompany> =>
    apiClient.patch<ApiCompany>(`/cater-admin/companies/${id}`, body).then(unwrap<ApiCompany>),

  setStatus: (id: string, status: ApiEntityStatus): Promise<ApiCompany> =>
    apiClient
      .patch<ApiCompany>(`/cater-admin/companies/${id}/status`, { status })
      .then(unwrap<ApiCompany>),

  uploadLogo: (id: string, file: File): Promise<ApiCompany> => {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<ApiCompany>(`/cater-admin/companies/${id}/logo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap<ApiCompany>)
  },
}
