export const TEACHER_STATUSES = ['ACTIVE', 'INACTIVE'] as const
export type TeacherStatus = (typeof TEACHER_STATUSES)[number]

export const TEACHER_STATUS_LABELS: Record<TeacherStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Đã khoá',
}


export const TEACHER_ROLES = ['USER', 'ADMIN'] as const
export type TeacherRole = (typeof TEACHER_ROLES)[number]

export const TEACHER_ROLE_LABELS: Record<TeacherRole, string> = {
  USER: 'User',
  ADMIN: 'Admin',
}


export interface Teacher {
  id: string
  name: string
  email: string
  phone: string | null
  status: TeacherStatus
  role?: TeacherRole
  createdAt: string
  updatedAt: string
}


export interface TeacherPayload {
  id?: string
  name: string
  email: string
  phone: string
}
