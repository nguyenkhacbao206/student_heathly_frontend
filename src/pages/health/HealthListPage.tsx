import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useHealthRecords } from '@/hooks/useHealthRecords'
import { formatDate, formatNumber } from '@/lib/format'
import { HealthStatusBadge } from '@/pages/health/HealthStatusBadge'
import { ROUTES } from '@/routes/paths'
import { HEALTH_STATUSES, HEALTH_STATUS_LABELS, type HealthStatus } from '@/types/health'

export function HealthListPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useHealthRecords()
  const [statusFilter, setStatusFilter] = useState<HealthStatus | ''>('')

  const records = useMemo(() => {
    const list = data ?? []
    const filtered = statusFilter ? list.filter((r) => r.status === statusFilter) : list
    return [...filtered].sort(
      (a, b) => b.year - a.year || b.month - a.month || b.createdAt.localeCompare(a.createdAt),
    )
  }, [data, statusFilter])

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
        title="Hồ sơ sức khoẻ"
        subtitle={`${data?.length ?? 0} lần đo được ghi nhận`}
        actions={<Button onClick={() => navigate(ROUTES.healthCreate)}>+ Thêm hồ sơ</Button>}
      />

      <Card flush>
        <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
          <select
            className="field__control"
            style={{ maxWidth: 240 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as HealthStatus | '')}
          >
            <option value="">Tất cả đánh giá</option>
            {HEALTH_STATUSES.map((status) => (
              <option key={status} value={status}>
                {HEALTH_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        {records.length === 0 ? (
          <EmptyState
            message={statusFilter ? 'Không có hồ sơ phù hợp bộ lọc.' : 'Chưa có hồ sơ nào.'}
            action={!statusFilter && <Link to={ROUTES.healthCreate}>Thêm hồ sơ đầu tiên</Link>}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
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
                {records.map((record) => (
                  <tr key={record.id}>
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
        )}
      </Card>
    </>
  )
}
