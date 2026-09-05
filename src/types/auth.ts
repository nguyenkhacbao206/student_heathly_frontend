export interface AuthUser {
  id?: number
  name: string
  email: string
  createdAt?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

/** POST /v1/auth/login */
export interface LoginResponse {
  message: string
  name: string
  email: string
  accessToken: string
  refreshToken: string
}

/** POST /v1/auth/refresh */
export interface RefreshResponse {
  accessToken: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
