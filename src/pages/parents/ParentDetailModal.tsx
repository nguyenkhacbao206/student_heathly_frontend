import { useEffect, useMemo, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useClasses } from '@/hooks/useClasses'
import {
  useLinkStudent,
  useParent,
  useResetParentPassword,
  useUnlinkStudent,
} from '@/hooks/useParents'
import { useStudents } from '@/hooks/useStudents'
import { formatDate } from '@/lib/format'
import {
  PARENT_STATUS_LABELS,
  getParentStatus,
  type ParentAccountStatus,
  type ParentStudent,
} from '@/types/parent'
import { GENDER_LABELS, type Gender } from '@/types/student'

const STATUS_TONE: Record<ParentAccountStatus, BadgeTone> = {
  NOT_LOGIN: 'warning',
  LOGGED_IN: 'info',
  PASSWORD_CHANGED: 'success',
}

interface ParentDetailModalProps {
  open: boolean
  /** undefined khi modal đóng — các query bên dưới sẽ tự tắt. */
  parentId?: number
  onClose: () => void
}

/** Mật khẩu mặc định backend sinh ra khi reset: ngày sinh học sinh dạng ddMMyyyy. */
function defaultPasswordOf(dob: string): string {
  const date = new Date(dob)
  if (Number.isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}${month}${date.getFullYear()}`
}

export function ParentDetailModal({ open, parentId, onClose }: ParentDetailModalProps) {
  // Chỉ gọi API khi modal đang mở để tránh nạp thừa lúc đóng.
  const id = open ? parentId : undefined
  const detail = useParent(id)

  const students = useStudents()
  const classes = useClasses()

  const link = useLinkStudent()
  const unlink = useUnlinkStudent()
  const resetPassword = useResetParentPassword()

  const [studentToLink, setStudentToLink] = useState('')
  const [notice, setNotice] = useState('')

  // Mỗi lần mở modal / đổi phụ huynh thì dọn sạch form và thông báo của lần trước.
  useEffect(() => {
    if (!open) return
    setStudentToLink('')
    setNotice('')
    link.reset()
    unlink.reset()
    resetPassword.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi mở modal / đổi bản ghi
  }, [open, parentId])

  const classNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of classes.data ?? []) map.set(item.id, item.name)
    return map
  }, [classes.data])

  /** GET /student trả cả trường parentId -> lọc ngay ở FE những em chưa có phụ huynh. */
  const linkableOptions = useMemo(
    () =>
      (students.data ?? [])
        .filter((student) => student.parentId == null)
        .map((student) => {
          const className = classNameById.get(student.classId)
          return {
            value: student.id,
            label: className
              ? `${student.name} — ${student.studentCode} — ${className}`
              : `${student.name} — ${student.studentCode}`,
          }
        }),
    [students.data, classNameById],
  )

  const parent = detail.data
  const mutationError = link.error ?? unlink.error ?? resetPassword.error

  function handleLink() {
    if (id == null || !studentToLink) return
    link.mutate(
      { parentId: id, studentId: studentToLink },
      {
        onSuccess: (result) => {
          setStudentToLink('')
          setNotice(result.message ?? 'Đã liên kết học sinh với phụ huynh.')
        },
      },
    )
  }

  function handleUnlink(student: ParentStudent) {
    if (id == null) return
    const confirmed = window.confirm(
      `Gỡ liên kết học sinh "${student.name}" khỏi phụ huynh này? Phụ huynh sẽ không còn xem được hồ sơ sức khoẻ của em.`,
    )
    if (!confirmed) return

    unlink.mutate(
      { parentId: id, studentId: student.id },
      { onSuccess: (result) => setNotice(result.message ?? 'Đã gỡ liên kết học sinh.') },
    )
  }

  function handleResetPassword(student: ParentStudent) {
    if (id == null) return
    const newPassword = defaultPasswordOf(student.dob)
    const confirmed = window.confirm(
      `Đặt lại mật khẩu của phụ huynh về ngày sinh học sinh "${student.name}" (${newPassword})? Phụ huynh sẽ phải đổi mật khẩu ở lần đăng nhập kế tiếp.`,
    )
    if (!confirmed) return

    resetPassword.mutate(
      { parentId: id, studentId: student.id },
      {
        onSuccess: (result) =>
          setNotice(
            `${result.message ?? 'Đã đặt lại mật khẩu.'} Mật khẩu mới: ${newPassword}`,
          ),
      },
    )
  }

  return (
    <Modal open={open} title={`Phụ huynh ${parent?.name ?? ''}`.trim()} size="lg" onClose={onClose}>
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
      ) : parent == null ? null : (
        <>
          <div className="stat-grid">
            <div className="card stat">
              <div className="stat__label">Email đăng nhập</div>
              <div className="stat__value" style={{ fontSize: 16 }}>
                {parent.email}
              </div>
            </div>
            <div className="card stat">
              <div className="stat__label">Trạng thái</div>
              <div className="stat__value" style={{ fontSize: 16 }}>
                <Badge tone={STATUS_TONE[getParentStatus(parent)]}>
                  {PARENT_STATUS_LABELS[getParentStatus(parent)]}
                </Badge>{' '}
                {!parent.isActive && <Badge tone="danger">Đã khoá</Badge>}
              </div>
            </div>
            <div className="card stat">
              <div className="stat__label">Đăng nhập gần nhất</div>
              <div className="stat__value" style={{ fontSize: 16 }}>
                {formatDate(parent.lastLoginAt)}
              </div>
            </div>
            <div className="card stat">
              <div className="stat__label">Ngày tạo tài khoản</div>
              <div className="stat__value" style={{ fontSize: 16 }}>
                {formatDate(parent.createdAt)}
              </div>
            </div>
          </div>

          {mutationError != null && (
            <div style={{ marginTop: 16 }}>
              <Alert
                message={getErrorMessage(mutationError)}
                details={getErrorDetails(mutationError)}
              />
            </div>
          )}

          {notice !== '' && mutationError == null && (
            <div style={{ marginTop: 16 }}>
              <Alert variant="success" message={notice} />
            </div>
          )}

          <h3 style={{ margin: '20px 0 8px', fontSize: 15 }}>
            Học sinh được liên kết ({parent.students.length})
          </h3>

          {parent.students.length === 0 ? (
            <EmptyState message="Phụ huynh chưa được liên kết với học sinh nào." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table__index">STT</th>
                    <th>Mã học sinh</th>
                    <th>Họ tên</th>
                    <th>Lớp</th>
                    <th>Giới tính</th>
                    <th>Ngày sinh</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {parent.students.map((student, index) => (
                    <tr key={student.id}>
                      <td className="table__index">{index + 1}</td>
                      <td>{student.studentCode}</td>
                      <td>{student.name}</td>
                      <td>
                        {student.class ? `${student.class.name} — Khối ${student.class.grade}` : '—'}
                      </td>
                      <td>{GENDER_LABELS[student.gender as Gender] ?? student.gender}</td>
                      <td>{formatDate(student.dob)}</td>
                      <td>
                        <div className="table__actions">
                          <Button
                            variant="soft"
                            size="sm"
                            loading={
                              resetPassword.isPending &&
                              resetPassword.variables?.studentId === student.id
                            }
                            onClick={() => handleResetPassword(student)}
                          >
                            Đặt lại mật khẩu
                          </Button>
                          <Button
                            variant="soft"
                            size="sm"
                            loading={unlink.isPending && unlink.variables?.studentId === student.id}
                            onClick={() => handleUnlink(student)}
                          >
                            Gỡ liên kết
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 style={{ margin: '20px 0 8px', fontSize: 15 }}>Liên kết thêm học sinh</h3>

          {students.isLoading ? (
            <Loading />
          ) : students.error != null ? (
            <ErrorState message={getErrorMessage(students.error)} />
          ) : (
            <div className="form-grid">
              <SelectField
                label="Học sinh chưa có phụ huynh"
                placeholder="-- Chọn học sinh --"
                options={linkableOptions}
                value={studentToLink}
                onChange={(event) => setStudentToLink(event.target.value)}
                hint={
                  linkableOptions.length === 0
                    ? 'Mọi học sinh đều đã được gắn với một phụ huynh.'
                    : `Còn ${linkableOptions.length} học sinh chưa được gắn phụ huynh.`
                }
              />
              <div className="field">
                <span className="field__label">&nbsp;</span>
                <Button
                  type="button"
                  disabled={!studentToLink}
                  loading={link.isPending}
                  onClick={handleLink}
                >
                  Liên kết học sinh
                </Button>
              </div>
            </div>
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
