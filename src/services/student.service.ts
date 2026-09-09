import { api } from '@/lib/http'
import type { ImportStudentsResult, Student, StudentPayload } from '@/types/student'

/** Khớp với studentController: @Controller('student') */
export const studentService = {
  list: () => api.get<Student[]>('/student'),

  getById: (id: string) => api.get<Student>(`/student/${id}`),

  create: (payload: StudentPayload) => api.post<Student>('/student', payload),

  update: (id: string, payload: StudentPayload) => api.put<Student>(`/student/${id}`, payload),

  remove: (id: string) => api.delete<Student>(`/student/${id}`),

  /**
   * Upload file Excel danh sách học sinh cho một lớp.
   * Backend dùng FileInterceptor('file') + body `classId`, giới hạn 5MB, chỉ nhận .xlsx/.xls.
   *
   * LƯU Ý: phải ghi đè Content-Type, nếu để 'application/json' mặc định của httpClient
   * thì axios sẽ tự chuyển FormData thành JSON và backend không nhận được file.
   */
  importExcel: (file: File, classId: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('classId', classId)

    return api.post<ImportStudentsResult>('/student/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000,
    })
  },
}
