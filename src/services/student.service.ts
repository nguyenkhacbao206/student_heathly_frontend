import { api } from '@/lib/http'
import type { Student, StudentPayload } from '@/types/student'

/** Khớp với studentController: @Controller('student') */
export const studentService = {
  list: () => api.get<Student[]>('/student'),

  getById: (id: string) => api.get<Student>(`/student/${id}`),

  create: (payload: StudentPayload) => api.post<Student>('/student', payload),

  update: (id: string, payload: StudentPayload) => api.put<Student>(`/student/${id}`, payload),

  remove: (id: string) => api.delete<Student>(`/student/${id}`),
}
