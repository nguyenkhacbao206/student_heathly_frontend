import { useEffect, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useCreateTeacher, useUpdateTeacher } from '@/hooks/useTeachers'
import type { Teacher, TeacherPayload } from '@/types/teacher'

interface StaffFormModalProps {
  open: boolean
  /** undefined = thêm mới; có giá trị = sửa. */
  teacher?: Teacher
  onClose: () => void
}

const EMPTY: TeacherPayload = { name: '', email: '', phone: '' }

export function StaffFormModal({ open, teacher, onClose }: StaffFormModalProps) {
  const [form, setForm] = useState<TeacherPayload>(EMPTY)
  const create = useCreateTeacher()
  const update = useUpdateTeacher()
  const mutation = teacher ? update : create

  // Mở modal -> nạp lại dữ liệu (thêm mới thì rỗng, sửa thì đổ từ bản ghi).
  useEffect(() => {
    if (!open) return
    setForm(
      teacher
        ? { name: teacher.name, email: teacher.email, phone: teacher.phone ?? '' }
        : EMPTY,
    )
    create.reset()
    update.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi mở modal / đổi bản ghi
  }, [open, teacher])

  function set<K extends keyof TeacherPayload>(key: K, value: TeacherPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const done = { onSuccess: () => onClose() }
    if (teacher) update.mutate({ id: teacher.id, payload: form }, done)
    else create.mutate(form, done)
  }

  return (
    <Modal open={open} title={teacher ? 'Sửa nhân sự' : 'Thêm nhân sự'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {mutation.error != null && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={getErrorMessage(mutation.error)}
              details={getErrorDetails(mutation.error)}
            />
          </div>
        )}

        <div className="form-grid">
          <TextField
            label="Họ tên"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Nguyễn Văn A"
          />
          <TextField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="teacher@school.edu.vn"
          />
          <TextField
            label="Số điện thoại"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="0988 888 888"
            hint="Dùng làm tài khoản đăng nhập."
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {teacher ? 'Lưu thay đổi' : 'Thêm nhân sự'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
