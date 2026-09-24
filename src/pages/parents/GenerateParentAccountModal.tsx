import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useClasses } from '@/hooks/useClasses'
import { useGenerateParentAccounts } from '@/hooks/useParents'
import { useStudents } from '@/hooks/useStudents'

interface GenerateParentAccountModalProps {
  open: boolean
  onClose: () => void
}

type Scope = 'CLASS' | 'STUDENT'

/**
 * Tạo bù tài khoản phụ huynh cho học sinh đã có sẵn trong DB.
 * Quy tắc do backend quyết định: tên = tên học sinh, email = ph.<mã HS>@eduhealth.vn,
 * mật khẩu = ngày sinh ddMMyyyy.
 */
export function GenerateParentAccountModal({ open, onClose }: GenerateParentAccountModalProps) {
  const [scope, setScope] = useState<Scope>('CLASS')
  const [classId, setClassId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [localError, setLocalError] = useState('')

  const classes = useClasses()
  const students = useStudents()
  const generate = useGenerateParentAccounts()
  const result = generate.data

  useEffect(() => {
    if (!open) return
    setScope('CLASS')
    setClassId('')
    setStudentId('')
    setLocalError('')
    generate.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ reset khi mở modal
  }, [open])

  const classOptions = useMemo(
    () =>
      (classes.data ?? []).map((item) => ({
        value: item.id,
        label: `${item.name} — Khối ${item.grade} · ${item.studentCount} học sinh`,
      })),
    [classes.data],
  )

  /** Chỉ những em chưa có phụ huynh mới cần tạo tài khoản. */
  const studentOptions = useMemo(
    () =>
      (students.data ?? [])
        .filter((student) => student.parentId == null)
        .map((student) => ({
          value: student.id,
          label: `${student.name} — ${student.studentCode}`,
        })),
    [students.data],
  )

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (scope === 'CLASS' && !classId) {
      setLocalError('Vui lòng chọn lớp.')
      return
    }
    if (scope === 'STUDENT' && !studentId) {
      setLocalError('Vui lòng chọn học sinh.')
      return
    }

    setLocalError('')
    generate.mutate(scope === 'CLASS' ? { classId } : { studentId })
  }

  const errorMessage = localError || (generate.error ? getErrorMessage(generate.error) : '')

  return (
    <Modal
      open={open}
      title="Tạo tài khoản phụ huynh"
      size={result ? 'lg' : 'md'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {errorMessage !== '' && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={errorMessage}
              details={localError ? [] : getErrorDetails(generate.error)}
            />
          </div>
        )}

        <div className="form-grid">
          <SelectField
            label="Phạm vi"
            required
            options={[
              { value: 'CLASS', label: 'Cả lớp' },
              { value: 'STUDENT', label: 'Một học sinh' },
            ]}
            value={scope}
            onChange={(event) => {
              setScope(event.target.value as Scope)
              generate.reset()
            }}
            hint="Học sinh đã có tài khoản phụ huynh sẽ được bỏ qua."
          />

          {scope === 'CLASS' ? (
            <SelectField
              label="Lớp"
              required
              placeholder={classes.isLoading ? 'Đang tải danh sách lớp...' : '-- Chọn lớp --'}
              options={classOptions}
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              disabled={classes.isLoading || generate.isPending}
            />
          ) : (
            <SelectField
              label="Học sinh chưa có phụ huynh"
              required
              placeholder={
                students.isLoading ? 'Đang tải danh sách học sinh...' : '-- Chọn học sinh --'
              }
              options={studentOptions}
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              disabled={students.isLoading || generate.isPending}
              hint={`Còn ${studentOptions.length} học sinh chưa được gắn phụ huynh.`}
            />
          )}
        </div>

        <Alert
          variant="success"
          message="Tài khoản sinh ra: tên = tên học sinh, email = ph.<mã học sinh>@eduhealth.vn, mật khẩu = ngày sinh dạng ddMMyyyy."
        />

        {result != null && (
          <div style={{ marginTop: 20 }}>
            <Alert
              variant={result.created > 0 ? 'success' : 'error'}
              message={result.message}
            />

            <div className="import-summary" style={{ marginTop: 12 }}>
              <div>
                <span className="import-summary__label">Học sinh xét</span>
                <span className="import-summary__value">{result.total}</span>
              </div>
              <div>
                <span className="import-summary__label">Tạo mới</span>
                <span className="import-summary__value">{result.created}</span>
              </div>
              <div>
                <span className="import-summary__label">Nối tài khoản cũ</span>
                <span className="import-summary__value">{result.linked}</span>
              </div>
              <div>
                <span className="import-summary__label">Bỏ qua (đã có)</span>
                <span className="import-summary__value">{result.skipped}</span>
              </div>
            </div>

            {result.errors.length > 0 && (
              <>
                <h3 style={{ margin: '20px 0 8px', fontSize: 15 }}>
                  Không tạo được ({result.errors.length})
                </h3>
                <div className="import-preview">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Mã học sinh</th>
                        <th>Lý do</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((item) => (
                        <tr key={item.studentId}>
                          <td>{item.studentCode || '—'}</td>
                          <td>{item.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {result.accounts.length > 0 && (
              <>
                <h3 style={{ margin: '20px 0 8px', fontSize: 15 }}>
                  Thông tin đăng nhập ({result.accounts.length})
                </h3>
                <Alert
                  message="Mật khẩu chỉ hiển thị ở màn hình này — hãy gửi cho phụ huynh trước khi đóng."
                />
                <div className="import-preview" style={{ marginTop: 8 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table__index">STT</th>
                        <th>Học sinh</th>
                        <th>Mã học sinh</th>
                        <th>Email đăng nhập</th>
                        <th>Mật khẩu</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.accounts.map((account, index) => (
                        <tr key={account.studentId}>
                          <td className="table__index">{index + 1}</td>
                          <td>{account.studentName}</td>
                          <td>{account.studentCode}</td>
                          <td>{account.email}</td>
                          <td>
                            <code style={{ fontSize: 13 }}>{account.defaultPassword}</code>
                          </td>
                          <td>
                            <Badge tone={account.status === 'CREATED' ? 'success' : 'info'}>
                              {account.status === 'CREATED' ? 'Tạo mới' : 'Nối tài khoản cũ'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        <div className="form-actions">
          {result != null ? (
            <>
              <Button type="button" variant="secondary" onClick={() => generate.reset()}>
                Tạo tiếp
              </Button>
              <Button type="button" onClick={onClose}>
                Đóng
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={onClose}>
                Huỷ
              </Button>
              <Button type="submit" loading={generate.isPending}>
                Tạo tài khoản
              </Button>
            </>
          )}
        </div>
      </form>
    </Modal>
  )
}
