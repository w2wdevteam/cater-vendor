import type { LoginCredentials, LoginResponse } from '@/types/auth.types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!credentials.email || !credentials.password) {
      throw new Error('Invalid credentials')
    }

    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '1',
        email: credentials.email,
        name: 'Catering Manager',
        role: 'cater-admin',
        cateringId: 'catering-1',
        cateringName: 'Fresh Bites Catering',
      },
    }
  },

  async changePassword(currentPassword: string, _newPassword: string) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (currentPassword === 'wrong') {
      throw new Error('Current password is incorrect.')
    }
    return { success: true }
  },
}
