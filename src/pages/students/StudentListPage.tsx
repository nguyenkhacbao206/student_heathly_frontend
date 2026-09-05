import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useDeleteStudent, useStudents } from '@/hooks/useStudents'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/routes/paths'
import { GENDER_LABELS, type Gender } from '@/types/student'

export function StudentListPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useStudents()
  const deleteStudent = useDeleteStudent()
  const [keyword, setKeyword] = useState('')

  const students = useMemo(() => {
    const list = data ?? []
    const needle = keyword.trim().toLowerCase()
    if (!needle) return list
    return list.filter(
      (student) =>
        student.name.toLowerCase().includes(needle) ||
        student.studentCode.toLowerCase().includes(needle),
    )
  }, [data, keyword])

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

  return (
    <>
      <PageHeader
        title="Học sinh"
        subtitle={`${data?.length ?? 0} học sinh trong hệ thống`}
        actions={
          <Button onClick={() => navigate(ROUTES.studentCreate)}>+ Thêm học sinh</Button>
        }
      />

      {deleteStudent.error != null && (
        <div style={{ marginBottom: 16 }}>
          <Alert message={getErrorMessage(deleteStudent.error)} />
        </div>
      )}

      <Card flush>
        <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
          <input
            className="field__control"
            style={{ maxWidth: 320 }}
            placeholder="Tìm theo tên hoặc mã học sinh..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {students.length === 0 ? (
          <EmptyState
            message={keyword ? 'Không tìm thấy học sinh phù hợp.' : 'Chưa có học sinh nào.'}
            action={!keyword && <Link to={ROUTES.studentCreate}>Thêm học sinh đầu tiên</Link>}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã HS</th>
                  <th>Họ tên</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Dân tộc</th>
                  <th>Địa chỉ</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.studentCode}</td>
                    <td>{student.name}</td>
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
        )}
      </Card>
    </>
  )
}
