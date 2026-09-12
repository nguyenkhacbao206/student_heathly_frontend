export interface SchoolYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  classCount?: number
  studentCount?: number
  createdAt?: string
  updatedAt?: string
}

/** Tính trạng thái năm học dựa theo isActive + ngày */
export type SchoolYearStatus = 'active' | 'upcoming' | 'ended'

export function getSchoolYearStatus(year: Pick<SchoolYear, 'isActive' | 'startDate' | 'endDate'>): SchoolYearStatus {
  if (year.isActive) return 'active'
  const now = Date.now()
  if (new Date(year.startDate).getTime() > now) return 'upcoming'
  return 'ended'
}


export interface SchoolYearPayload {
  id?: string
  name: string
  startDate: string
  enDate: string
  endDate: string
  isActive?: boolean
}

export interface SchoolYearFormValues {
  id: string
  name: string
  startDate: string
  endDate: string
}
