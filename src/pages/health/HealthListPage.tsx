import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { IconPlus } from '@/components/ui/Icon'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { TableFooter } from '@/components/ui/TableFooter'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useHealthRecords } from '@/hooks/useHealthRecords'
import { usePagination } from '@/hooks/usePagination'
import { formatDate, formatNumber } from '@/lib/format'
import { HealthStatusBadge } from '@/pages/health/HealthStatusBadge'
import { ROUTES } from '@/routes/paths'
import { HEALTH_STATUSES, HEALTH_STATUS_LABELS, type HealthStatus } from '@/types/health'

export function HealthListPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useHealthRecords()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<HealthStatus | ''>('')

  const all = useMemo(() => data ?? [], [data])

  const records = useMemo(() => {
    const needle = keyword.trim().toLowerCase()
    const filtered = all.filter((record) => {
      if (statusFilter && record.status !== statusFilter) return false
      if (needle && !(record.student?.name ?? '').toLowerCase().includes(needle)) return false
      return true
    })
    return [...filtered].sort(
      (a, b) => b.year - a.year || b.month - a.month || b.createdAt.localeCompare(a.createdAt),
    )
  }, [all, keyword, statusFilter])

  const paged = usePagination(records)

  const normalCount = all.filter((record) => record.status === 'NORMAL').length
  const underweightCount = all.filter((record) => record.status === 'UNDERWEIGHT').length
  const overweightCount = all.filter(
    (record) => record.status === 'OVERWEIGHT' || record.status === 'OBESE',
  ).length

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

  const hasFilter = Boolean(keyword || statusFilter)

  return (
    <>
      <PageHeader
        title="Hồ sơ sức khoẻ"
        subtitle="Kết quả từng lần đo chiều cao, cân nặng và đánh giá BMI của học sinh."
      />

      <div className="stat-grid">
        <StatCard label="Tổng lần đo" value={all.length} />
        <StatCard label="Bình thường" value={normalCount} />
        <StatCard label="Thiếu cân" value={underweightCount} />
        <StatCard label="Thừa cân & béo phì" value={overweightCount} />
      </div>

      <div className="toolbar">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="Tìm theo tên học sinh..."
        />
        <select
          className="field__control"
          style={{ maxWidth: 240 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as HealthStatus | '')}
          aria-label="Lọc theo đánh giá"
        >
          <option value="">Tất cả đánh giá</option>
          {HEALTH_STATUSES.map((status) => (
            <option key={status} value={status}>
              {HEALTH_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <Button onClick={() => navigate(ROUTES.healthCreate)}>
          <IconPlus size={16} />
          Thêm hồ sơ
        </Button>
      </div>

      <Card flush>
        {paged.items.length === 0 ? (
          <EmptyState
            message={hasFilter ? 'Không có hồ sơ phù hợp bộ lọc.' : 'Chưa có hồ sơ nào.'}
            action={!hasFilter && <Link to={ROUTES.healthCreate}>Thêm hồ sơ đầu tiên</Link>}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table__index">STT</th>
                    <th>Học sinh</th>
                    <th>Kỳ đo</th>
                    <th>Chiều cao (cm)</th>
                    <th>Cân nặng (kg)</th>
                    <th>BMI</th>
                    <th>Đánh giá</th>
                    <th>Ghi chú</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((record, index) => (
                    <tr key={record.id}>
                      <td className="table__index">{paged.from + index}</td>
                      <td>{record.student?.name ?? record.studentId}</td>
                      <td>
                        {String(record.month).padStart(2, '0')}/{record.year}
                      </td>
                      <td>{formatNumber(record.height)}</td>
                      <td>{formatNumber(record.weight)}</td>
                      <td>{formatNumber(record.bmi)}</td>
                      <td>
                        <HealthStatusBadge status={record.status} />
                      </td>
                      <td>{record.note || '—'}</td>
                      <td>{formatDate(record.createdAt)}</td>
                    </tr>
                  ))}
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
              unit="hồ sơ"
            />
          </>
        )}
      </Card>
    </>
  )
}
