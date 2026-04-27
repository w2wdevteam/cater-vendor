import { apiClient } from '../client'
import { unwrap } from '../unwrap'

export type LookupStatus = 'active' | 'inactive'

export interface CompanyLookupItem {
  id: string
  name: string
  status: LookupStatus
  cateringId: string
  cateringName: string
}

export interface LocationLookupItem {
  id: string
  name: string
  status: LookupStatus
  companyId: string
  address: string
}

export interface DepartmentLookupItem {
  id: string
  name: string
  status: LookupStatus
  companyId: string
  companyName: string
}

export interface AdminLookupItem {
  id: string
  fullName: string
  status: LookupStatus
  role: 'cater_admin' | 'company_admin'
  cateringId: string | null
  companyId: string | null
}

export interface EmployeeLookupItem {
  id: string
  fullName: string
  phone: string | null
  status: LookupStatus
  companyId: string
  departmentId: string | null
  departmentName: string | null
}

export interface MenuItemLookupItem {
  id: string
  name: string
  status: LookupStatus
  price: number
  imageUrl: string | null
}

type StatusParam = { status?: LookupStatus }

export const lookupsApi = {
  companies: (params?: StatusParam) =>
    apiClient
      .get<{ data: CompanyLookupItem[] }>('/cater-admin/companies/lookup', { params })
      .then(unwrap<CompanyLookupItem[]>),

  locations: (params?: StatusParam & { companyId?: string }) =>
    apiClient
      .get<{ data: LocationLookupItem[] }>('/cater-admin/locations/lookup', { params })
      .then(unwrap<LocationLookupItem[]>),

  departments: (params?: StatusParam & { companyId?: string; locationId?: string }) =>
    apiClient
      .get<{ data: DepartmentLookupItem[] }>('/cater-admin/departments/lookup', { params })
      .then(unwrap<DepartmentLookupItem[]>),

  admins: (params?: StatusParam & { role?: 'cater_admin' | 'company_admin' }) =>
    apiClient
      .get<{ data: AdminLookupItem[] }>('/cater-admin/admins/lookup', { params })
      .then(unwrap<AdminLookupItem[]>),

  employees: (params?: StatusParam & { companyId?: string; departmentId?: string; search?: string }) =>
    apiClient
      .get<{ data: EmployeeLookupItem[] }>('/cater-admin/employees/lookup', { params })
      .then(unwrap<EmployeeLookupItem[]>),

  menuItems: (params?: StatusParam & { search?: string }) =>
    apiClient
      .get<{ data: MenuItemLookupItem[] }>('/cater-admin/menu-items/lookup', { params })
      .then(unwrap<MenuItemLookupItem[]>),
}
