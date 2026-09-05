import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SelectField, TextField } from '@/components/ui/Field'
import { ErrorState, Loading } from '@/components/ui/States'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useCreateStudent, useStudent, useUpdateStudent } from '@/hooks/useStudents'
import { toDateInputValue } from '@/lib/format'
import { ROUTES } from '@/routes/paths'
import { GENDERS, GENDER_LABELS, type StudentPayload } from '@/types/student'

type FormState = StudentPayload

const EMPTY_FORM: FormState = {
  studentCode: '',
  name: '',
  gender: '',
  dob: '',
  nation: '',
  address: '',
}

const GENDER_OPTIONS = GENDERS.map((gender) => ({
  value: gender,
  label: GENDER_LABELS[gender],
}))

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {}

  if (!form.studentCode.trim()) errors.studentCode = 'Vui lòng nhập mã học sinh'
  if (form.name.trim().length < 2) errors.name = 'Họ tên tối thiểu 2 ký tự'
  if (!form.gender) errors.gender = 'Vui lòng chọn giới tính'
  if (!form.dob) errors.dob = 'Vui lòng chọn ngày sinh'
  else if (new Date(form.dob) > new Date()) errors.dob = 'Ngày sinh không thể ở tương lai'
  if (!form.nation.trim()) errors.nation = 'Vui lòng nhập dân tộc'

  return errors
}

export function StudentFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const studentQuery = useStudent(id)
  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent(id ?? '')
  const mutation = isEdit ? updateStudent : createStudent

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  // Đổ dữ liệu vào form khi ở chế độ sửa.
  useEffect(() => {
    const student = studentQuery.data
    if (!student) return
    setForm({
      studentCode: student.studentCode,
      name: student.name,
      gender: student.gender,
      dob: toDateInputValue(student.dob),
      nation: student.nation,
      address: student.address ?? '',
    })
  }, [studentQuery.data])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // Prisma cần DateTime đầy đủ, input date chỉ cho "yyyy-MM-dd".
    const payload: StudentPayload = {
      ...form,
      studentCode: form.studentCode.trim(),
      name: form.name.trim(),
      nation: form.nation.trim(),
      address: form.address.trim(),
      dob: new Date(form.dob).toISOString(),
    }

    await mutation.mutateAsync(payload)
    navigate(ROUTES.students)
  }

  if (isEdit && studentQuery.isLoading) return <Loading />
  if (isEdit && studentQuery.error) {
    return <ErrorState message={getErrorMessage(studentQuery.error)} />
  }

  return (
    <>
      <PageHeader
        title={isEdit ? 'Cập nhật học sinh' : 'Thêm học sinh'}
        subtitle={isEdit ? `Mã hồ sơ: ${id}` : 'Nhập thông tin hồ sơ học sinh mới'}
      />

      <Card>
        <form onSubmit={handleSubmit} noValidate>
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
              label="Mã học sinh"
              value={form.studentCode}
              onChange={(e) => setField('studentCode', e.target.value)}
              error={errors.studentCode}
              required
            />

            <TextField
              label="Họ và tên"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              error={errors.name}
              required
            />

            <SelectField
              label="Giới tính"
              value={form.gender}
              onChange={(e) => setField('gender', e.target.value)}
              options={GENDER_OPTIONS}
              placeholder="-- Chọn --"
              error={errors.gender}
              required
            />

            <TextField
              label="Ngày sinh"
              type="date"
              value={form.dob}
              onChange={(e) => setField('dob', e.target.value)}
              error={errors.dob}
              required
            />

            <TextField
              label="Dân tộc"
              value={form.nation}
              onChange={(e) => setField('nation', e.target.value)}
              error={errors.nation}
              required
            />

            <TextField
              label="Địa chỉ"
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
              error={errors.address}
            />
          </div>

          <div className="form-actions">
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? 'Lưu thay đổi' : 'Tạo học sinh'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.students)}>
              Huỷ
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}
