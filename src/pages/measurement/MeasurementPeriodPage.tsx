import { useMemo, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { IconPlus } from '@/components/ui/Icon'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { TableFooter } from '@/components/ui/TableFooter'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import {
  useDeleteMeasurementPeriod,
  useMeasurementPeriods,
  useUpdateMeasurementStatus,
} from '@/hooks/useMeasurementPeriods'
import { usePagination } from '@/hooks/usePagination'
import { useSchoolYears } from '@/hooks/useSchoolYears'
import { formatDate } from '@/lib/format'
import { MeasurementPeriodFormModal } from '@/pages/measurement/MeasurementPeriodFormModal'
import {
  MEASUREMENT_STATUSES,
  MEASUREMENT_STATUS_LABELS,
  type MeasurementPeriod,
  type MeasurementStatus,
} from '@/types/measurement-period'

const STATUS_TONES: Record<MeasurementStatus, BadgeTone> = {
  UPCOMING: 'info',
  OPEN: 'success',
  CLOSED: 'neutral',
}

export function MeasurementPeriodPage() {
  const { data, isLoading, error, refetch } = useMeasurementPeriods()
  const { data: schoolYears } = useSchoolYears()
  const updateStatus = useUpdateMeasurementStatus()
  const remove = useDeleteMeasurementPeriod()

  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<MeasurementStatus | ''>('')
  const [yearFilter, setYearFilter] = useState('')
  const [editing, setEditing] = useState<MeasurementPeriod | undefined>()
  const [modalOpen, setModalOpen] = useState(false)

  const periods = useMemo(() => data ?? [], [data])

  // GET /v1/measurement-periods không include schoolYear -> tự ghép tên năm học ở FE.
  const yearNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const year of schoolYears ?? []) map.set(year.id, year.name)
    return map
  }, [schoolYears])

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase()
    const list = periods.filter((period) => {
      if (statusFilter && period.status !== statusFilter) return false
      if (yearFilter && period.schoolYearId !== yearFilter) return false
      if (needle && !period.name.toLowerCase().includes(needle)) return false
      return true
    })
    return [...list].sort((a, b) => b.startDate.localeCompare(a.startDate) || b.month - a.month)
  }, [periods, keyword, statusFilter, yearFilter])

  const paged = usePagination(filtered)
  const openCount = periods.filter((period) => period.status === 'OPEN').length
  const upcomingCount = periods.filter((period) => period.status === 'UPCOMING').length

  function openCreate() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(period: MeasurementPeriod) {
    setEditing(period)
    setModalOpen(true)
  }

  function handleStatusChange(period: MeasurementPeriod, status: MeasurementStatus) {
    if (status === period.status) return
    updateStatus.mutate({ id: period.id, status })
  }

  function handleRemove(period: MeasurementPeriod) {
    if (!window.confirm(`Xoá đợt đo "${period.name}"? Thao tác không thể hoàn tác.`)) return
    remove.mutate(period.id)
  }

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

  const mutationError = updateStatus.error ?? remove.error
  const hasFilter = Boolean(keyword || statusFilter || yearFilter)

  return (
    <>
      <PageHeader
        title="Đợt đo"
        subtitle="Mỗi đợt đo thuộc một năm học và mở/đóng việc nhập hồ sơ sức khoẻ."
      />

      <div className="stat-grid">
        <StatCard label="Tổng số đợt đo" value={periods.length} />
        <StatCard label="Đang mở" value={openCount} />
        <StatCard label="Sắp diễn ra" value={upcomingCount} />
      </div>

      <div className="toolbar">
        <SearchInput value={keyword} onChange={setKeyword} placeholder="Tìm theo tên đợt đo..." />
        <select
          className="field__control"
          style={{ maxWidth: 220 }}
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          aria-label="Lọc theo năm học"
        >
          <option value="">Tất cả năm học</option>
          {(schoolYears ?? []).map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </select>
        <select
          className="field__control"
          style={{ maxWidth: 200 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MeasurementStatus | '')}
          aria-label="Lọc theo trạng thái"
        >
          <option value="">Tất cả trạng thái</option>
          {MEASUREMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {MEASUREMENT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <Button onClick={openCreate}>
          <IconPlus size={16} />
          Thêm đợt đo
        </Button>
      </div>

      {mutationError != null && (
        <div style={{ marginBottom: 16 }}>
          <Alert message={getErrorMessage(mutationError)} />
        </div>
      )}

      <Card flush>
        {paged.items.length === 0 ? (
          <EmptyState
            message={hasFilter ? 'Không tìm thấy đợt đo phù hợp.' : 'Chưa có đợt đo nào.'}
            action={
              !hasFilter && (
                <Button size="sm" onClick={openCreate}>
                  Thêm đợt đo đầu tiên
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
                    <th className="table__index">STT</th>
                    <th>Đợt đo</th>
                    <th>Năm học</th>
                    <th>Tháng</th>
                    <th>Bắt đầu</th>
                    <th>Kết thúc</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((period, index) => {
                    const changing =
                      updateStatus.isPending && updateStatus.variables?.id === period.id
                    const removing = remove.isPending && remove.variables === period.id

                    return (
                      <tr key={period.id}>
                        <td className="table__index">{paged.from + index}</td>
                        <td>{period.name}</td>
                        <td>
                          {period.schoolYear?.name ??
                            yearNameById.get(period.schoolYearId) ??
                            period.schoolYearId}
                        </td>
                        <td>Tháng {period.month}</td>
                        <td>{formatDate(period.startDate)}</td>
                        <td>{formatDate(period.endDate)}</td>
                        <td>
                          <Badge tone={STATUS_TONES[period.status]}>
                            {MEASUREMENT_STATUS_LABELS[period.status]}
                          </Badge>
                        </td>
                        <td>
                          <div className="table__actions">
                            <select
                              className="field__control"
                              style={{ maxWidth: 150 }}
                              value={period.status}
                              disabled={changing}
                              onChange={(e) =>
                                handleStatusChange(period, e.target.value as MeasurementStatus)
                              }
                              aria-label={`Đổi trạng thái đợt đo ${period.name}`}
                            >
                              {MEASUREMENT_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {MEASUREMENT_STATUS_LABELS[status]}
                                </option>
                              ))}
                            </select>
                            <Button variant="soft" size="sm" onClick={() => openEdit(period)}>
                              Sửa
                            </Button>
                            <Button
                              variant="soft"
                              size="sm"
                              loading={removing}
                              onClick={() => handleRemove(period)}
                            >
                              Xoá
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
              unit="đợt đo"
            />
          </>
        )}
      </Card>

      <MeasurementPeriodFormModal
        open={modalOpen}
        period={editing}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
