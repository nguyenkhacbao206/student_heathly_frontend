import { useEffect, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useCreateGroup, useUpdateGroup } from '@/hooks/useHealthIndicators'
import type { HealthIndicatorGroup } from '@/types/health-indicator'

interface Props {
  open: boolean
  group?: HealthIndicatorGroup
  onClose: () => void
}

export function GroupFormModal({ open, group, onClose }: Props) {
  const isEdit = Boolean(group)
  const create = useCreateGroup()
  const update = useUpdateGroup()

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState(0)

  useEffect(() => {
    if (!open) return
    if (group) {
      setName(group.name)
      setCode(group.code)
      setDescription(group.description ?? '')
      setSortOrder(group.sortOrder)
    } else {
      setName(''); setCode(''); setDescription(''); setSortOrder(0)
    }
  }, [group, open])

  const isPending = create.isPending || update.isPending
  const mutError = create.error ?? update.error

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit && group) {
      update.mutate({ id: group.id, payload: { name, description, sortOrder } }, { onSuccess: onClose })
    } else {
      create.mutate({ name, code: code.toUpperCase(), description, sortOrder }, { onSuccess: onClose })
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Sửa nhóm chỉ số' : 'Thêm nhóm chỉ số'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mutError && <Alert message={getErrorMessage(mutError)} />}
        <Field label="Tên nhóm" required>
          <input
            id="group-name"
            className="field__control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Thể chất"
            required
          />
        </Field>
        {!isEdit && (
          <Field label="Mã nhóm (CODE)" required>
            <input
              id="group-code"
              className="field__control"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="PHYSICAL"
              required
            />
          </Field>
        )}
        <Field label="Mô tả">
          <textarea
            id="group-description"
            className="field__control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </Field>
        <Field label="Thứ tự hiển thị">
          <input
            id="group-sort-order"
            type="number"
            className="field__control"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            min={0}
          />
        </Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Huỷ</Button>
          <Button type="submit" loading={isPending}>{isEdit ? 'Lưu' : 'Tạo nhóm'}</Button>
        </div>
      </form>
    </Modal>
  )
}
