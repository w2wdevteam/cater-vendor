import type { Company, CompanyFilters, CompanyFormData } from '@/types/company.types'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

let companiesState: Company[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    deliveryLocation: '123 Main St, Floor 5, Lobby A',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah@acme.com',
    contactPhone: '+1 555-0101',
    employeeCount: 120,
    selfManaged: true,
    status: 'active',
    deliveryWindowStart: '12:00',
    deliveryWindowEnd: '13:00',
    adminName: 'Mike Chen',
    adminEmail: 'mike.chen@acme.com',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'GlobalTech Inc.',
    deliveryLocation: '456 Tech Blvd, Building B',
    contactName: 'David Park',
    contactEmail: 'david@globaltech.com',
    contactPhone: '+1 555-0202',
    employeeCount: 85,
    selfManaged: true,
    status: 'active',
    deliveryWindowStart: '11:30',
    deliveryWindowEnd: '12:30',
    adminName: 'Lisa Wang',
    adminEmail: 'lisa.wang@globaltech.com',
    createdAt: '2025-02-01T10:00:00Z',
  },
  {
    id: '3',
    name: 'Summit Partners',
    deliveryLocation: '789 Summit Ave, Suite 300',
    contactName: 'Rachel Green',
    contactEmail: 'rachel@summit.com',
    contactPhone: '+1 555-0303',
    employeeCount: 45,
    selfManaged: false,
    status: 'active',
    deliveryWindowStart: '12:30',
    deliveryWindowEnd: '13:30',
    adminName: 'Tom Harris',
    adminEmail: 'tom.harris@summit.com',
    createdAt: '2025-03-10T10:00:00Z',
  },
  {
    id: '4',
    name: 'Vertex Solutions',
    deliveryLocation: '321 Innovation Dr, Floor 2',
    contactName: 'James Wilson',
    contactEmail: 'james@vertex.com',
    contactPhone: '+1 555-0404',
    employeeCount: 60,
    selfManaged: false,
    status: 'active',
    deliveryWindowStart: '13:00',
    deliveryWindowEnd: '14:00',
    createdAt: '2025-04-20T10:00:00Z',
  },
  {
    id: '5',
    name: 'BlueWave Digital',
    deliveryLocation: '555 Ocean Blvd, Floor 8',
    contactName: 'Emma Davis',
    contactEmail: 'emma@bluewave.com',
    contactPhone: '+1 555-0505',
    employeeCount: 30,
    selfManaged: true,
    status: 'inactive',
    deliveryWindowStart: '11:00',
    deliveryWindowEnd: '12:00',
    adminName: 'Chris Lee',
    adminEmail: 'chris.lee@bluewave.com',
    createdAt: '2025-05-05T10:00:00Z',
  },
]

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getCompanies(filters?: CompanyFilters): Promise<Company[]> {
  await delay()
  let result = [...companiesState]

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter((c) => c.name.toLowerCase().includes(q))
  }

  if (filters?.status && filters.status !== 'all') {
    result = result.filter((c) => c.status === filters.status)
  }

  return result
}

export async function getCompanyById(id: string): Promise<Company | null> {
  await delay(300)
  return companiesState.find((c) => c.id === id) ?? null
}

export async function createCompany(data: CompanyFormData): Promise<Company> {
  await delay(500)
  const company: Company = {
    id: uid(),
    ...data,
    selfManaged: false,
    status: 'active',
    deliveryWindowStart: '12:00',
    deliveryWindowEnd: '13:00',
    createdAt: new Date().toISOString(),
  }
  companiesState = [...companiesState, company]
  return { ...company }
}

export async function updateCompany(id: string, data: CompanyFormData): Promise<Company> {
  await delay(500)
  companiesState = companiesState.map((c) =>
    c.id === id ? { ...c, ...data } : c,
  )
  const updated = companiesState.find((c) => c.id === id)
  if (!updated) throw new Error('Company not found')
  return { ...updated }
}
