/**
 * Khớp với ParentController: @Controller('admin/parents')
 *
 * Tài khoản phụ huynh là User có role = PARENT; mỗi phụ huynh gắn với 0..n học sinh
 * qua Student.parentId. Backend không trả sẵn "status" mà trả 3 cờ thô
 * (firstLogin / passwordChanged / lastLoginAt) — FE tự quy ra trạng thái hiển thị.
 */

export const PARENT_STATUSES = ['NOT_LOGIN', 'LOGGED_IN', 'PASSWORD_CHANGED'] as const
export type ParentAccountStatus = (typeof PARENT_STATUSES)[number]

export const PARENT_STATUS_LABELS: Record<ParentAccountStatus, string> = {
  NOT_LOGIN: 'Chưa đăng nhập',
  LOGGED_IN: 'Đã đăng nhập',
  PASSWORD_CHANGED: 'Đã đổi mật khẩu',
}

export interface Parent {
  id: number
  name: string
  email: string
  firstLogin: boolean
  passwordChanged: boolean
  lastLoginAt: string | null
  studentCount: number
  createdAt: string
}

export interface ParentStudentClass {
  id: string
  name: string
  grade: number
}

export interface ParentStudent {
  id: string
  studentCode: string
  name: string
  gender: string
  dob: string
  nation: string
  class: ParentStudentClass | null
}

/** GET /admin/parents/:id — có thêm isActive và danh sách con. */
export interface ParentDetail {
  id: number
  name: string
  email: string
  firstLogin: boolean
  passwordChanged: boolean
  lastLoginAt: string | null
  isActive: boolean
  createdAt: string
  students: ParentStudent[]
}

export interface ParentListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ParentListResponse {
  data: Parent[]
  meta: ParentListMeta
}

export interface ParentQueryParams {
  search?: string
  status?: ParentAccountStatus
  page?: number
  limit?: number
}

/** POST /admin/parents/:id/students */
export interface LinkStudentResult {
  message: string
  data: {
    id: string
    studentCode: string
    name: string
    parentId: number
  }
}

/** DELETE /admin/parents/:id/students/:studentId — POST /:id/reset-password */
export interface ParentMessageResult {
  message: string
}

/**
 * Quy 3 cờ của backend về một trạng thái duy nhất để hiển thị.
 * Thứ tự ưu tiên khớp với bộ lọc của backend: đổi mật khẩu > đã đăng nhập > chưa đăng nhập.
 */
export function getParentStatus(parent: {
  firstLogin: boolean
  passwordChanged: boolean
}): ParentAccountStatus {
  if (parent.passwordChanged) return 'PASSWORD_CHANGED'
  if (!parent.firstLogin) return 'LOGGED_IN'
  return 'NOT_LOGIN'
}

/** Một tài khoản phụ huynh vừa được hệ thống sinh ra. */
export interface GeneratedParentAccount {
  studentId: string
  studentCode: string
  studentName: string
  email: string
  /** Mật khẩu mặc định (ngày sinh học sinh, ddMMyyyy) — backend chỉ trả về lúc tạo. */
  defaultPassword: string
  /** CREATED = tạo tài khoản mới, LINKED = nối lại tài khoản đã có cùng email. */
  status: 'CREATED' | 'LINKED'
}

/** POST /admin/parents/generate — truyền một trong ba: studentId, studentIds hoặc classId. */
export interface GenerateParentAccountPayload {
  studentId?: string
  studentIds?: string[]
  classId?: string
}

export interface GenerateParentAccountResult {
  message: string
  total: number
  created: number
  linked: number
  skipped: number
  accounts: GeneratedParentAccount[]
  errors: { studentId: string; studentCode: string; message: string }[]
}
