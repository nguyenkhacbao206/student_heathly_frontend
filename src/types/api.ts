/**
 * Backend (NestJS) hiện trả về 2 dạng:
 *  1. Bọc bởi ApiResponse: { status, code, data, message, timestamp }
 *  2. Trả thẳng object/array từ Prisma (student, health, auth...)
 * Lớp http sẽ tự nhận diện và bóc `data` khi cần — xem src/lib/unwrap.ts
 */
export interface ApiEnvelope<T> {
  status: boolean
  code: number
  data: T
  message: string
  timestamp: string
}

export interface ApiErrorPayload {
  statusCode?: number
  message?: string | string[]
  error?: string
  errors?: unknown
}

/** Lỗi đã được chuẩn hoá cho toàn bộ UI dùng chung. */
export class ApiError extends Error {
  readonly status: number
  readonly details: string[]
  readonly raw: unknown

  constructor(message: string, status: number, details: string[] = [], raw?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.raw = raw
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }
}
