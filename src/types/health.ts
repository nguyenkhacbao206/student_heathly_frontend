export const HEALTH_STATUSES = ['UNDERWEIGHT', 'NORMAL', 'OVERWEIGHT', 'OBESE'] as const
export type HealthStatus = (typeof HEALTH_STATUSES)[number]

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  UNDERWEIGHT: 'Thiếu cân',
  NORMAL: 'Bình thường',
  OVERWEIGHT: 'Thừa cân',
  OBESE: 'Béo phì',
}

export interface HealthRecord {
  id: string
  studentId: string
  month: number
  year: number
  height: number
  weight: number
  bmi: number
  status: HealthStatus
  note: string | null
  createdAt: string
  updatedAt: string
  /** GET /health có include student { id, name } */
  student?: {
    id: string
    name: string
  }
}

/** Body cho POST /health */
export interface HealthPayload {
  studentId: string
  month: number
  year: number
  height: number
  weight: number
  note?: string
}
