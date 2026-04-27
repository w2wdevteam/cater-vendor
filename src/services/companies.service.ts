import { companiesApi, type ApiCompany } from '@/api/endpoints/companies.api'
import type { Company, CompanyFilters, CompanyFormData } from '@/types/company.types'

function mapCompany(c: ApiCompany): Company {
  return {
    id: c.id,
    name: c.name,
    deliveryLocation: c.address ?? '',
    contactName: c.contactName ?? '',
    contactEmail: c.contactEmail ?? '',
    contactPhone: c.contactPhone,
    employeeCount: c.employeeCount,
    departmentCount: c.departmentCount,
    selfManaged: c.managementMode === 'self_managed',
    status: c.status,
    deliveryWindowStart: c.deliveryWindowStart ?? '',
    deliveryWindowEnd: c.deliveryWindowEnd ?? '',
    balance: c.balance ?? 0,
    createdAt: c.createdAt,
  }
}

function toWriteBody(data: CompanyFormData) {
  return {
    name: data.name,
    contactPhone: data.contactPhone,
    address: data.address || undefined,
    contactName: data.contactName || undefined,
    contactEmail: data.contactEmail || undefined,
    notes: data.notes || undefined,
    deliveryWindowStart: data.deliveryWindowStart || undefined,
    deliveryWindowEnd: data.deliveryWindowEnd || undefined,
  }
}

export async function getCompanies(filters?: CompanyFilters): Promise<Company[]> {
  const result = await companiesApi.list({
    search: filters?.search || undefined,
    status: filters?.status && filters.status !== 'all' ? filters.status : undefined,
    limit: 100,
  })
  return result.data.map(mapCompany)
}

export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const c = await companiesApi.get(id)
    return mapCompany(c)
  } catch {
    return null
  }
}

export async function createCompany(data: CompanyFormData): Promise<Company> {
  return mapCompany(await companiesApi.create(toWriteBody(data)))
}

export async function updateCompany(id: string, data: CompanyFormData): Promise<Company> {
  return mapCompany(await companiesApi.update(id, toWriteBody(data)))
}

export async function setCompanyStatus(
  id: string,
  status: 'active' | 'inactive',
): Promise<Company> {
  return mapCompany(await companiesApi.setStatus(id, status))
}

export async function uploadCompanyLogo(id: string, file: File): Promise<Company> {
  return mapCompany(await companiesApi.uploadLogo(id, file))
}
