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
  classId: string
  /** null = chưa gắn với tài khoản phụ huynh nào (dùng ở màn Giám sát phụ huynh). */
  parentId: number | null
  createdAt: string
  updatedAt: string
}


export interface StudentPayload {
  studentCode: string
  name: string
  gender: string
  dob: string
  nation: string
  address: string
  classId: string
}

import type { GeneratedParentAccount } from '@/types/parent'

export interface ImportRowError {
  row: number
  studentCode: string
  message: string
}

export interface ImportStudentsResult {
  message: string
  classId: string
  className: string
  total: number
  created: number
  skipped: number
  errors: ImportRowError[]
  students: Student[]
  /** Mỗi học sinh nhập vào được cấp kèm một tài khoản phụ huynh. */
  parentAccounts: GeneratedParentAccount[]
}
