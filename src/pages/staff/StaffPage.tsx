import { useMemo, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { IconPlus, IconUser } from '@/components/ui/Icon'
import { SearchInput } from '@/components/ui/SearchInput'
import { TableFooter } from '@/components/ui/TableFooter'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { usePagination } from '@/hooks/usePagination'
import { useTeachers, useUpdateTeacherStatus } from '@/hooks/useTeachers'
import { formatDate } from '@/lib/format'
import { StaffFormModal } from '@/pages/staff/StaffFormModal'
import {
  TEACHER_ROLE_LABELS,
  TEACHER_STATUS_LABELS,
  type Teacher,
  type TeacherRole,
} from '@/types/teacher'

export function StaffPage() {
  const { data, isLoading, error, refetch } = useTeachers()
  const updateStatus = useUpdateTeacherStatus()
  const [keyword, setKeyword] = useState('')
  const [editing, setEditing] = useState<Teacher | undefined>()
  const [modalOpen, setModalOpen] = useState(false)

  const teachers = useMemo(() => data ?? [], [data])

  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase()
    if (!needle) return teachers
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(needle) ||
        teacher.email.toLowerCase().includes(needle) ||
        (teacher.phone ?? '').includes(needle),
    )
  }, [teachers, keyword])

  const paged = usePagination(filtered)

  const activeCount = teachers.filter((teacher) => teacher.status === 'ACTIVE').length

  function openCreate() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(teacher: Teacher) {
    setEditing(teacher)
    setModalOpen(true)
  }

  function toggleStatus(teacher: Teacher) {
    const next = teacher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const verb = next === 'INACTIVE' ? 'Khoá' : 'Mở khoá'
    if (!window.confirm(`${verb} tài khoản "${teacher.name}"?`)) return
    updateStatus.mutate({ id: teacher.id, status: next })
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
      <PageHeader title="Nhân sự" />

      <div className="stat-grid">
        <StatCard label="Tổng nhân sự" value={teachers.length} />
        <StatCard label="Đang hoạt động" value={activeCount} />
        <StatCard label="Đã khoá" value={teachers.length - activeCount} />
      </div>

      <div className="toolbar">
        <SearchInput value={keyword} onChange={setKeyword} placeholder="Tìm kiếm theo tên ..." />
        <Button onClick={openCreate}>
          <IconPlus size={16} />
          Thêm nhân sự
        </Button>
      </div>

      {updateStatus.error != null && (
        <div style={{ marginBottom: 16 }}>
          <Alert message={getErrorMessage(updateStatus.error)} />
        </div>
      )}

      <Card flush>
        {paged.items.length === 0 ? (
          <EmptyState
            message={keyword ? 'Không tìm thấy nhân sự phù hợp.' : 'Chưa có nhân sự nào.'}
            action={
              !keyword && (
                <Button size="sm" onClick={openCreate}>
                  Thêm nhân sự đầu tiên
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
                    <th>Người dùng</th>
                    <th>Tài khoản</th>
                    <th>Vai trò</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((teacher, index) => {
                    const role: TeacherRole = teacher.role ?? 'USER'
                    const locked = teacher.status !== 'ACTIVE'
                    const pending =
                      updateStatus.isPending && updateStatus.variables?.id === teacher.id

                    return (
                      <tr key={teacher.id}>
                        <td className="table__index">{paged.from + index}</td>
                        <td>
                          <div className="cell-user">
                            <span className="cell-user__avatar">
                              <IconUser size={22} />
                            </span>
                            {teacher.name}
                          </div>
                        </td>
                        <td>{teacher.phone || teacher.email}</td>
                        <td>
                          <Badge tone={role === 'ADMIN' ? 'info' : 'neutral'}>
                            {TEACHER_ROLE_LABELS[role]}
                          </Badge>
                        </td>
                        <td>{formatDate(teacher.createdAt)}</td>
                        <td>
                          <Badge tone={locked ? 'danger' : 'success'}>
                            {TEACHER_STATUS_LABELS[teacher.status]}
                          </Badge>
                        </td>
                        <td>
                          <div className="table__actions">
                            <Button variant="soft" size="sm" onClick={() => openEdit(teacher)}>
                              Sửa
                            </Button>
                            <Button
                              variant="soft"
                              size="sm"
                              loading={pending}
                              onClick={() => toggleStatus(teacher)}
                            >
                              {locked ? 'Mở khoá' : 'Khoá'}
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
              unit="nhân sự"
            />
          </>
        )}
      </Card>

      <StaffFormModal open={modalOpen} teacher={editing} onClose={() => setModalOpen(false)} />
    </>
  )
}
