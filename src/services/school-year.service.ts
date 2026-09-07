import { api } from '@/lib/http'
import type { SchoolYear, SchoolYearPayload } from '@/types/school-year'

/**
 * Khớp với yearController: @Controller('v1/year')
 *
 * LƯU Ý backend:
 *  - `PUT /v1/year/:id/isAvtive` — tên route ở backend đang viết sai chính tả
 *    ("isAvtive" thay vì "isActive"). Giữ nguyên ở đây để gọi được; sửa cả hai nơi khi backend đổi.
 *  - `deleteYear` ở service đang gọi `prisma.schoolYear.delete(id)` thiếu `{ where: { id } }`
 *    nên endpoint DELETE sẽ lỗi cho tới khi backend sửa.
 */
export const schoolYearService = {
  list: () => api.get<SchoolYear[]>('/v1/year'),

  getById: (id: string) => api.get<SchoolYear>(`/v1/year/${id}`),

  create: (payload: SchoolYearPayload) => api.post<SchoolYear>('/v1/year', payload),

  update: (id: string, payload: SchoolYearPayload) =>
    api.put<SchoolYear>(`/v1/year/${id}`, payload),

  /** Đặt năm học này thành năm đang áp dụng (backend tự tắt isActive của các năm còn lại). */
  activate: (id: string) => api.put<SchoolYear>(`/v1/year/${id}/isAvtive`),

  remove: (id: string) => api.delete<SchoolYear>(`/v1/year/${id}`),
}
