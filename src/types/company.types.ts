import type { CompanyStatus } from '@/lib/constants'

export interface Company {
  id: string
  name: string
  deliveryLocation: string
  contactName: string
  contactEmail: string
  contactPhone: string
  employeeCount: number
  selfManaged: boolean
  status: CompanyStatus
  deliveryWindowStart: string
  deliveryWindowEnd: string
  adminName?: string
  adminEmail?: string
  createdAt: string
}

export interface Department {
  id: string
  companyId: string
  companyName: string
  name: string
  deliveryLocation: string
  contactPerson: string
  buildingFloor?: string
}

export interface CompanyFormData {
  name: string
  contactName: string
  contactEmail?: string
  contactPhone: string
  employeeCount?: number
}

export interface CompanyFilters {
  search?: string
  status?: CompanyStatus | 'all'
}

export interface DepartmentFilters {
  companyId?: string | 'all'
}
