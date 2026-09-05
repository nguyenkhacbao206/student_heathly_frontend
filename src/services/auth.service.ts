import { api } from '@/lib/http'
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  RegisterPayload,
} from '@/types/auth'

/** Khớp với AuthController: @Controller('v1/auth') */
export const authService = {
  login: (payload: LoginPayload) => api.post<LoginResponse>('/v1/auth/login', payload),

  register: (payload: RegisterPayload) => api.post<AuthUser>('/v1/auth/register', payload),

  refresh: (refreshToken: string) =>
    api.post<RefreshResponse>('/v1/auth/refresh', { refreshToken }),

  listUsers: () => api.get<AuthUser[]>('/v1/auth/user'),
}
