import { useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  IconActivity,
  IconBuilding,
  IconCalendar,
  IconInfo,
  IconStudents,
  IconTag,
  IconTeacher,
} from '@/components/ui/Icon'
import { ErrorState, Loading } from '@/components/ui/States'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useSchoolYear } from '@/hooks/useSchoolYears'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/routes/paths'
import { getSchoolYearStatus, type SchoolYearStatus } from '@/types/school-year'

/* ─── helpers ── */
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

/* ─── stat icon wrapper ── */
function StatIcon({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 36, height: 36, borderRadius: 8,
      background: 'var(--color-primary-soft)', color: 'var(--color-primary)',
      flexShrink: 0,
    }}>
      {children}
    </span>
  )
}

/* ─── component ── */
export function SchoolYearDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: year, isLoading, error, refetch } = useSchoolYear(id)

  if (isLoading) return <Loading />
  if (error || !year) {
    return (
      <ErrorState
        message={error ? getErrorMessage(error) : 'Không tìm thấy năm học.'}
        action={
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            Thử lại
          </Button>
        }
      />
    )
  }

  const status = getSchoolYearStatus(year)

  return (
    <>
      {/* ── Back ── */}
      <button
        type="button"
        className="school-year-create__back"
        onClick={() => navigate(ROUTES.schoolYears)}
      >
        ← Quay lại danh sách năm học
      </button>

      {/* ── Title ── */}
      <header className="page-header" style={{ marginTop: 10 }}>
        <div>
          <h1 className="page-header__title">Năm học {year.name}</h1>
          <p className="page-header__subtitle">
            Thiết lập thông tin và dữ liệu nền cho năm học tiếp theo trước khi năm học chính thức bắt đầu.
          </p>
        </div>
        <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
      </header>

      {/* ── 4 Stat cards ── */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card stat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <span className="stat__label">LỚP HỌC</span>
            <StatIcon><IconBuilding size={18} /></StatIcon>
          </div>
          <div className="stat__value">{year.classCount ?? 0}</div>
          <div style={{ fontSize: 12, color: 'var(--color-faint)', marginTop: 6 }}>
            ○ {(year.classCount ?? 0) === 0 ? 'Chưa khởi tạo danh sách lớp' : `${year.classCount} lớp đã tạo`}
          </div>
        </div>

        <div className="card stat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <span className="stat__label">HỌC SINH</span>
            <StatIcon><IconStudents size={18} /></StatIcon>
          </div>
          <div className="stat__value">{year.studentCount ?? 0}</div>
          <div style={{ fontSize: 12, color: 'var(--color-faint)', marginTop: 6 }}>
            ○ {(year.studentCount ?? 0) === 0 ? 'Chưa phân bổ học sinh vào năm' : `${year.studentCount} học sinh`}
          </div>
        </div>

        <div className="card stat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <span className="stat__label">GIÁO VIÊN</span>
            <StatIcon><IconTeacher size={18} /></StatIcon>
          </div>
          <div className="stat__value">0</div>
          <div style={{ fontSize: 12, color: 'var(--color-faint)', marginTop: 6 }}>
            ○ Chưa phân công GVCN / Cán bộ
          </div>
        </div>

        <div className="card stat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <span className="stat__label">ĐỢT KHÁM &amp; ĐO THỂ CHẤT</span>
            <StatIcon><IconActivity size={18} /></StatIcon>
          </div>
          <div className="stat__value">0</div>
          <div style={{ fontSize: 12, color: 'var(--color-faint)', marginTop: 6 }}>
            ○ Chưa lên lịch khám định kỳ
          </div>
        </div>
      </div>

      {/* ── Thông tin chung ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card__header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconInfo size={16} style={{ color: 'var(--color-primary)' }} />
          Thông tin chung
        </div>
        <div className="card__body" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                { icon: <IconCalendar size={15} />, label: 'Năm học', value: year.name },
                { icon: <IconCalendar size={15} />, label: 'Ngày bắt đầu', value: formatDate(year.startDate) },
                { icon: <IconCalendar size={15} />, label: 'Ngày kết thúc', value: formatDate(year.endDate) },
                {
                  icon: <IconTag size={15} />,
                  label: 'Trạng thái',
                  value: <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>,
                },
              ].map(({ icon, label, value }, i, arr) => (
                <tr
                  key={label}
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                >
                  <td style={{ width: 200, padding: '14px 18px', color: 'var(--color-muted)', fontSize: 13.5 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {icon} {label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 500 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Dữ liệu thuộc năm học ── */}
      <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Dữ liệu thuộc năm học</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          {
            icon: <IconBuilding size={20} />,
            title: 'Quản lý Lớp & Học sinh',
            desc: 'Tạo danh sách lớp mới, thực hiện tác vụ kế thừa lên lớp từ khoá trước, nhập danh sách học sinh từ Excel hoặc đồng bộ Cơ sở dữ liệu ngành.',
            label: 'Đến Quản lý Lớp & Học sinh →',
            to: ROUTES.classes,
          },
          {
            icon: <IconTeacher size={20} />,
            title: 'Quản lý giáo viên',
            desc: 'Phân công giáo viên chủ nhiệm từng lớp, chỉ định cán bộ y tế trường học phụ trách theo dõi hồ sơ sức khoẻ và cấp quyền truy cập sổ tiêm.',
            label: 'Đến Quản lý Giáo viên →',
            to: ROUTES.staff,
          },
          {
            icon: <IconActivity size={20} />,
            title: 'Đợt đo thể chất & Khám SK',
            desc: 'Thiết lập đợt khám sức khoẻ định kỳ I & II, cấu hình danh mục chỉ số đo lường (chiều cao, cân nặng, BMI, thị lực, nha học đường).',
            label: 'Đến Cấu hình Đợt đo →',
            to: ROUTES.measurementPeriods,
          },
        ].map(({ icon, title, desc, label, to }) => (
          <div key={title} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card__header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
              <span style={{ fontWeight: 600 }}>{title}</span>
            </div>
            <div className="card__body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.6 }}>{desc}</p>
              <Button variant="secondary" size="sm" onClick={() => navigate(to)}>
                {label}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
