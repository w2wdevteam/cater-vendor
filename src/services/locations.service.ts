import { locationsApi, type ApiLocation } from '@/api/endpoints/locations.api'
import type { DeliveryLocation, LocationFormData } from '@/types/location.types'

function mapLocation(l: ApiLocation): DeliveryLocation {
  return {
    id: l.id,
    name: l.name,
    address: l.address,
    lat: l.lat ?? undefined,
    lng: l.lng ?? undefined,
    companyId: l.companyId,
    companyName: l.companyName,
    contactPerson: l.contactPerson ?? undefined,
    notes: l.notes ?? undefined,
    status: l.status,
  }
}

export async function getLocations(companyId?: string): Promise<DeliveryLocation[]> {
  const result = await locationsApi.list({
    companyId: companyId && companyId !== 'all' ? companyId : undefined,
    limit: 100,
  })
  return result.data.map(mapLocation).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getLocationById(id: string): Promise<DeliveryLocation> {
  return mapLocation(await locationsApi.get(id))
}

export async function createLocation(data: LocationFormData): Promise<DeliveryLocation> {
  const created = await locationsApi.create({
    name: data.name,
    address: data.address,
    companyId: data.companyId,
    lat: data.lat,
    lng: data.lng,
    contactPerson: data.contactPerson,
    notes: data.notes,
  })
  return mapLocation(created)
}

export async function updateLocation(
  id: string,
  data: LocationFormData,
): Promise<DeliveryLocation> {
  const updated = await locationsApi.update(id, {
    name: data.name,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    contactPerson: data.contactPerson,
    notes: data.notes,
  })
  return mapLocation(updated)
}

export async function setLocationStatus(
  id: string,
  status: 'active' | 'inactive',
): Promise<DeliveryLocation> {
  return mapLocation(await locationsApi.setStatus(id, status))
}
