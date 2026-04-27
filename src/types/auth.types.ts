export type UserRole = 'cater-admin'
export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  fullName: string
  phone: string
  email: string | null
  role: UserRole
  status: UserStatus
  cateringId: string
  cateringName: string
  lastLogin: string | null
}

export interface LoginCredentials {
  phone: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
