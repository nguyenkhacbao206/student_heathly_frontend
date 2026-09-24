import { api } from '@/lib/http'
import type {
  GenerateParentAccountPayload,
  GenerateParentAccountResult,
  LinkStudentResult,
  ParentDetail,
  ParentListResponse,
  ParentMessageResult,
  ParentQueryParams,
} from '@/types/parent'

const BASE = '/admin/parents'

/**
 * Khớp với ParentController: @Controller('admin/parents')
 *
 * Lưu ý: backend phân trang ngay trên server (trả { data, meta }), khác với
 * /class hay /student trả mảng thô — nên trang danh sách phải truyền page/limit.
 */
export const parentService = {
  list: (params?: ParentQueryParams) => api.get<ParentListResponse>(BASE, { params }),

  getById: (id: number) => api.get<ParentDetail>(`${BASE}/${id}`),

  /**
   * Tạo bù tài khoản phụ huynh cho học sinh đã có sẵn trong DB.
   * Học sinh nhập mới (import Excel / POST /student) đã được cấp tài khoản tự động.
   */
  generate: (payload: GenerateParentAccountPayload) =>
    api.post<GenerateParentAccountResult>(`${BASE}/generate`, payload),

  /**
   * Đặt lại mật khẩu về ngày sinh của một học sinh thuộc chính phụ huynh đó
   * (định dạng ddMMyyyy). Backend đặt lại firstLogin = true, passwordChanged = false.
   */
  resetPassword: (id: number, studentId: string) =>
    api.post<ParentMessageResult>(`${BASE}/${id}/reset-password`, { studentId }),

  /** Backend từ chối nếu học sinh đã gắn với phụ huynh khác (409). */
  linkStudent: (id: number, studentId: string) =>
    api.post<LinkStudentResult>(`${BASE}/${id}/students`, { studentId }),

  unlinkStudent: (id: number, studentId: string) =>
    api.delete<ParentMessageResult>(`${BASE}/${id}/students/${studentId}`),
}
