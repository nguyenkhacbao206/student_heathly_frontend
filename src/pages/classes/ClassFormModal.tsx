import { useEffect, useState, type FormEvent } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { SelectField, TextField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useCreateClass, useUpdateClass } from '@/hooks/useClasses'
import { useSchoolYears } from '@/hooks/useSchoolYears'
import { GRADES, type ClassFormValues, type ClassItem } from '@/types/class'

interface ClassFormModalProps {
  open: boolean
  /** undefined = thêm mới; có giá trị = sửa. */
  classItem?: ClassItem
  onClose: () => void
}

const EMPTY: ClassFormValues = { name: '', grade: '', schoolYearId: '' }

const GRADE_OPTIONS = GRADES.map((grade) => ({
  value: String(grade),
  label: `Khối ${grade}`,
}))

export function ClassFormModal({ open, classItem, onClose }: ClassFormModalProps) {
  const [form, setForm] = useState<ClassFormValues>(EMPTY)
  const [localError, setLocalError] = useState('')
  const { data: schoolYears } = useSchoolYears()
  const create = useCreateClass()
  const update = useUpdateClass()
  const mutation = classItem ? update : create

  useEffect(() => {
    if (!open) return
    setForm(
      classItem
        ? {
            name: classItem.name,
            grade: String(classItem.grade),
            schoolYearId: classItem.schoolYearId,
          }
        : // Thêm mới: chọn sẵn năm học đang áp dụng cho đỡ thao tác.
          { ...EMPTY, schoolYearId: schoolYears?.find((year) => year.isActive)?.id ?? '' },
    )
    setLocalError('')
    create.reset()
    update.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi mở modal / đổi bản ghi
  }, [open, classItem])

  function set<K extends keyof ClassFormValues>(key: K, value: ClassFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!form.schoolYearId) {
      setLocalError('Vui lòng chọn năm học.')
      return
    }
    if (!form.grade) {
      setLocalError('Vui lòng chọn khối.')
      return
    }
    setLocalError('')

    const payload = {
      name: form.name.trim(),
      grade: Number(form.grade),
      schoolYearId: form.schoolYearId,
    }

    const done = { onSuccess: () => onClose() }
    if (classItem) update.mutate({ id: classItem.id, payload }, done)
    else create.mutate(payload, done)
  }

  const yearOptions = (schoolYears ?? []).map((year) => ({
    value: year.id,
    label: year.isActive ? `${year.name} (đang áp dụng)` : year.name,
  }))

  return (
    <Modal open={open} title={classItem ? 'Sửa lớp' : 'Thêm lớp'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {(mutation.error != null || localError) && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={localError || getErrorMessage(mutation.error)}
              details={localError ? [] : getErrorDetails(mutation.error)}
            />
          </div>
        )}

        {yearOptions.length === 0 && (
          <div style={{ marginBottom: 16 }}>
            <Alert message="Chưa có năm học nào. Hãy tạo năm học trước khi thêm lớp." />
          </div>
        )}

        <div className="form-grid">
          <TextField
            label="Tên lớp"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="1A"
            hint="Tên lớp là duy nhất trong cùng một năm học."
          />
          <SelectField
            label="Khối"
            required
            placeholder="-- Chọn khối --"
            options={GRADE_OPTIONS}
            value={form.grade}
            onChange={(e) => set('grade', e.target.value)}
          />
          <SelectField
            label="Năm học"
            required
            placeholder="-- Chọn năm học --"
            options={yearOptions}
            value={form.schoolYearId}
            onChange={(e) => set('schoolYearId', e.target.value)}
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {classItem ? 'Lưu thay đổi' : 'Thêm lớp'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
