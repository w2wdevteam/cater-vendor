export type AdminRole = 'super_admin' | 'admin'

export interface Admin {
  id: string
  name: string
  email: string
  role: AdminRole
  status: 'active' | 'inactive'
  createdAt: string
  lastLoginAt: string | null
}

export interface AdminFormData {
  name: string
  email: string
  role: AdminRole
  password?: string
}
