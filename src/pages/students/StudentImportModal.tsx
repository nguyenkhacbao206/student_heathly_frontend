import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useClasses } from '@/hooks/useClasses'
import { useImportStudents } from '@/hooks/useStudents'
import { formatDate } from '@/lib/format'
import { GENDER_LABELS, type Gender } from '@/types/student'

interface StudentImportModalProps {
  open: boolean
  onClose: () => void
}

/** Giữ đồng bộ với fileFilter + limits của FileInterceptor ở backend. */
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPT = '.xlsx,.xls'
const PREVIEW_LIMIT = 20

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Kiểm tra trước ở FE để người dùng biết lỗi ngay, backend vẫn kiểm tra lại. */
function validateFile(file: File): string {
  const name = file.name.toLowerCase()
  if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
    return 'Chỉ chấp nhận file Excel (.xlsx, .xls).'
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File tối đa 5MB, file đang chọn nặng ${formatSize(file.size)}.`
  }
  if (file.size === 0) return 'File rỗng, vui lòng chọn file khác.'
  return ''
}

export function StudentImportModal({ open, onClose }: StudentImportModalProps) {
  const [classId, setClassId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [localError, setLocalError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const classes = useClasses()
  const importStudents = useImportStudents()
  const result = importStudents.data

  useEffect(() => {
    if (!open) return
    setClassId('')
    setFile(null)
    setLocalError('')
    setDragOver(false)
    importStudents.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ reset khi mở modal
  }, [open])

  const classOptions = useMemo(
    () =>
      (classes.data ?? []).map((item) => ({
        value: item.id,
        label: `${item.name} — Khối ${item.grade} · ${item.schoolYearName}${item.isCurrentYear ? ' (năm hiện tại)' : ''}`,
      })),
    [classes.data],
  )

  function pickFile(next: File | null) {
    if (!next) return
    const error = validateFile(next)
    setLocalError(error)
    setFile(error ? null : next)
    importStudents.reset()
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragOver(false)
    pickFile(event.dataTransfer.files?.[0] ?? null)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!classId) {
      setLocalError('Vui lòng chọn lớp cần nhập.')
      return
    }
    if (!file) {
      setLocalError('Vui lòng chọn file Excel.')
      return
    }

    setLocalError('')
    importStudents.mutate({ file, classId })
  }

  function handleReset() {
    setFile(null)
    setLocalError('')
    importStudents.reset()
    if (inputRef.current) inputRef.current.value = ''
  }

  const errorMessage =
    localError || (importStudents.error ? getErrorMessage(importStudents.error) : '')

  return (
    <Modal
      open={open}
      title="Nhập học sinh từ Excel"
      size={result ? 'lg' : 'md'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {errorMessage && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={errorMessage}
              details={localError ? [] : getErrorDetails(importStudents.error)}
            />
          </div>
        )}

        {classes.error != null && (
          <div style={{ marginBottom: 16 }}>
            <Alert message={`Không tải được danh sách lớp: ${getErrorMessage(classes.error)}`} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SelectField
            label="Lớp"
            required
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            disabled={classes.isLoading || importStudents.isPending}
            options={classOptions}
            placeholder={
              classes.isLoading
                ? 'Đang tải danh sách lớp...'
                : classOptions.length === 0
                  ? 'Chưa có lớp nào'
                  : '-- Chọn lớp --'
            }
            hint="Toàn bộ học sinh trong file sẽ được gán vào lớp này."
          />

          <div className="field">
            <span className="field__label">
              File Excel<span className="field__required"> *</span>
            </span>

            <div
              className={[
                'dropzone',
                dragOver ? 'dropzone--over' : '',
                file ? 'dropzone--filled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  inputRef.current?.click()
                }
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <>
                  <span className="dropzone__title">{file.name}</span>
                  <span className="dropzone__hint">
                    {formatSize(file.size)} · Bấm để chọn file khác
                  </span>
                </>
              ) : (
                <>
                  <span className="dropzone__title">Kéo thả file vào đây hoặc bấm để chọn</span>
                  <span className="dropzone__hint">Định dạng .xlsx, .xls — tối đa 5MB</span>
                </>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              hidden
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            <span className="field__hint">
              Dòng đầu tiên là tên cột: Mã học sinh, Họ tên, Giới tính, Ngày sinh, Dân tộc, Địa
              chỉ. Hệ thống đọc sheet đầu tiên trong file.
            </span>
          </div>
        </div>

        {result && (
          <div style={{ marginTop: 20 }}>
            <Alert
              variant={result.created > 0 ? 'success' : 'error'}
              message={result.message}
            />

            <div className="import-summary" style={{ marginTop: 12 }}>
              <div>
                <span className="import-summary__label">Lớp</span>
                <span className="import-summary__value">{result.className}</span>
              </div>
              <div>
                <span className="import-summary__label">Số dòng đọc được</span>
                <span className="import-summary__value">{result.total}</span>
              </div>
              <div>
                <span className="import-summary__label">Đã lưu</span>
                <span className="import-summary__value">{result.created}</span>
              </div>
              <div>
                <span className="import-summary__label">Bỏ qua</span>
                <span className="import-summary__value">{result.skipped}</span>
              </div>
            </div>

            {result.errors.length > 0 && (
              <>
                <h3 style={{ margin: '20px 0 8px', fontSize: 15 }}>
                  Dòng không nhập được ({result.errors.length})
                </h3>
                <div className="import-preview">
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ width: 80 }}>Dòng</th>
                        <th>Mã học sinh</th>
                        <th>Lý do</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((item) => (
                        <tr key={`${item.row}-${item.studentCode}`}>
                          <td className="table__index">{item.row}</td>
                          <td>{item.studentCode || '—'}</td>
                          <td>{item.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {(result.parentAccounts?.length ?? 0) > 0 && (
              <>
                <h3 style={{ margin: '20px 0 8px', fontSize: 15 }}>
                  Tài khoản phụ huynh đã cấp ({result.parentAccounts.length})
                </h3>
                <Alert message="Mật khẩu chỉ hiển thị ở màn hình này — hãy gửi cho phụ huynh trước khi đóng." />
                <div className="import-preview" style={{ marginTop: 8 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table__index">STT</th>
                        <th>Học sinh</th>
                        <th>Email đăng nhập</th>
                        <th>Mật khẩu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.parentAccounts.slice(0, PREVIEW_LIMIT).map((account, index) => (
                        <tr key={account.studentId}>
                          <td className="table__index">{index + 1}</td>
                          <td>{account.studentName}</td>
                          <td>{account.email}</td>
                          <td>
                            <code style={{ fontSize: 13 }}>{account.defaultPassword}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {result.students.length > 0 && (
              <>
                <h3 style={{ margin: '20px 0 8px', fontSize: 15 }}>
                  Học sinh đã lưu ({result.students.length})
                  {result.students.length > PREVIEW_LIMIT &&
                    ` — hiển thị ${PREVIEW_LIMIT} dòng đầu`}
                </h3>
                <div className="import-preview">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table__index">STT</th>
                        <th>Mã học sinh</th>
                        <th>Họ tên</th>
                        <th>Giới tính</th>
                        <th>Ngày sinh</th>
                        <th>Dân tộc</th>
                        <th>Địa chỉ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.students.slice(0, PREVIEW_LIMIT).map((student, index) => (
                        <tr key={student.id}>
                          <td className="table__index">{index + 1}</td>
                          <td>{student.studentCode}</td>
                          <td>{student.name}</td>
                          <td>{GENDER_LABELS[student.gender as Gender] ?? student.gender}</td>
                          <td>{formatDate(student.dob)}</td>
                          <td>{student.nation || '—'}</td>
                          <td>{student.address || '—'}</td>
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
          {result ? (
            <>
              <Button type="button" variant="secondary" onClick={handleReset}>
                Nhập file khác
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
              <Button type="submit" loading={importStudents.isPending} disabled={!file || !classId}>
                Tải lên & lưu vào hệ thống
              </Button>
            </>
          )}
        </div>
      </form>
    </Modal>
  )
}
