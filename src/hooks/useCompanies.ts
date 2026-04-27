import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCompany,
  getCompanies,
  getCompanyById,
  setCompanyStatus,
  updateCompany,
} from '@/services/companies.service'
import { getDepartments, getCompanyDepartments } from '@/services/departments.service'
import type { CompanyFilters, CompanyFormData, DepartmentFilters } from '@/types/company.types'

export function useCompanies(filters?: CompanyFilters) {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => getCompanies(filters),
  })
}

export function useCompany(id?: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompanyById(id!),
    enabled: !!id,
  })
}

export function useCreateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CompanyFormData) => createCompany(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      qc.invalidateQueries({ queryKey: ['lookup', 'companies'] })
    },
  })
}

export function useUpdateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompanyFormData }) =>
      updateCompany(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      qc.invalidateQueries({ queryKey: ['company', vars.id] })
      qc.invalidateQueries({ queryKey: ['lookup', 'companies'] })
    },
  })
}

export function useSetCompanyStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      setCompanyStatus(id, status),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      qc.invalidateQueries({ queryKey: ['company', vars.id] })
      qc.invalidateQueries({ queryKey: ['lookup', 'companies'] })
    },
  })
}

export function useCompanyDepartments(companyId?: string) {
  return useQuery({
    queryKey: ['company-departments', companyId],
    queryFn: () => getCompanyDepartments(companyId!),
    enabled: !!companyId,
  })
}

export function useDepartments(filters?: DepartmentFilters) {
  return useQuery({
    queryKey: ['departments', filters],
    queryFn: () => getDepartments(filters),
  })
}
