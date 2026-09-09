import { api } from '@/lib/http'
import type { Teacher, TeacherPayload, TeacherStatus } from '@/types/teacher'

/**
 * Khớp với teacherController: @Controller('teacher')
 *
 * Khoá / mở khoá dùng route riêng `PUT /teacher/:id/status` với body `{ status }`
 * (TeacherStatus: ACTIVE = đang hoạt động, INACTIVE = đã khoá).
 */
export const teacherService = {
  list: () => api.get<Teacher[]>('/teacher'),

  getById: (id: string) => api.get<Teacher>(`/teacher/${id}`),

  create: (payload: TeacherPayload) => api.post<Teacher>('/teacher', payload),

  update: (id: string, payload: TeacherPayload) => api.put<Teacher>(`/teacher/${id}`, payload),

  updateStatus: (id: string, status: TeacherStatus) =>
    api.put<Teacher>(`/teacher/${id}/status`, { status }),

  remove: (id: string) => api.delete<Teacher>(`/teacher/${id}`),
}
