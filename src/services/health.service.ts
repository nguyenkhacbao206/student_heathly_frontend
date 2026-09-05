import { api } from '@/lib/http'
import type { HealthPayload, HealthRecord } from '@/types/health'

/** Khớp với heathController: @Controller('health') */
export const healthService = {
  list: () => api.get<HealthRecord[]>('/health'),

  create: (payload: HealthPayload) => api.post<HealthRecord>('/health', payload),
}
