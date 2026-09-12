import { useEffect, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useHealthIndicatorGroups, useCreateIndicator, useUpdateIndicator } from '@/hooks/useHealthIndicators'
import type { HealthIndicator, IndicatorDataType, OptionPayload } from '@/types/health-indicator'
import { INDICATOR_DATA_TYPES, DATA_TYPE_LABELS } from '@/types/health-indicator'

interface Props {
  open: boolean
  indicator?: HealthIndicator
  onClose: () => void
}

export function HealthIndicatorFormModal({ open, indicator, onClose }: Props) {
  const isEdit = Boolean(indicator)
  const { data: groups = [] } = useHealthIndicatorGroups()
  const create = useCreateIndicator()
  const update = useUpdateIndicator()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [groupId, setGroupId] = useState('')
  const [dataType, setDataType] = useState<IndicatorDataType>('DECIMAL')
  const [unit, setUnit] = useState('')
  const [collectionMethod, setCollectionMethod] = useState('')
  const [description, setDescription] = useState('')
  const [isDailyUse, setIsDailyUse] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [options, setOptions] = useState<OptionPayload[]>([])

  useEffect(() => {
    if (!open) return
    if (indicator) {
      setName(indicator.name)
      setCode(indicator.code)
      setGroupId(indicator.group.id)
      setDataType(indicator.dataType)
      setUnit(indicator.unit ?? '')
      setCollectionMethod(indicator.collectionMethod ?? '')
      setDescription(indicator.description ?? '')
      setIsDailyUse(indicator.isDailyUse)
      setSortOrder(indicator.sortOrder)
      setOptions(indicator.options?.map((o) => ({ value: o.value, label: o.label, sortOrder: o.sortOrder })) ?? [])
    } else {
      setName('')
      setCode('')
      setGroupId(groups[0]?.id ?? '')
      setDataType('DECIMAL')
      setUnit('')
      setCollectionMethod('')
      setDescription('')
      setIsDailyUse(true)
      setSortOrder(0)
      setOptions([])
    }
  }, [indicator, open])

  const isPending = create.isPending || update.isPending
  const mutError = create.error ?? update.error
  const showOptions = dataType === 'SELECT'

  function addOption() {
    setOptions([...options, { value: '', label: '', sortOrder: options.length + 1 }])
  }

  function removeOption(i: number) {
    setOptions(options.filter((_, idx) => idx !== i))
  }

  function updateOption(i: number, field: keyof OptionPayload, val: string | number) {
    setOptions(options.map((o, idx) => (idx === i ? { ...o, [field]: val } : o)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit && indicator) {
      update.mutate({
        id: indicator.id,
        payload: { name, groupId, description, unit, collectionMethod, isDailyUse, sortOrder, options: showOptions ? options : undefined },
      }, { onSuccess: onClose })
    } else {
      create.mutate({
        name, code: code.toUpperCase(), groupId, dataType, unit, collectionMethod, description,
        isDailyUse, sortOrder, options: showOptions ? options : undefined,
      }, { onSuccess: onClose })
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Sửa chỉ số sức khỏe' : 'Thêm chỉ số sức khỏe'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {mutError && <Alert message={getErrorMessage(mutError)} />}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Tên chỉ số" required>
            <input id="ind-name" className="field__control" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="Chiều cao" required />
          </Field>
          {!isEdit && (
            <Field label="Mã (CODE)" required>
              <input id="ind-code" className="field__control" value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="HEIGHT" required />
            </Field>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Nhóm chỉ số" required>
            <select id="ind-group" className="field__control" value={groupId} onChange={(e) => setGroupId(e.target.value)} required>
              <option value="">-- Chọn nhóm --</option>
              {groups.filter(g => g.isActive).map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </Field>
          {!isEdit && (
            <Field label="Kiểu dữ liệu" required>
              <select id="ind-datatype" className="field__control" value={dataType}
                onChange={(e) => setDataType(e.target.value as IndicatorDataType)}>
                {INDICATOR_DATA_TYPES.map((t) => (
                  <option key={t} value={t}>{DATA_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Đơn vị">
            <input id="ind-unit" className="field__control" value={unit}
              onChange={(e) => setUnit(e.target.value)} placeholder="cm" />
          </Field>
          <Field label="Phương thức thu thập">
            <input id="ind-method" className="field__control" value={collectionMethod}
              onChange={(e) => setCollectionMethod(e.target.value)} placeholder="Thước đo chiều cao" />
          </Field>
        </div>

        <Field label="Mô tả">
          <textarea id="ind-desc" className="field__control" value={description}
            onChange={(e) => setDescription(e.target.value)} rows={2} />
        </Field>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input id="ind-daily" type="checkbox" checked={isDailyUse}
            onChange={(e) => setIsDailyUse(e.target.checked)} />
          <label htmlFor="ind-daily" style={{ cursor: 'pointer' }}>Sử dụng hàng ngày</label>
        </div>

        {showOptions && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong style={{ fontSize: 14 }}>Các lựa chọn</strong>
              <Button type="button" size="sm" variant="soft" onClick={addOption}>+ Thêm</Button>
            </div>
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, marginBottom: 6 }}>
                <input className="field__control" value={opt.value}
                  onChange={(e) => updateOption(i, 'value', e.target.value.toUpperCase())}
                  placeholder="NORMAL" />
                <input className="field__control" value={opt.label}
                  onChange={(e) => updateOption(i, 'label', e.target.value)}
                  placeholder="Bình thường" />
                <Button type="button" size="sm" variant="soft" onClick={() => removeOption(i)}>✕</Button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Huỷ</Button>
          <Button type="submit" loading={isPending}>{isEdit ? 'Lưu thay đổi' : 'Tạo chỉ số'}</Button>
        </div>
      </form>
    </Modal>
  )
}
