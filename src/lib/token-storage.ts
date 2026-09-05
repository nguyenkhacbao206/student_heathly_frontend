import { STORAGE_KEYS } from '@/config/env'
import type { AuthTokens, AuthUser } from '@/types/auth'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* private mode / storage đầy — bỏ qua, app vẫn chạy trong phiên hiện tại */
  }
}

export const tokenStorage = {
  getAccessToken: () => read(STORAGE_KEYS.accessToken),
  getRefreshToken: () => read(STORAGE_KEYS.refreshToken),

  setTokens({ accessToken, refreshToken }: AuthTokens): void {
    write(STORAGE_KEYS.accessToken, accessToken)
    write(STORAGE_KEYS.refreshToken, refreshToken)
  },

  setAccessToken(accessToken: string): void {
    write(STORAGE_KEYS.accessToken, accessToken)
  },

  getUser(): AuthUser | null {
    const raw = read(STORAGE_KEYS.user)
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },

  setUser(user: AuthUser | null): void {
    write(STORAGE_KEYS.user, user ? JSON.stringify(user) : null)
  },

  clear(): void {
    write(STORAGE_KEYS.accessToken, null)
    write(STORAGE_KEYS.refreshToken, null)
    write(STORAGE_KEYS.user, null)
  },
}
