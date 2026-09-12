import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ErrorState, Loading } from '@/components/ui/States'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useSchoolYear } from '@/hooks/useSchoolYears'
import { formatDate } from '@/lib/format'
import { getSchoolYearStatus, type SchoolYearStatus } from '@/types/school-year'

interface SchoolYearDetailModalProps {
  open: boolean
  /** undefined khi modal đóng — query bên dưới sẽ tự tắt. */
  yearId?: string
  onClose: () => void
  onEdit?: (id: string) => void
  onActivate?: (id: string) => void
}

const STATUS_LABEL: Record<SchoolYearStatus, string> = {
  active: 'Đang diễn ra',
  upcoming: 'Đang chuẩn bị',
  ended: 'Đã kết thúc',
}

const STATUS_TONE: Record<SchoolYearStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  upcoming: 'warning',
  ended: 'neutral',
}

export function SchoolYearDetailModal({
  open,
  yearId,
  onClose,
  onEdit,
  onActivate,
}: SchoolYearDetailModalProps) {
  // Chỉ gọi API khi modal đang mở để tránh nạp thừa lúc đóng.
  const id = open ? yearId : undefined
  const { data, isLoading, error, refetch } = useSchoolYear(id)

  const status = data ? getSchoolYearStatus(data) : null

  return (
    <Modal open={open} title={data ? `Năm học ${data.name}` : 'Chi tiết năm học'} size="lg" onClose={onClose}>
      {isLoading ? (
        <Loading />
      ) : error != null ? (
        <ErrorState
          message={getErrorMessage(error)}
          action={
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : data == null ? null : (
        <>
          {/* Thông tin tổng quan */}
          <div className="stat-grid">
            <div className="card stat">
              <div className="stat__label">Trạng thái</div>
              <div className="stat__value" style={{ fontSize: 16 }}>
                {status && (
                  <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
                )}
              </div>
            </div>
            <div className="card stat">
              <div className="stat__label">Thời gian</div>
              <div className="stat__value" style={{ fontSize: 15 }}>
                {formatDate(data.startDate)} – {formatDate(data.endDate)}
              </div>
            </div>
            <div className="card stat">
              <div className="stat__label">Số lớp</div>
              <div className="stat__value">{data.classCount ?? '—'}</div>
            </div>
            <div className="card stat">
              <div className="stat__label">Số học sinh</div>
              <div className="stat__value">{data.studentCount ?? '—'}</div>
            </div>
          </div>
        </>
      )}

      <div className="form-actions">
        {data && onEdit && (
          <Button variant="secondary" onClick={() => { onClose(); onEdit(data.id) }}>
            Chỉnh sửa
          </Button>
        )}
        {data && !data.isActive && onActivate && (
          <Button onClick={() => { onClose(); onActivate(data.id) }}>
            Đặt làm năm đang áp dụng
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  )
}
