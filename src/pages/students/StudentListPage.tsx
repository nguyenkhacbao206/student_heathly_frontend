import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { IconPlus } from '@/components/ui/Icon'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { TableFooter } from '@/components/ui/TableFooter'
import { StudentImportModal } from '@/pages/students/StudentImportModal'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useClasses } from '@/hooks/useClasses'
import { usePagination } from '@/hooks/usePagination'
import { useDeleteStudent, useStudents } from '@/hooks/useStudents'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/routes/paths'
import { GENDER_LABELS, type Gender } from '@/types/student'

export function StudentListPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useStudents()
  const classes = useClasses()
  const deleteStudent = useDeleteStudent()
  const [keyword, setKeyword] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [importOpen, setImportOpen] = useState(false)

  const all = useMemo(() => data ?? [], [data])

  // GET /student không include class -> tự ghép tên lớp ở FE.
  const classNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of classes.data ?? []) map.set(item.id, item.name)
    return map
  }, [classes.data])

  const students = useMemo(() => {
    const needle = keyword.trim().toLowerCase()
    return all.filter((student) => {
      if (classFilter && student.classId !== classFilter) return false
      if (
        needle &&
        !student.name.toLowerCase().includes(needle) &&
        !student.studentCode.toLowerCase().includes(needle)
      ) {
        return false
      }
      return true
    })
  }, [all, keyword, classFilter])

  const paged = usePagination(students)

  const maleCount = all.filter((student) => student.gender === 'MALE').length
  const femaleCount = all.filter((student) => student.gender === 'FEMALE').length
  const classCount = new Set(all.map((student) => student.classId)).size

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Xoá học sinh "${name}"? Hành động này không thể hoàn tác.`)) return
    deleteStudent.mutate(id)
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

  const hasFilter = Boolean(keyword || classFilter)

  return (
    <>
      <PageHeader title="Học sinh" subtitle="Danh sách học sinh toàn trường theo từng lớp." />

      <div className="stat-grid">
        <StatCard label="Tổng học sinh" value={all.length} />
        <StatCard label="Nam" value={maleCount} />
        <StatCard label="Nữ" value={femaleCount} />
        <StatCard label="Số lớp đang có học sinh" value={classCount} />
      </div>

      <div className="toolbar">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="Tìm theo tên hoặc mã học sinh..."
        />
        <select
          className="field__control"
          style={{ maxWidth: 220 }}
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          aria-label="Lọc theo lớp"
        >
          <option value="">Tất cả lớp</option>
          {(classes.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} — Khối {item.grade}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={() => setImportOpen(true)}>
          Nhập từ Excel
        </Button>
        <Button onClick={() => navigate(ROUTES.studentCreate)}>
          <IconPlus size={16} />
          Thêm học sinh
        </Button>
      </div>

      {deleteStudent.error != null && (
        <div style={{ marginBottom: 16 }}>
          <Alert message={getErrorMessage(deleteStudent.error)} />
        </div>
      )}

      <Card flush>
        {paged.items.length === 0 ? (
          <EmptyState
            message={hasFilter ? 'Không tìm thấy học sinh phù hợp.' : 'Chưa có học sinh nào.'}
            action={!hasFilter && <Link to={ROUTES.studentCreate}>Thêm học sinh đầu tiên</Link>}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table__index">STT</th>
                    <th>Mã HS</th>
                    <th>Họ tên</th>
                    <th>Lớp</th>
                    <th>Giới tính</th>
                    <th>Ngày sinh</th>
                    <th>Dân tộc</th>
                    <th>Địa chỉ</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((student, index) => (
                    <tr key={student.id}>
                      <td className="table__index">{paged.from + index}</td>
                      <td>{student.studentCode}</td>
                      <td>{student.name}</td>
                      <td>{classNameById.get(student.classId) ?? '—'}</td>
                      <td>{GENDER_LABELS[student.gender as Gender] ?? student.gender}</td>
                      <td>{formatDate(student.dob)}</td>
                      <td>{student.nation}</td>
                      <td>{student.address || '—'}</td>
                      <td>
                        <div className="table__actions">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(ROUTES.studentEdit(student.id))}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={
                              deleteStudent.isPending && deleteStudent.variables === student.id
                            }
                            onClick={() => handleDelete(student.id, student.name)}
                          >
                            Xoá
                          </Button>
                        </div>
                      </td>
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
              unit="học sinh"
            />
          </>
        )}
      </Card>

      <StudentImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  )
}
