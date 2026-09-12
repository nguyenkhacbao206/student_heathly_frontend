import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { IconCalendar, IconInfo } from '@/components/ui/Icon'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useCreateSchoolYear } from '@/hooks/useSchoolYears'
import { toIsoDateTime } from '@/lib/format'
import { ROUTES } from '@/routes/paths'

export function SchoolYearCreatePage() {
  const navigate = useNavigate()
  const create = useCreateSchoolYear()

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [localError, setLocalError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      setLocalError('Vui lòng nhập tên năm học.')
      return
    }
    if (!startDate || !endDate) {
      setLocalError('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.')
      return
    }
    if (endDate <= startDate) {
      setLocalError('Ngày kết thúc phải sau ngày bắt đầu.')
      return
    }
    setLocalError('')

    // Tự sinh ID từ tên (vd: "2027 – 2028" → "2027-2028")
    const autoId = name.trim().replace(/\s*[–—-]\s*/g, '-').replace(/\s+/g, '-')

    create.mutate(
      {
        id: autoId,
        name: name.trim(),
        startDate: toIsoDateTime(startDate),
        enDate: toIsoDateTime(endDate),
        endDate: toIsoDateTime(endDate),
        isActive: false,
      },
      {
        onSuccess: () => navigate(ROUTES.schoolYears),
      },
    )
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      {/* ── Back ── */}
      <button
        type="button"
        className="school-year-create__back"
        onClick={() => navigate(ROUTES.schoolYears)}
      >
        ← Quay lại danh sách năm học
      </button>

      {/* ── Title ── */}
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: '16px 0 4px' }}>
        Thiết lập năm học mới
      </h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: 24, fontSize: 14 }}>
        Thiết lập thông tin và dữ liệu nền cho năm học tiếp theo trước khi năm học chính thức bắt đầu.
      </p>

      {/* ── Form card ── */}
      <form onSubmit={handleSubmit}>
        <div className="card school-year-create__card">
          {/* Section header */}
          <div className="school-year-create__section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconCalendar size={16} style={{ color: 'var(--color-primary)' }} />
              <strong>Thông tin năm học</strong>
              <span style={{ color: 'var(--color-muted)', fontSize: 13 }}>
                Khai báo thông số niên khoá nền tảng cho trường học.
              </span>
            </div>
            <span className="school-year-create__required-badge">Bắt buộc *</span>
          </div>

          <div style={{ padding: '24px' }}>
            {/* Error */}
            {(create.error != null || localError) && (
              <div style={{ marginBottom: 20 }}>
                <Alert
                  message={localError || getErrorMessage(create.error)}
                  details={localError ? [] : getErrorDetails(create.error)}
                />
              </div>
            )}

            {/* Năm học */}
            <div style={{ marginBottom: 20 }}>
              <TextField
                label="Năm học"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="2027 – 2028"
              />
            </div>

            {/* Ngày bắt đầu & kết thúc */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <TextField
                label="Ngày bắt đầu năm học"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <TextField
                label="Ngày kết thúc năm học"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Info note */}
            <div className="school-year-create__note">
              <span className="school-year-create__note-icon">
                <IconInfo size={16} />
              </span>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
                <strong>Lưu ý:</strong> Sau khi tạo, năm học mới sẽ ở trạng thái{' '}
                <strong>"Đang thiết lập"</strong> (Lớp: 0, Học sinh: 0). Bạn sẽ thiết lập danh sách
                lớp và phân bổ học sinh cho năm học này tại menu{' '}
                <a href="/classes" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                  Lớp &amp; học sinh
                </a>
                .
              </p>
            </div>

            {/* Actions */}
            <div className="form-actions" style={{ marginTop: 28, paddingTop: 0, borderTop: 'none' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(ROUTES.schoolYears)}
              >
                Huỷ
              </Button>
              <Button type="submit" loading={create.isPending}>
                Tạo năm học
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
