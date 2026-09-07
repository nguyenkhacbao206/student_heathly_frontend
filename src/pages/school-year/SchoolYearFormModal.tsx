import { useEffect, useState, type FormEvent } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useCreateSchoolYear, useUpdateSchoolYear } from '@/hooks/useSchoolYears'
import { toDateInputValue, toIsoDateTime } from '@/lib/format'
import type { SchoolYear, SchoolYearFormValues } from '@/types/school-year'

interface SchoolYearFormModalProps {
  open: boolean
  schoolYear?: SchoolYear
  onClose: () => void
}

const EMPTY: SchoolYearFormValues = { name: '', startDate: '', endDate: '' }

export function SchoolYearFormModal({ open, schoolYear, onClose }: SchoolYearFormModalProps) {
  const [form, setForm] = useState<SchoolYearFormValues>(EMPTY)
  const [localError, setLocalError] = useState('')
  const create = useCreateSchoolYear()
  const update = useUpdateSchoolYear()
  const mutation = schoolYear ? update : create

  useEffect(() => {
    if (!open) return
    setForm(
      schoolYear
        ? {
          name: schoolYear.name,
          startDate: toDateInputValue(schoolYear.startDate),
          endDate: toDateInputValue(schoolYear.endDate),
        }
        : EMPTY,
    )
    setLocalError('')
    create.reset()
    update.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi mở modal / đổi bản ghi
  }, [open, schoolYear])

  function set<K extends keyof SchoolYearFormValues>(key: K, value: SchoolYearFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (form.endDate < form.startDate) {
      setLocalError('Ngày kết thúc phải sau ngày bắt đầu.')
      return
    }
    setLocalError('')

    const endDate = toIsoDateTime(form.endDate)
    const payload = {
      name: form.name.trim(),
      startDate: toIsoDateTime(form.startDate),
      enDate: endDate,
      endDate,
    }

    const done = { onSuccess: () => onClose() }
    if (schoolYear) update.mutate({ id: schoolYear.id, payload }, done)
    else create.mutate(payload, done)
  }

  return (
    <Modal open={open} title={schoolYear ? 'Sửa năm học' : 'Thêm năm học'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {(mutation.error != null || localError) && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={localError || getErrorMessage(mutation.error)}
              details={localError ? [] : getErrorDetails(mutation.error)}
            />
          </div>
        )}

        <div className="form-grid">
          <TextField
            label="Tên năm học"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="2025 - 2026"
            hint="Tên là duy nhất trong hệ thống."
          />
          <TextField
            label="Ngày bắt đầu"
            type="date"
            required
            value={form.startDate}
            onChange={(e) => set('startDate', e.target.value)}
          />
          <TextField
            label="Ngày kết thúc"
            type="date"
            required
            value={form.endDate}
            onChange={(e) => set('endDate', e.target.value)}
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {schoolYear ? 'Lưu thay đổi' : 'Thêm năm học'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
