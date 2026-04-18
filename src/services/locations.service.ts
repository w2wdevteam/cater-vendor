import type { DeliveryLocation, LocationFormData } from '@/types/location.types'

function uid() {
  return 'loc-' + Math.random().toString(36).slice(2, 10)
}

let locationsState: DeliveryLocation[] = [
  { id: 'loc-1', name: 'Main Lobby - Building A', address: '123 Main St, Floor 1, Lobby A', companyId: '1', companyName: 'Acme Corporation', contactPerson: 'Sarah Johnson', status: 'active' },
  { id: 'loc-2', name: 'Executive Floor', address: '123 Main St, Floor 5', companyId: '1', companyName: 'Acme Corporation', contactPerson: 'Maria Garcia', notes: 'Use service elevator', status: 'active' },
  { id: 'loc-3', name: 'Tech Hub Reception', address: '456 Tech Blvd, Building B, Ground Floor', companyId: '2', companyName: 'GlobalTech Inc.', contactPerson: 'David Park', status: 'active' },
  { id: 'loc-4', name: 'R&D Lab Entrance', address: '456 Tech Blvd, Building B, Floor 3', companyId: '2', companyName: 'GlobalTech Inc.', contactPerson: 'Kevin Li', notes: 'Badge required at entrance', status: 'active' },
  { id: 'loc-5', name: 'Summit Main Office', address: '789 Summit Ave, Suite 300', companyId: '3', companyName: 'Summit Partners', contactPerson: 'Rachel Green', status: 'active' },
  { id: 'loc-6', name: 'Innovation Center', address: '321 Innovation Dr, Floor 2, Reception', companyId: '4', companyName: 'Vertex Solutions', contactPerson: 'James Wilson', status: 'active' },
  { id: 'loc-7', name: 'BlueWave Office', address: '555 Ocean Blvd, Floor 8, Kitchen Area', companyId: '5', companyName: 'BlueWave Digital', contactPerson: 'Emma Davis', status: 'inactive' },
]

const companyNames: Record<string, string> = {
  '1': 'Acme Corporation',
  '2': 'GlobalTech Inc.',
  '3': 'Summit Partners',
  '4': 'Vertex Solutions',
  '5': 'BlueWave Digital',
}

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getLocations(companyId?: string): Promise<DeliveryLocation[]> {
  await delay()
  let result = [...locationsState]
  if (companyId && companyId !== 'all') {
    result = result.filter((l) => l.companyId === companyId)
  }
  return result.sort((a, b) => a.name.localeCompare(b.name))
}

export async function createLocation(data: LocationFormData): Promise<DeliveryLocation> {
  await delay(500)
  const location: DeliveryLocation = {
    id: uid(),
    name: data.name,
    address: data.address,
    companyId: data.companyId,
    companyName: companyNames[data.companyId] ?? 'Unknown',
    contactPerson: data.contactPerson,
    notes: data.notes,
    status: 'active',
  }
  locationsState = [...locationsState, location]
  return { ...location }
}
