import { api } from '@/lib/http'
import type { ClassDetail, ClassItem, ClassPayload } from '@/types/class'
import type { Student } from '@/types/student'

/** Khớp với ClassController: @Controller('class') */
export const classService = {
  list: (schoolYearId?: string) =>
    api.get<ClassItem[]>('/class', {
      params: schoolYearId ? { schoolYearId } : undefined,
    }),

  getById: (id: string) => api.get<ClassDetail>(`/class/${id}`),

  /** Danh sách học sinh của lớp, backend đã sắp theo tên. */
  getStudents: (id: string) => api.get<Student[]>(`/class/${id}/students`),

  create: (payload: ClassPayload) => api.post<ClassItem>('/class', payload),

  update: (id: string, payload: ClassPayload) => api.put<ClassItem>(`/class/${id}`, payload),

  /** Backend từ chối xoá lớp còn học sinh hoặc còn giáo viên phụ trách. */
  remove: (id: string) => api.delete<ClassItem>(`/class/${id}`),
}
