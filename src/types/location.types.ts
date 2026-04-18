export interface DeliveryLocation {
  id: string
  name: string
  address: string
  lat?: number
  lng?: number
  companyId: string
  companyName: string
  contactPerson?: string
  notes?: string
  status: 'active' | 'inactive'
}

export interface LocationFormData {
  name: string
  address: string
  lat?: number
  lng?: number
  companyId: string
  contactPerson?: string
  notes?: string
}