import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const REFRESH_TOKEN_KEY = 'catering-admin-refresh-token'

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function setTokens(access: string, refresh: string): void {
  setAccessToken(access)
  setRefreshToken(refresh)
}

export function clearTokens(): void {
  setAccessToken(null)
  clearRefreshToken()
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  type RefreshBody = { accessToken: string; refreshToken: string }
  const response = await axios.post<RefreshBody | { data: RefreshBody }>(
    `${BASE_URL}/cater-admin/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  )
  const body = response.data
  const unwrapped: RefreshBody =
    body && typeof body === 'object' && 'data' in body
      ? (body as { data: RefreshBody }).data
      : (body as RefreshBody)
  setTokens(unwrapped.accessToken, unwrapped.refreshToken)
  return unwrapped.accessToken
}

function redirectToLogin(): void {
  clearTokens()
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login'
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const isAuthEndpoint =
      original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh')

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true
      try {
        refreshPromise =
          refreshPromise ??
          refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        const newToken = await refreshPromise
        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${newToken}`,
        }
        return apiClient.request(original)
      } catch {
        redirectToLogin()
        return Promise.reject(error)
      }
    }

    if (status === 401 && !isAuthEndpoint) {
      redirectToLogin()
    }

    return Promise.reject(error)
  },
)
