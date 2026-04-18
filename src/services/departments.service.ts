import type { Department, DepartmentFilters } from '@/types/company.types'

const mockDepartments: Department[] = [
  { id: 'd1', companyId: '1', companyName: 'Acme Corporation', name: 'Engineering', deliveryLocation: 'Building A Lobby', contactPerson: 'John Smith', buildingFloor: '3rd Floor' },
  { id: 'd2', companyId: '1', companyName: 'Acme Corporation', name: 'Marketing', deliveryLocation: 'Building A Lobby', contactPerson: 'Robert Taylor', buildingFloor: '2nd Floor' },
  { id: 'd3', companyId: '1', companyName: 'Acme Corporation', name: 'HR & Admin', deliveryLocation: 'Building A Lobby', contactPerson: 'Maria Garcia', buildingFloor: '1st Floor' },
  { id: 'd4', companyId: '2', companyName: 'GlobalTech Inc.', name: 'Product', deliveryLocation: 'Tower B Reception', contactPerson: 'Kevin Li', buildingFloor: '5th Floor' },
  { id: 'd5', companyId: '2', companyName: 'GlobalTech Inc.', name: 'Sales', deliveryLocation: 'Tower B Reception', contactPerson: 'Amy Foster', buildingFloor: '4th Floor' },
  { id: 'd6', companyId: '3', companyName: 'Summit Partners', name: 'Finance', deliveryLocation: 'Main Office', contactPerson: 'Brian Moore', buildingFloor: '2nd Floor' },
  { id: 'd7', companyId: '3', companyName: 'Summit Partners', name: 'Operations', deliveryLocation: 'Main Office', contactPerson: 'Diana Ross' },
  { id: 'd8', companyId: '4', companyName: 'Vertex Solutions', name: 'Development', deliveryLocation: 'Campus East', contactPerson: 'Steve Kim', buildingFloor: '3rd Floor' },
  { id: 'd9', companyId: '4', companyName: 'Vertex Solutions', name: 'Design', deliveryLocation: 'Campus East', contactPerson: 'Mia Zhang', buildingFloor: '3rd Floor' },
  { id: 'd10', companyId: '5', companyName: 'BlueWave Digital', name: 'Creative', deliveryLocation: 'Warehouse Office', contactPerson: 'Jake Brown' },
]

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getDepartments(filters?: DepartmentFilters): Promise<Department[]> {
  await delay()
  let result = [...mockDepartments]
  if (filters?.companyId && filters.companyId !== 'all') {
    result = result.filter((d) => d.companyId === filters.companyId)
  }
  return result.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getCompanyDepartments(companyId: string): Promise<Department[]> {
  await delay()
  return mockDepartments
    .filter((d) => d.companyId === companyId)
    .sort((a, b) => a.name.localeCompare(b.name))
}
