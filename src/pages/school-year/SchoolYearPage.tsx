import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  IconActivity,
  IconBuilding,
  IconCalendar,
  IconPlus,
  IconStudents,
} from '@/components/ui/Icon'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { TableFooter } from '@/components/ui/TableFooter'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { usePagination } from '@/hooks/usePagination'
import { useSchoolYears } from '@/hooks/useSchoolYears'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/routes/paths'
import { getSchoolYearStatus, type SchoolYearStatus } from '@/types/school-year'

/* ─── trạng thái ──────────────────────────────────────────── */
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

/* ─── component ──────────────────────────────────────────── */
export function SchoolYearPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useSchoolYears()
  const [keyword, setKeyword] = useState('')

  const years = useMemo(() => data ?? [], [data])

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase()
    const list = needle ? years.filter((y) => y.name.toLowerCase().includes(needle)) : years
    return [...list].sort((a, b) => b.startDate.localeCompare(a.startDate))
  }, [years, keyword])

  const paged = usePagination(filtered)
  const activeYear = years.find((y) => y.isActive)

  if (isLoading) return <Loading />
  if (error) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        action={
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            Thử lại
          </Button>
        }
      />
    )
  }

  return (
    <>
      <PageHeader
        title="Năm học"
        subtitle="Quản lý và theo dõi thông tin các năm học trên hệ thống"
        actions={
          <Button onClick={() => navigate(ROUTES.schoolYearCreate)}>
            <IconPlus size={16} />
            Thiết lập năm học mới
          </Button>
        }
      />

      {/* ── Hero: năm đang diễn ra ── */}
      {activeYear && (
        <div style={{ marginBottom: 24 }}>
          <Card>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 8 }}>
                <span className="school-year-hero__badge">
                  <IconActivity size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                  NĂM HỌC ĐANG DIỄN RA
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: 40, fontWeight: 700, margin: '4px 0 8px', letterSpacing: '-0.5px' }}>
                    {activeYear.name}
                  </h2>
                  <span style={{ color: 'var(--color-muted)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <IconCalendar size={14} />
                    {formatDate(activeYear.startDate)} – {formatDate(activeYear.endDate)}
                  </span>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <div className="school-year-hero__stat">
                      <span className="school-year-hero__stat-icon" style={{ color: 'var(--color-primary)' }}>
                        <IconBuilding size={22} />
                      </span>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{activeYear.classCount ?? 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Lớp học</div>
                      </div>
                    </div>
                    <div className="school-year-hero__stat">
                      <span className="school-year-hero__stat-icon" style={{ color: 'var(--color-primary)' }}>
                        <IconStudents size={22} />
                      </span>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{activeYear.studentCount ?? 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Học sinh</div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={() => navigate(`/school-years/${activeYear.id}`)}>
                  Xem chi tiết →
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{ marginBottom: 16 }}>
        <SearchInput value={keyword} onChange={setKeyword} placeholder="Tìm kiếm năm học" />
      </div>

      {/* ── Danh sách ── */}
      <Card flush>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Danh sách năm học</span>{' '}
          <Badge tone="neutral">{filtered.length} niên khoá</Badge>
        </div>

        {paged.items.length === 0 ? (
          <EmptyState
            message={keyword ? 'Không tìm thấy năm học phù hợp.' : 'Chưa có năm học nào.'}
            action={
              !keyword && (
                <Button size="sm" onClick={() => navigate(ROUTES.schoolYearCreate)}>
                  Thiết lập năm học đầu tiên
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>NĂM HỌC</th>
                    <th>THỜI GIAN</th>
                    <th style={{ textAlign: 'center' }}>SỐ LỚP</th>
                    <th style={{ textAlign: 'center' }}>SỐ HỌC SINH</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((year) => {
                    const status = getSchoolYearStatus(year)
                    return (
                      <tr key={year.id}>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                            <IconCalendar size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                            {year.name}
                          </span>
                        </td>
                        <td style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                          {formatDate(year.startDate)} – {formatDate(year.endDate)}
                        </td>
                        <td style={{ textAlign: 'center' }}>{year.classCount ?? 0}</td>
                        <td style={{ textAlign: 'center' }}>{year.studentCount ?? 0}</td>
                        <td>
                          <Badge tone={STATUS_TONE[status]}>
                            {status === 'active' && (
                              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'currentColor', marginRight: 5 }} />
                            )}
                            {STATUS_LABEL[status]}
                          </Badge>
                        </td>
                        <td>
                          <div className="table__actions">
                            <Button
                              variant="soft"
                              size="sm"
                              onClick={() => navigate(`/school-years/${year.id}`)}
                            >
                              Xem chi tiết →
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <TableFooter
              from={paged.from}
              to={paged.to}
              total={paged.total}
              page={paged.page}
              pageCount={paged.pageCount}
              onPageChange={paged.setPage}
              pageSize={paged.pageSize}
              onPageSizeChange={paged.setPageSize}
              unit="niên khoá"
            />
          </>
        )}
      </Card>
    </>
  )
}
