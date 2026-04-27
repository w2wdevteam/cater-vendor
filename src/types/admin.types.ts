export interface Admin {
  id: string
  fullName: string
  phone: string
  email: string | null
  status: 'active' | 'inactive'
  lastLogin: string | null
  createdAt: string
}

export interface AdminFormData {
  fullName: string
  phone: string
  email?: string
  password?: string
}
