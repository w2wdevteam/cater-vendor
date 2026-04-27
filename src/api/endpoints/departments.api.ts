import { apiClient } from '../client'
import { unwrap, unwrapList, type ListResult } from '../unwrap'
import type { ApiEntityStatus } from './companies.api'

export interface ApiDepartment {
  id: string
  name: string
  buildingNotes: string | null
  contactPerson: string | null
  contactPhone: string | null
  status: ApiEntityStatus
  companyId: string
  companyName: string
  cateringId: string
  cateringName: string
  locationId: string | null
  locationName: string | null
  employeeCount: number
  createdAt: string
  updatedAt: string
}

export interface DepartmentListQuery {
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  search?: string
  companyId?: string
  cateringId?: string
  locationId?: string
  status?: ApiEntityStatus
}

export const departmentsApi = {
  list: (params: DepartmentListQuery = {}): Promise<ListResult<ApiDepartment>> =>
    apiClient
      .get('/cater-admin/departments', { params })
      .then((r) => unwrapList<ApiDepartment>(r)),

  get: (id: string): Promise<ApiDepartment> =>
    apiClient.get<ApiDepartment>(`/cater-admin/departments/${id}`).then(unwrap<ApiDepartment>),
}
