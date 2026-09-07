import { useMemo, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { IconPlus } from '@/components/ui/Icon'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { TableFooter } from '@/components/ui/TableFooter'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { usePagination } from '@/hooks/usePagination'
import {
  useActivateSchoolYear,
  useDeleteSchoolYear,
  useSchoolYears,
} from '@/hooks/useSchoolYears'
import { formatDate } from '@/lib/format'
import { SchoolYearFormModal } from '@/pages/school-year/SchoolYearFormModal'
import type { SchoolYear } from '@/types/school-year'

const PAGE_SIZE = 10

export function SchoolYearPage() {
  const { data, isLoading, error, refetch } = useSchoolYears()
  const activate = useActivateSchoolYear()
  const remove = useDeleteSchoolYear()
  const [keyword, setKeyword] = useState('')
  const [editing, setEditing] = useState<SchoolYear | undefined>()
  const [modalOpen, setModalOpen] = useState(false)

  const years = useMemo(() => data ?? [], [data])

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase()
    const list = needle ? years.filter((year) => year.name.toLowerCase().includes(needle)) : years
    // Năm mới nhất lên đầu.
    return [...list].sort((a, b) => b.startDate.localeCompare(a.startDate))
  }, [years, keyword])

  const paged = usePagination(filtered, PAGE_SIZE)
  const activeYear = years.find((year) => year.isActive)

  function openCreate() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(year: SchoolYear) {
    setEditing(year)
    setModalOpen(true)
  }

  function handleActivate(year: SchoolYear) {
    if (year.isActive) return
    if (!window.confirm(`Đặt "${year.name}" làm năm học đang áp dụng?`)) return
    activate.mutate(year.id)
  }

  function handleRemove(year: SchoolYear) {
    if (!window.confirm(`Xoá năm học "${year.name}"? Thao tác không thể hoàn tác.`)) return
    remove.mutate(year.id)
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

  const mutationError = activate.error ?? remove.error

  return (
    <>
      <PageHeader
        title="Năm học"
        subtitle="Mỗi thời điểm chỉ có một năm học được đặt là đang áp dụng."
      />

      <div className="stat-grid">
        <StatCard label="Tổng số năm học" value={years.length} />
        <StatCard label="Năm đang áp dụng" value={activeYear?.name ?? '—'} />
        <StatCard
          label="Kết thúc"
          value={activeYear ? formatDate(activeYear.endDate) : '—'}
        />
      </div>

      <div className="toolbar">
        <SearchInput value={keyword} onChange={setKeyword} placeholder="Tìm theo tên năm học..." />
        <Button onClick={openCreate}>
          <IconPlus size={16} />
          Thêm năm học
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
            message={keyword ? 'Không tìm thấy năm học phù hợp.' : 'Chưa có năm học nào.'}
            action={
              !keyword && (
                <Button size="sm" onClick={openCreate}>
                  Thêm năm học đầu tiên
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
                    <th>Năm học</th>
                    <th>Bắt đầu</th>
                    <th>Kết thúc</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((year, index) => {
                    const activating = activate.isPending && activate.variables === year.id
                    const removing = remove.isPending && remove.variables === year.id

                    return (
                      <tr key={year.id}>
                        <td className="table__index">{paged.from + index}</td>
                        <td>{year.name}</td>
                        <td>{formatDate(year.startDate)}</td>
                        <td>{formatDate(year.endDate)}</td>
                        <td>
                          <Badge tone={year.isActive ? 'success' : 'neutral'}>
                            {year.isActive ? 'Đang áp dụng' : 'Không áp dụng'}
                          </Badge>
                        </td>
                        <td>
                          <div className="table__actions">
                            <Button variant="soft" size="sm" onClick={() => openEdit(year)}>
                              Sửa
                            </Button>
                            <Button
                              variant="soft"
                              size="sm"
                              disabled={year.isActive}
                              loading={activating}
                              onClick={() => handleActivate(year)}
                            >
                              Đặt áp dụng
                            </Button>
                            <Button
                              variant="soft"
                              size="sm"
                              loading={removing}
                              onClick={() => handleRemove(year)}
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
              unit="năm học"
            />
          </>
        )}
      </Card>

      <SchoolYearFormModal
        open={modalOpen}
        schoolYear={editing}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
