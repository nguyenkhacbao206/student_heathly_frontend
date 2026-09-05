import { ApiError } from '@/types/api'

/** Đổi lỗi bất kỳ (từ react-query, axios, throw thủ công) thành chuỗi hiển thị được. */
export function getErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra'): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return fallback
}

/** Danh sách lỗi validate từ class-validator (backend trả message: string[]). */
export function getErrorDetails(error: unknown): string[] {
  return error instanceof ApiError ? error.details : []
}
