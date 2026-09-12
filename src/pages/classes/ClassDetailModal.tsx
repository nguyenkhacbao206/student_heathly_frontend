import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { TableFooter } from '@/components/ui/TableFooter'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useClass, useClassStudents } from '@/hooks/useClasses'
import { usePagination } from '@/hooks/usePagination'
import { formatDate } from '@/lib/format'
import { GENDER_LABELS, type Gender } from '@/types/student'

interface ClassDetailModalProps {
  open: boolean
  /** undefined khi modal đóng — hai query bên dưới sẽ tự tắt. */
  classId?: string
  onClose: () => void
}

export function ClassDetailModal({ open, classId, onClose }: ClassDetailModalProps) {
  // Chỉ gọi API khi modal đang mở để tránh nạp thừa lúc đóng.
  const id = open ? classId : undefined
  const detail = useClass(id)
  const students = useClassStudents(id)
  const paged = usePagination(students.data ?? [])

  return (
    <Modal open={open} title={`Lớp ${detail.data?.name ?? ''}`.trim()} size="lg" onClose={onClose}>
      {detail.isLoading ? (
        <Loading />
      ) : detail.error != null ? (
        <ErrorState
          message={getErrorMessage(detail.error)}
          action={
            <Button variant="secondary" size="sm" onClick={() => void detail.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : detail.data == null ? null : (
        <>
          <div className="stat-grid">
            <div className="card stat">
              <div className="stat__label">Khối</div>
              <div className="stat__value">{detail.data.grade}</div>
            </div>
            <div className="card stat">
              <div className="stat__label">Sĩ số</div>
              <div className="stat__value">{detail.data.studentCount}</div>
            </div>
            <div className="card stat">
              <div className="stat__label">Năm học</div>
              <div className="stat__value" style={{ fontSize: 18 }}>
                {detail.data.schoolYearName}{' '}
                {detail.data.isCurrentYear && <Badge tone="success">Đang áp dụng</Badge>}
              </div>
            </div>
          </div>

          <h3 style={{ margin: '20px 0 8px', fontSize: 15 }}>
            Giáo viên phụ trách ({detail.data.teachers.length})
          </h3>
          {detail.data.teachers.length === 0 ? (
            <EmptyState message="Lớp chưa có giáo viên phụ trách." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.data.teachers.map((teacher) => (
                    <tr key={teacher.id}>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      <td>{teacher.phone ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 style={{ margin: '20px 0 8px', fontSize: 15 }}>
            Học sinh ({students.data?.length ?? 0})
          </h3>
          {students.isLoading ? (
            <Loading />
          ) : students.error != null ? (
            <ErrorState message={getErrorMessage(students.error)} />
          ) : (students.data?.length ?? 0) === 0 ? (
            <EmptyState message="Lớp chưa có học sinh nào." />
          ) : (
            <>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table__index">STT</th>
                      <th>Mã học sinh</th>
                      <th>Họ tên</th>
                      <th>Giới tính</th>
                      <th>Ngày sinh</th>
                      <th>Dân tộc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.items.map((student, index) => (
                      <tr key={student.id}>
                        <td className="table__index">{paged.from + index}</td>
                        <td>{student.studentCode}</td>
                        <td>{student.name}</td>
                        <td>{GENDER_LABELS[student.gender as Gender] ?? student.gender}</td>
                        <td>{formatDate(student.dob)}</td>
                        <td>{student.nation}</td>
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
        </>
      )}

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  )
}
