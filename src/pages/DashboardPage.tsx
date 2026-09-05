import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import { HealthStatusBadge } from '@/pages/health/HealthStatusBadge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useHealthRecords } from '@/hooks/useHealthRecords'
import { useStudents } from '@/hooks/useStudents'
import { formatNumber } from '@/lib/format'
import { ROUTES } from '@/routes/paths'
import type { HealthRecord } from '@/types/health'

function latestFirst(records: HealthRecord[]): HealthRecord[] {
  return [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function DashboardPage() {
  const students = useStudents()
  const health = useHealthRecords()

  const isLoading = students.isLoading || health.isLoading
  const error = students.error ?? health.error

  if (isLoading) return <Loading />
  if (error) return <ErrorState message={getErrorMessage(error)} />

  const studentList = students.data ?? []
  const records = health.data ?? []
  const abnormal = records.filter((record) => record.status !== 'NORMAL').length
  const recent = latestFirst(records).slice(0, 5)

  return (
    <>
      <PageHeader title="Tổng quan" subtitle="Số liệu nhanh về học sinh và hồ sơ sức khoẻ" />

      <div className="stat-grid">
        <StatCard label="Học sinh" value={studentList.length} />
        <StatCard label="Hồ sơ sức khoẻ" value={records.length} />
        <StatCard label="Cần theo dõi" value={abnormal} />
      </div>

      <Card title="Hồ sơ sức khoẻ gần đây" flush>
        {recent.length === 0 ? (
          <EmptyState
            message="Chưa có hồ sơ nào."
            action={<Link to={ROUTES.healthCreate}>Thêm hồ sơ đầu tiên</Link>}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Kỳ</th>
                  <th>Cao (cm)</th>
                  <th>Nặng (kg)</th>
                  <th>BMI</th>
                  <th>Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((record) => (
                  <tr key={record.id}>
                    <td>{record.student?.name ?? record.studentId}</td>
                    <td>
                      {record.month}/{record.year}
                    </td>
                    <td>{formatNumber(record.height)}</td>
                    <td>{formatNumber(record.weight)}</td>
                    <td>{formatNumber(record.bmi)}</td>
                    <td>
                      <HealthStatusBadge status={record.status} />
                    </td>
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
