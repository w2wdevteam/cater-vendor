export interface DeliveryLocation {
  id: string
  name: string
  address: string
  companyId: string
  companyName: string
  contactPerson?: string
  notes?: string
  status: 'active' | 'inactive'
}

export interface LocationFormData {
  name: string
  address: string
  companyId: string
  contactPerson?: string
  notes?: string
}