import { useState, useMemo } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { IconPlus } from '@/components/ui/Icon'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { TableFooter } from '@/components/ui/TableFooter'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import {
  useHealthIndicatorDashboard,
  useHealthIndicatorGroups,
  useHealthIndicators,
  useUpdateIndicatorStatus,
} from '@/hooks/useHealthIndicators'
import { usePagination } from '@/hooks/usePagination'
import { GroupFormModal } from '@/pages/health-indicators/GroupFormModal'
import { HealthIndicatorFormModal } from '@/pages/health-indicators/HealthIndicatorFormModal'
import type { HealthIndicator, IndicatorStatus } from '@/types/health-indicator'
import { DATA_TYPE_LABELS, INDICATOR_STATUSES, STATUS_LABELS } from '@/types/health-indicator'

const STATUS_TONE: Record<IndicatorStatus, BadgeTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
}

export function HealthIndicatorPage() {
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<IndicatorStatus | ''>('')
  const [indicatorModal, setIndicatorModal] = useState(false)
  const [groupModal, setGroupModal] = useState(false)
  const [editing, setEditing] = useState<HealthIndicator | undefined>()
  const [editingGroup, setEditingGroup] = useState<any>(undefined)

  const queryParams = useMemo(() => ({
    search: search || undefined,
    groupId: groupFilter || undefined,
    status: (statusFilter || undefined) as IndicatorStatus | undefined,
    limit: 100,
  }), [search, groupFilter, statusFilter])

  const { data: dashboard } = useHealthIndicatorDashboard()
  const { data: groups = [] } = useHealthIndicatorGroups()
  const { data: listResponse, isLoading, error, refetch } = useHealthIndicators(queryParams)
  const updateStatus = useUpdateIndicatorStatus()

  const indicators = listResponse?.data ?? []
  const paged = usePagination(indicators)

  function openCreate() { setEditing(undefined); setIndicatorModal(true) }
  function openEdit(ind: HealthIndicator) { setEditing(ind); setIndicatorModal(true) }
  function openGroupCreate() { setEditingGroup(undefined); setGroupModal(true) }


  function handleStatusToggle(ind: HealthIndicator) {
    const next: IndicatorStatus = ind.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    updateStatus.mutate({ id: ind.id, status: next })
  }

  if (isLoading) return <Loading />
  if (error) return (
    <ErrorState message={getErrorMessage(error)} action={
      <Button variant="secondary" size="sm" onClick={() => void refetch()}>Thử lại</Button>
    } />
  )

  const hasFilter = Boolean(search || groupFilter || statusFilter)

  return (
    <>
      <PageHeader
        title="Chỉ số sức khỏe"
        subtitle="Cấu hình các chỉ số sức khỏe mà nhà trường theo dõi cho học sinh."
      />

      {/* Dashboard stats */}
      <div className="stat-grid">
        <StatCard label="Tổng chỉ số" value={dashboard?.total ?? '—'} />
        <StatCard label="Đang hoạt động" value={dashboard?.active ?? '—'} />
        <StatCard label="Ngừng dùng" value={dashboard?.inactive ?? '—'} />
        {(dashboard?.byGroup ?? []).map((g) => (
          <StatCard key={g.groupId} label={g.name} value={g.count} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên, mã..." />
        <select
          className="field__control"
          style={{ maxWidth: 200 }}
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          aria-label="Lọc theo nhóm"
        >
          <option value="">Tất cả nhóm</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select
          className="field__control"
          style={{ maxWidth: 180 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as IndicatorStatus | '')}
          aria-label="Lọc theo trạng thái"
        >
          <option value="">Tất cả trạng thái</option>
          {INDICATOR_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <Button variant="soft" size="sm" onClick={openGroupCreate}>Quản lý nhóm</Button>
        <Button onClick={openCreate}><IconPlus size={16} />Thêm chỉ số</Button>
      </div>

      {updateStatus.error && (
        <div style={{ marginBottom: 12 }}>
          <Alert message={getErrorMessage(updateStatus.error)} />
        </div>
      )}

      <Card flush>
        {paged.items.length === 0 ? (
          <EmptyState
            message={hasFilter ? 'Không tìm thấy chỉ số phù hợp.' : 'Chưa có chỉ số nào.'}
            action={!hasFilter && <Button size="sm" onClick={openCreate}>Thêm chỉ số đầu tiên</Button>}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table__index">STT</th>
                    <th>Tên chỉ số</th>
                    <th>Mã</th>
                    <th>Nhóm</th>
                    <th>Kiểu dữ liệu</th>
                    <th>Đơn vị</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((ind, index) => (
                    <tr key={ind.id}>
                      <td className="table__index">{paged.from + index}</td>
                      <td>{ind.name}</td>
                      <td><code style={{ fontSize: 12 }}>{ind.code}</code></td>
                      <td>{ind.group.name}</td>
                      <td>{DATA_TYPE_LABELS[ind.dataType]}</td>
                      <td>{ind.unit ?? '—'}</td>
                      <td>
                        <Badge tone={STATUS_TONE[ind.status]}>{STATUS_LABELS[ind.status]}</Badge>
                      </td>
                      <td>
                        <div className="table__actions">
                          <Button variant="soft" size="sm" onClick={() => openEdit(ind)}>Sửa</Button>
                          <Button
                            variant="soft"
                            size="sm"
                            loading={updateStatus.isPending && updateStatus.variables?.id === ind.id}
                            onClick={() => handleStatusToggle(ind)}
                          >
                            {ind.status === 'ACTIVE' ? 'Ngừng' : 'Kích hoạt'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TableFooter
              from={paged.from} to={paged.to} total={paged.total}
              page={paged.page} pageCount={paged.pageCount} onPageChange={paged.setPage}
              pageSize={paged.pageSize} onPageSizeChange={paged.setPageSize}
              unit="chỉ số"
            />
          </>
        )}
      </Card>

      {/* Groups panel (compact table in modal would be better, but for now show list) */}

      <HealthIndicatorFormModal
        open={indicatorModal}
        indicator={editing}
        onClose={() => setIndicatorModal(false)}
      />
      <GroupFormModal
        open={groupModal}
        group={editingGroup}
        onClose={() => setGroupModal(false)}
      />
    </>
  )
}
