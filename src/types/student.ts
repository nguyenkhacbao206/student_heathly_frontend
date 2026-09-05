export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const
export type Gender = (typeof GENDERS)[number]

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
}

export interface Student {
  id: string
  studentCode: string
  name: string
  gender: string
  dob: string
  nation: string
  address: string | null
  createdAt: string
  updatedAt: string
}


export interface StudentPayload {
  studentCode: string
  name: string
  gender: string
  /** ISO date string — backend nhận và ép về DateTime */
  dob: string
  nation: string
  address: string
}
