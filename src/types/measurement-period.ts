export const MEASUREMENT_STATUSES = ['UPCOMING', 'OPEN', 'CLOSED'] as const
export type MeasurementStatus = (typeof MEASUREMENT_STATUSES)[number]

export const MEASUREMENT_STATUS_LABELS: Record<MeasurementStatus, string> = {
  UPCOMING: 'Sắp diễn ra',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
}

export interface MeasurementPeriod {
  id: string
  name: string
  month: number
  startDate: string
  endDate: string
  status: MeasurementStatus
  schoolYearId: string
  createdAt: string
  updatedAt: string
  schoolYear?: {
    id: string
    name: string
  }
}

export interface MeasurementPeriodPayload {
  name: string
  month: number
  startDate: string
  endDate: string
  schoolYearId: string
}

export interface MeasurementPeriodFormValues {
  name: string
  month: string
  startDate: string
  endDate: string
  schoolYearId: string
}
