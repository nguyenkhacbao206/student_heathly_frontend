import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { Loading } from '@/components/ui/States'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useCreateHealthRecord } from '@/hooks/useHealthRecords'
import { useStudents } from '@/hooks/useStudents'
import { calcBmi, formatNumber } from '@/lib/format'
import { ROUTES } from '@/routes/paths'

interface FormState {
  studentId: string
  month: string
  year: string
  height: string
  weight: string
  note: string
}

const NOW = new Date()

const EMPTY_FORM: FormState = {
  studentId: '',
  month: String(NOW.getMonth() + 1),
  year: String(NOW.getFullYear()),
  height: '',
  weight: '',
  note: '',
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: `Tháng ${index + 1}`,
}))

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {}
  const year = Number(form.year)
  const height = Number(form.height)
  const weight = Number(form.weight)

  if (!form.studentId) errors.studentId = 'Vui lòng chọn học sinh'
  if (!Number.isInteger(year) || year < 2000 || year > NOW.getFullYear() + 1) {
    errors.year = 'Năm không hợp lệ'
  }
  if (!height || height <= 0) errors.height = 'Chiều cao phải lớn hơn 0'
  if (!weight || weight <= 0) errors.weight = 'Cân nặng phải lớn hơn 0'

  return errors
}

export function HealthFormPage() {
  const navigate = useNavigate()
  const students = useStudents()
  const createRecord = useCreateHealthRecord()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const studentOptions = useMemo(
    () =>
      (students.data ?? []).map((student) => ({
        value: student.id,
        label: `${student.studentCode} — ${student.name}`,
      })),
    [students.data],
  )

  // Backend tự tính BMI; ở đây chỉ xem trước cho người nhập.
  const previewBmi = calcBmi(Number(form.height), Number(form.weight))

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    await createRecord.mutateAsync({
      studentId: form.studentId,
      month: Number(form.month),
      year: Number(form.year),
      height: Number(form.height),
      weight: Number(form.weight),
      note: form.note.trim() || undefined,
    })
    navigate(ROUTES.health)
  }

  if (students.isLoading) return <Loading />

  return (
    <>
      <PageHeader title="Thêm hồ sơ sức khoẻ" subtitle="Ghi nhận chỉ số đo của học sinh" />

      <Card>
        <form onSubmit={handleSubmit} noValidate>
          {createRecord.error != null && (
            <div style={{ marginBottom: 16 }}>
              <Alert
                message={getErrorMessage(createRecord.error)}
                details={getErrorDetails(createRecord.error)}
              />
            </div>
          )}

          {studentOptions.length === 0 && (
            <div style={{ marginBottom: 16 }}>
              <Alert message="Chưa có học sinh nào — hãy tạo học sinh trước khi nhập hồ sơ sức khoẻ." />
            </div>
          )}

          <div className="form-grid">
            <SelectField
              label="Học sinh"
              value={form.studentId}
              onChange={(e) => setField('studentId', e.target.value)}
              options={studentOptions}
              placeholder="-- Chọn học sinh --"
              error={errors.studentId}
              required
            />

            <SelectField
              label="Tháng đo"
              value={form.month}
              onChange={(e) => setField('month', e.target.value)}
              options={MONTH_OPTIONS}
              required
            />

            <TextField
              label="Năm đo"
              type="number"
              value={form.year}
              onChange={(e) => setField('year', e.target.value)}
              error={errors.year}
              required
            />

            <TextField
              label="Chiều cao (cm)"
              type="number"
              step="0.1"
              min="0"
              value={form.height}
              onChange={(e) => setField('height', e.target.value)}
              error={errors.height}
              required
            />

            <TextField
              label="Cân nặng (kg)"
              type="number"
              step="0.1"
              min="0"
              value={form.weight}
              onChange={(e) => setField('weight', e.target.value)}
              error={errors.weight}
              hint={previewBmi ? `BMI dự kiến: ${formatNumber(previewBmi)}` : undefined}
              required
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <TextAreaField
              label="Ghi chú"
              value={form.note}
              onChange={(e) => setField('note', e.target.value)}
              placeholder="Ghi chú thêm về tình trạng sức khoẻ (không bắt buộc)"
            />
          </div>

          <div className="form-actions">
            <Button
              type="submit"
              loading={createRecord.isPending}
              disabled={studentOptions.length === 0}
            >
              Lưu hồ sơ
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.health)}>
              Huỷ
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}
