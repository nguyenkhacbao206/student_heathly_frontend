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
import { useClasses, useDeleteClass } from '@/hooks/useClasses'
import { usePagination } from '@/hooks/usePagination'
import { useSchoolYears } from '@/hooks/useSchoolYears'
import { ClassDetailModal } from '@/pages/classes/ClassDetailModal'
import { ClassFormModal } from '@/pages/classes/ClassFormModal'
import { GRADES, type ClassItem } from '@/types/class'

export function ClassPage() {
  // Lọc theo năm học ngay trên server (GET /class?schoolYearId=...).
  const [yearFilter, setYearFilter] = useState('')
  const { data, isLoading, error, refetch } = useClasses(yearFilter || undefined)
  const { data: schoolYears } = useSchoolYears()
  const remove = useDeleteClass()

  const [keyword, setKeyword] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [editing, setEditing] = useState<ClassItem | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | undefined>()

  const classes = useMemo(() => data ?? [], [data])

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase()
    return classes.filter((item) => {
      if (gradeFilter && String(item.grade) !== gradeFilter) return false
      if (needle && !item.name.toLowerCase().includes(needle)) return false
      return true
    })
  }, [classes, keyword, gradeFilter])

  const paged = usePagination(filtered)
  const totalStudents = classes.reduce((sum, item) => sum + item.studentCount, 0)
  const currentYearCount = classes.filter((item) => item.isCurrentYear).length

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(item: ClassItem) {
    setEditing(item)
    setFormOpen(true)
  }

  function handleRemove(item: ClassItem) {
    if (!window.confirm(`Xoá lớp "${item.name}"? Thao tác không thể hoàn tác.`)) return
    remove.mutate(item.id)
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

  const hasFilter = Boolean(keyword || gradeFilter || yearFilter)

  return (
    <>
      <PageHeader
        title="Lớp học"
        subtitle="Mỗi lớp thuộc một năm học; tên lớp không được trùng trong cùng năm học."
      />

      <div className="stat-grid">
        <StatCard label="Tổng số lớp" value={classes.length} />
        <StatCard label="Lớp thuộc năm đang áp dụng" value={currentYearCount} />
        <StatCard label="Tổng sĩ số" value={totalStudents} />
      </div>

      <div className="toolbar">
        <SearchInput value={keyword} onChange={setKeyword} placeholder="Tìm theo tên lớp..." />
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
          style={{ maxWidth: 160 }}
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          aria-label="Lọc theo khối"
        >
          <option value="">Tất cả khối</option>
          {GRADES.map((grade) => (
            <option key={grade} value={grade}>
              Khối {grade}
            </option>
          ))}
        </select>
        <Button onClick={openCreate}>
          <IconPlus size={16} />
          Thêm lớp
        </Button>
      </div>

      {remove.error != null && (
        <div style={{ marginBottom: 16 }}>
          <Alert message={getErrorMessage(remove.error)} />
        </div>
      )}

      <Card flush>
        {paged.items.length === 0 ? (
          <EmptyState
            message={hasFilter ? 'Không tìm thấy lớp phù hợp.' : 'Chưa có lớp nào.'}
            action={
              !hasFilter && (
                <Button size="sm" onClick={openCreate}>
                  Thêm lớp đầu tiên
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
                    <th>Tên lớp</th>
                    <th>Khối</th>
                    <th>Năm học</th>
                    <th>Sĩ số</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((item, index) => {
                    const removing = remove.isPending && remove.variables === item.id

                    return (
                      <tr key={item.id}>
                        <td className="table__index">{paged.from + index}</td>
                        <td>{item.name}</td>
                        <td>Khối {item.grade}</td>
                        <td>
                          {item.schoolYearName}{' '}
                          {item.isCurrentYear && <Badge tone="success">Đang áp dụng</Badge>}
                        </td>
                        <td>
                          <Badge tone={item.studentCount > 0 ? 'info' : 'neutral'}>
                            {item.studentCount} học sinh
                          </Badge>
                        </td>
                        <td>
                          <div className="table__actions">
                            <Button variant="soft" size="sm" onClick={() => setDetailId(item.id)}>
                              Chi tiết
                            </Button>
                            <Button variant="soft" size="sm" onClick={() => openEdit(item)}>
                              Sửa
                            </Button>
                            <Button
                              variant="soft"
                              size="sm"
                              loading={removing}
                              onClick={() => handleRemove(item)}
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
              unit="lớp"
            />
          </>
        )}
      </Card>

      <ClassFormModal open={formOpen} classItem={editing} onClose={() => setFormOpen(false)} />

      <ClassDetailModal
        open={detailId != null}
        classId={detailId}
        onClose={() => setDetailId(undefined)}
      />
    </>
  )
}
