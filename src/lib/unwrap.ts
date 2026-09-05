import type { ApiEnvelope } from '@/types/api'

function isEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.status === 'boolean' &&
    typeof record.code === 'number' &&
    'data' in record &&
    'timestamp' in record
  )
}

/**
 * Backend trả về lúc thì `ApiResponse.ok(...)` (có bọc), lúc thì object Prisma thô.
 * Hàm này nhận diện envelope và bóc `data`, còn lại giữ nguyên response.
 */
export function unwrap<T>(payload: unknown): T {
  return isEnvelope<T>(payload) ? payload.data : (payload as T)
}
