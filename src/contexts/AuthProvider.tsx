import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { MOCK_ADMIN, env } from '@/config/env'
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context'
import { setSessionExpiredHandler } from '@/lib/http'
import { queryClient } from '@/lib/query-client'
import { tokenStorage } from '@/lib/token-storage'
import { authService } from '@/services/auth.service'
import type { AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Tắt auth (VITE_AUTH_DISABLED=true) -> có sẵn user giả lập, không cần đăng nhập.
  const [user, setUser] = useState<AuthUser | null>(env.authDisabled ? MOCK_ADMIN : null)
  const [isInitializing, setIsInitializing] = useState(!env.authDisabled)

  // Khôi phục phiên đăng nhập sau khi reload trang.
  useEffect(() => {
    if (env.authDisabled) return

    const savedUser = tokenStorage.getUser()
    if (savedUser && tokenStorage.getAccessToken()) {
      setUser(savedUser)
    }
    setIsInitializing(false)
  }, [])

  const clearSession = useCallback(() => {
    tokenStorage.clear()
    queryClient.clear()
    // Tắt auth thì 401 cũng không được đá về /login, giữ nguyên user giả lập.
    setUser(env.authDisabled ? MOCK_ADMIN : null)
  }, [])

  // Khi refresh token hỏng, lớp http gọi ngược lên đây để dọn state.
  useEffect(() => {
    setSessionExpiredHandler(clearSession)
    return () => setSessionExpiredHandler(null)
  }, [clearSession])

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authService.login(payload)
    tokenStorage.setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })

    const nextUser: AuthUser = { name: result.name, email: result.email }
    tokenStorage.setUser(nextUser)
    setUser(nextUser)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    await authService.register(payload)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      login,
      register,
      logout: clearSession,
    }),
    [user, isInitializing, login, register, clearSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
