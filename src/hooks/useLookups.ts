import { useQuery } from '@tanstack/react-query'
import {
  lookupsApi,
  type AdminLookupItem,
  type CompanyLookupItem,
  type DepartmentLookupItem,
  type EmployeeLookupItem,
  type LocationLookupItem,
  type LookupStatus,
  type MenuItemLookupItem,
} from '@/api/endpoints/lookups.api'

const STALE_TIME = 5 * 60 * 1000

export function useCompaniesLookup(params?: { status?: LookupStatus }) {
  return useQuery<CompanyLookupItem[]>({
    queryKey: ['lookup', 'companies', params],
    queryFn: () => lookupsApi.companies(params),
    staleTime: STALE_TIME,
  })
}

export function useLocationsLookup(
  params?: { status?: LookupStatus; companyId?: string },
  options?: { enabled?: boolean },
) {
  return useQuery<LocationLookupItem[]>({
    queryKey: ['lookup', 'locations', params],
    queryFn: () => lookupsApi.locations(params),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
  })
}

export function useDepartmentsLookup(
  params?: { status?: LookupStatus; companyId?: string; locationId?: string },
  options?: { enabled?: boolean },
) {
  return useQuery<DepartmentLookupItem[]>({
    queryKey: ['lookup', 'departments', params],
    queryFn: () => lookupsApi.departments(params),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
  })
}

export function useAdminsLookup(params?: {
  status?: LookupStatus
  role?: 'cater_admin' | 'company_admin'
}) {
  return useQuery<AdminLookupItem[]>({
    queryKey: ['lookup', 'admins', params],
    queryFn: () => lookupsApi.admins(params),
    staleTime: STALE_TIME,
  })
}

export function useEmployeesLookup(
  params?: { status?: LookupStatus; companyId?: string; departmentId?: string; search?: string },
  options?: { enabled?: boolean },
) {
  return useQuery<EmployeeLookupItem[]>({
    queryKey: ['lookup', 'employees', params],
    queryFn: () => lookupsApi.employees(params),
    staleTime: STALE_TIME,
    enabled: options?.enabled ?? true,
  })
}

export function useMenuItemsLookup(params?: { status?: LookupStatus; search?: string }) {
  return useQuery<MenuItemLookupItem[]>({
    queryKey: ['lookup', 'menu-items', params],
    queryFn: () => lookupsApi.menuItems(params),
    staleTime: STALE_TIME,
  })
}
