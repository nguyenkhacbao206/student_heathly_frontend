import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/config/env'
import { tokenStorage } from '@/lib/token-storage'
import { unwrap } from '@/lib/unwrap'
import { ApiError, type ApiErrorPayload } from '@/types/api'
import type { RefreshResponse } from '@/types/auth'

/** Endpoint không cần token và không được phép trigger refresh. */
const PUBLIC_PATHS = ['/v1/auth/login', '/v1/auth/register', '/v1/auth/refresh']

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
})

/** Cho AuthProvider đăng ký hành động "phiên hết hạn" (xoá state + đẩy về /login). */
let onSessionExpired: (() => void) | null = null
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler
}

// ---------------------------------------------------------------------------
// Request: gắn Bearer token
// ---------------------------------------------------------------------------
httpClient.interceptors.request.use((config) => {
  const isPublic = PUBLIC_PATHS.some((path) => config.url?.startsWith(path))
  const token = tokenStorage.getAccessToken()

  if (token && !isPublic) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// ---------------------------------------------------------------------------
// Response: tự refresh khi 401, gộp các request đồng thời vào 1 lần refresh
// ---------------------------------------------------------------------------
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) throw new ApiError('Phiên đăng nhập đã hết hạn', 401)

  // Dùng axios gốc để không lọt lại vào interceptor này.
  const { data } = await axios.post<RefreshResponse>(
    `${env.apiBaseUrl}/v1/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  )

  const accessToken = unwrap<RefreshResponse>(data).accessToken
  if (!accessToken) throw new ApiError('Không lấy được access token mới', 401)

  tokenStorage.setAccessToken(accessToken)
  return accessToken
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const isPublic = PUBLIC_PATHS.some((path) => config?.url?.startsWith(path))

    if (status === 401 && config && !config._retried && !isPublic) {
      config._retried = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const accessToken = await refreshPromise

        config.headers.set('Authorization', `Bearer ${accessToken}`)
        return httpClient.request(config)
      } catch {
        tokenStorage.clear()
        onSessionExpired?.()
        return Promise.reject(new ApiError('Phiên đăng nhập đã hết hạn', 401))
      }
    }

    return Promise.reject(toApiError(error))
  },
)

// ---------------------------------------------------------------------------
// Chuẩn hoá lỗi
// ---------------------------------------------------------------------------
function toApiError(error: AxiosError<ApiErrorPayload>): ApiError {
  if (error.response) {
    const payload = error.response.data
    const raw = payload?.message
    const details = Array.isArray(raw) ? raw : raw ? [raw] : []

    return new ApiError(
      details[0] ?? payload?.error ?? `Yêu cầu thất bại (${error.response.status})`,
      error.response.status,
      details,
      payload,
    )
  }

  if (error.code === 'ECONNABORTED') {
    return new ApiError('Yêu cầu quá thời gian chờ', 0)
  }
  return new ApiError('Không kết nối được tới máy chủ', 0)
}

// ---------------------------------------------------------------------------
// API tiện dụng — luôn trả về data đã bóc envelope
// ---------------------------------------------------------------------------
export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await httpClient.get<unknown>(url, config)
    return unwrap<T>(data)
  },
  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await httpClient.post<unknown>(url, body, config)
    return unwrap<T>(data)
  },
  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await httpClient.put<unknown>(url, body, config)
    return unwrap<T>(data)
  },
  async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await httpClient.patch<unknown>(url, body, config)
    return unwrap<T>(data)
  },
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await httpClient.delete<unknown>(url, config)
    return unwrap<T>(data)
  },
}
