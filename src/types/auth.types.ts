export interface User {
  id: string
  email: string
  name: string
  role: 'cater-admin'
  cateringId: string
  cateringName: string
}

export interface LoginCredentials {
  phone: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}
