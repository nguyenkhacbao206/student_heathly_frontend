import { useEffect, useState, type FormEvent } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { SelectField, TextField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import {
  useCreateMeasurementPeriod,
  useUpdateMeasurementPeriod,
} from '@/hooks/useMeasurementPeriods'
import { useSchoolYears } from '@/hooks/useSchoolYears'
import { toDateInputValue, toIsoDateTime } from '@/lib/format'
import type {
  MeasurementPeriod,
  MeasurementPeriodFormValues,
} from '@/types/measurement-period'

interface MeasurementPeriodFormModalProps {
  open: boolean
  /** undefined = thêm mới; có giá trị = sửa. */
  period?: MeasurementPeriod
  onClose: () => void
}

const EMPTY: MeasurementPeriodFormValues = {
  name: '',
  month: '',
  startDate: '',
  endDate: '',
  schoolYearId: '',
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: `Tháng ${index + 1}`,
}))

export function MeasurementPeriodFormModal({
  open,
  period,
  onClose,
}: MeasurementPeriodFormModalProps) {
  const [form, setForm] = useState<MeasurementPeriodFormValues>(EMPTY)
  const [localError, setLocalError] = useState('')
  const { data: schoolYears } = useSchoolYears()
  const create = useCreateMeasurementPeriod()
  const update = useUpdateMeasurementPeriod()
  const mutation = period ? update : create

  useEffect(() => {
    if (!open) return
    setForm(
      period
        ? {
            name: period.name,
            month: String(period.month),
            startDate: toDateInputValue(period.startDate),
            endDate: toDateInputValue(period.endDate),
            schoolYearId: period.schoolYearId,
          }
        : // Thêm mới: chọn sẵn năm học đang áp dụng cho đỡ thao tác.
          { ...EMPTY, schoolYearId: schoolYears?.find((year) => year.isActive)?.id ?? '' },
    )
    setLocalError('')
    create.reset()
    update.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi mở modal / đổi bản ghi
  }, [open, period])

  function set<K extends keyof MeasurementPeriodFormValues>(
    key: K,
    value: MeasurementPeriodFormValues[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!form.schoolYearId) {
      setLocalError('Vui lòng chọn năm học.')
      return
    }
    if (form.endDate < form.startDate) {
      setLocalError('Ngày kết thúc phải sau ngày bắt đầu.')
      return
    }
    setLocalError('')

    const payload = {
      name: form.name.trim(),
      month: Number(form.month),
      startDate: toIsoDateTime(form.startDate),
      endDate: toIsoDateTime(form.endDate),
      schoolYearId: form.schoolYearId,
    }

    const done = { onSuccess: () => onClose() }
    if (period) update.mutate({ id: period.id, payload }, done)
    else create.mutate(payload, done)
  }

  const yearOptions = (schoolYears ?? []).map((year) => ({
    value: year.id,
    label: year.isActive ? `${year.name} (đang áp dụng)` : year.name,
  }))

  return (
    <Modal open={open} title={period ? 'Sửa đợt đo' : 'Thêm đợt đo'} onClose={onClose}>
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
            <Alert message="Chưa có năm học nào. Hãy tạo năm học trước khi thêm đợt đo." />
          </div>
        )}

        <div className="form-grid">
          <TextField
            label="Tên đợt đo"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Đợt đo tháng 9"
          />
          <SelectField
            label="Năm học"
            required
            placeholder="-- Chọn năm học --"
            options={yearOptions}
            value={form.schoolYearId}
            onChange={(e) => set('schoolYearId', e.target.value)}
          />
          <SelectField
            label="Tháng đo"
            required
            placeholder="-- Chọn tháng --"
            options={MONTH_OPTIONS}
            value={form.month}
            onChange={(e) => set('month', e.target.value)}
            hint="Dùng để khớp với tháng của hồ sơ sức khoẻ."
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
            {period ? 'Lưu thay đổi' : 'Thêm đợt đo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
