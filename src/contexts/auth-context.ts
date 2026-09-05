import { createContext } from 'react'

import type { AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  /** true trong lúc đọc lại phiên từ localStorage khi app khởi động */
  isInitializing: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

/** Tách khỏi provider để file component chỉ export component (Fast Refresh không cảnh báo). */
export const AuthContext = createContext<AuthContextValue | null>(null)
