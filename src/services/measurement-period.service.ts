import { api } from '@/lib/http'
import type {
  MeasurementPeriod,
  MeasurementPeriodPayload,
  MeasurementStatus,
} from '@/types/measurement-period'

/**
 * Khớp với MeasurementPeriodController: @Controller('v1/measurement-periods')
 *
 * LƯU Ý backend: module này CHƯA được đăng ký trong `app.module.ts` (dòng import bị comment),
 * và class trong `measurement-period.module.ts` đang đặt tên trùng `SchoolYearModule`.
 * Trước khi các endpoint dưới đây chạy được, backend cần đổi tên class thành
 * `MeasurementPeriodModule` rồi thêm vào mảng `imports` của AppModule — nếu không sẽ luôn 404.
 * Ngoài ra `delete()` ở service thiếu `{ where: { id } }` nên DELETE sẽ lỗi.
 */
export const measurementPeriodService = {
  list: () => api.get<MeasurementPeriod[]>('/v1/measurement-periods'),

  getById: (id: string) => api.get<MeasurementPeriod>(`/v1/measurement-periods/${id}`),

  create: (payload: MeasurementPeriodPayload) =>
    api.post<MeasurementPeriod>('/v1/measurement-periods', payload),

  update: (id: string, payload: MeasurementPeriodPayload) =>
    api.patch<MeasurementPeriod>(`/v1/measurement-periods/${id}`, payload),

  updateStatus: (id: string, status: MeasurementStatus) =>
    api.patch<MeasurementPeriod>(`/v1/measurement-periods/${id}/status`, { status }),

  remove: (id: string) => api.delete<MeasurementPeriod>(`/v1/measurement-periods/${id}`),
}
