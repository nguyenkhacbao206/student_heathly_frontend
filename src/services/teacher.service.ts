import { api } from '@/lib/http'
import type { Teacher, TeacherPayload, TeacherStatus } from '@/types/teacher'

/**
 * Khớp với teacherController: @Controller('teacher')
 *
 * LƯU Ý backend: `teacher.controller.ts` đang khai báo hai handler cùng `@Put(':id')`
 * (updateTeacher và updateTeacherStatus) nên handler thứ hai bị handler thứ nhất che mất
 * → `updateStatus` bên dưới hiện sẽ rơi vào updateTeacher và KHÔNG đổi được status.
 * Cần đổi route status ở backend thành `@Put(':id/status')` (hoặc @Patch) rồi sửa lại path ở đây.
 */
export const teacherService = {
  list: () => api.get<Teacher[]>('/teacher'),

  getById: (id: string) => api.get<Teacher>(`/teacher/${id}`),

  create: (payload: TeacherPayload) => api.post<Teacher>('/teacher', payload),

  update: (id: string, payload: TeacherPayload) => api.put<Teacher>(`/teacher/${id}`, payload),

  updateStatus: (id: string, status: TeacherStatus) =>
    api.put<Teacher>(`/teacher/${id}`, { status }),

  remove: (id: string) => api.delete<Teacher>(`/teacher/${id}`),
}
