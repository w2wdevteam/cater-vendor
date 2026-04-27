import { departmentsApi, type ApiDepartment } from '@/api/endpoints/departments.api'
import type { Department, DepartmentFilters } from '@/types/company.types'

function mapDepartment(d: ApiDepartment): Department {
  return {
    id: d.id,
    companyId: d.companyId,
    companyName: d.companyName,
    name: d.name,
    deliveryLocation: d.locationName ?? '',
    contactPerson: d.contactPerson ?? '',
    buildingFloor: d.buildingNotes ?? undefined,
  }
}

export async function getDepartments(filters?: DepartmentFilters): Promise<Department[]> {
  const result = await departmentsApi.list({
    companyId: filters?.companyId && filters.companyId !== 'all' ? filters.companyId : undefined,
    limit: 100,
  })
  return result.data.map(mapDepartment).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getCompanyDepartments(companyId: string): Promise<Department[]> {
  const result = await departmentsApi.list({ companyId, limit: 100 })
  return result.data.map(mapDepartment).sort((a, b) => a.name.localeCompare(b.name))
}
