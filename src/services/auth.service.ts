import { authApi, type ApiProfile } from '@/api/endpoints/auth.api'
import { clearTokens, getRefreshToken, setTokens } from '@/api/client'
import type { LoginCredentials, LoginResponse, User } from '@/types/auth.types'

function mapProfile(admin: ApiProfile): User {
  return {
    id: admin.id,
    fullName: admin.fullName,
    phone: admin.phone,
    email: admin.email,
    role: 'cater-admin',
    status: admin.status,
    cateringId: admin.cateringId,
    cateringName: admin.cateringName,
    lastLogin: admin.lastLogin,
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const res = await authApi.login(credentials)
    return {
      user: mapProfile(res.admin),
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    }
  },

  async profile(): Promise<User> {
    const admin = await authApi.profile()
    return mapProfile(admin)
  },

  /**
   * Restore a session from the persisted refresh token:
   * exchange it for a fresh access token, then load the profile.
   * Returns null when no refresh token is stored or the exchange fails.
   */
  async restoreSession(): Promise<User | null> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return null
    try {
      const tokens = await authApi.refresh(refreshToken)
      setTokens(tokens.accessToken, tokens.refreshToken)
      const admin = await authApi.profile()
      return mapProfile(admin)
    } catch {
      clearTokens()
      return null
    }
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword?: string,
  ): Promise<void> {
    await authApi.changePassword({
      currentPassword,
      newPassword,
      confirmPassword: confirmPassword ?? newPassword,
    })
  },
}
