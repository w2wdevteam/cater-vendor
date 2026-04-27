import type { CompanyStatus } from '@/lib/constants'

export interface Company {
  id: string
  name: string
  deliveryLocation: string
  contactName: string
  contactEmail: string
  contactPhone: string
  employeeCount: number
  departmentCount: number
  selfManaged: boolean
  status: CompanyStatus
  deliveryWindowStart: string
  deliveryWindowEnd: string
  adminName?: string
  adminEmail?: string
  balance: number
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
  contactPhone: string
  address?: string
  contactName?: string
  contactEmail?: string
  notes?: string
  deliveryWindowStart?: string
  deliveryWindowEnd?: string
}

export interface CompanyFilters {
  search?: string
  status?: CompanyStatus | 'all'
}

export interface DepartmentFilters {
  companyId?: string | 'all'
}
