import { useEffect, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { IconPlus } from '@/components/ui/Icon'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { TableFooter } from '@/components/ui/TableFooter'
import { getErrorMessage } from '@/hooks/useApiErrorMessage'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useParents } from '@/hooks/useParents'
import { DEFAULT_PAGE_SIZE } from '@/hooks/usePagination'
import { formatDate } from '@/lib/format'
import { GenerateParentAccountModal } from '@/pages/parents/GenerateParentAccountModal'
import { ParentDetailModal } from '@/pages/parents/ParentDetailModal'
import {
  PARENT_STATUSES,
  PARENT_STATUS_LABELS,
  getParentStatus,
  type ParentAccountStatus,
} from '@/types/parent'

const STATUS_TONE: Record<ParentAccountStatus, BadgeTone> = {
  NOT_LOGIN: 'warning',
  LOGGED_IN: 'info',
  PASSWORD_CHANGED: 'success',
}

export function ParentPage() {
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<ParentAccountStatus | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [detailId, setDetailId] = useState<number | undefined>()
  const [generateOpen, setGenerateOpen] = useState(false)

  // GET /admin/parents lọc và phân trang ngay trên server -> chỉ debounce ô tìm kiếm.
  const search = useDebouncedValue(keyword)

  const { data, isLoading, isFetching, error, refetch } = useParents({
    search: search.trim() || undefined,
    status: statusFilter || undefined,
    page,
    limit: pageSize,
  })

  // Đổi bộ lọc mà đang ở trang 5 thì sẽ rơi vào trang rỗng -> luôn về trang 1.
  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, pageSize])

  /**
   * Backend chưa có endpoint thống kê cho phụ huynh, nên số liệu ở 4 thẻ dưới đây
   * lấy từ `meta.total` của 4 truy vấn limit=1 (nhẹ, và react-query cache lại).
   */
  const totalAll = useParents({ limit: 1 }).data?.meta.total
  const totalNotLogin = useParents({ limit: 1, status: 'NOT_LOGIN' }).data?.meta.total
  const totalLoggedIn = useParents({ limit: 1, status: 'LOGGED_IN' }).data?.meta.total
  const totalChanged = useParents({ limit: 1, status: 'PASSWORD_CHANGED' }).data?.meta.total

  if (isLoading) return <Loading />
  if (error) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        action={
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            Thử lại
          </Button>
        }
      />
    )
  }

  const parents = data?.data ?? []
  const meta = data?.meta
  const total = meta?.total ?? 0
  const pageCount = Math.max(1, meta?.totalPages ?? 1)
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const hasFilter = Boolean(search.trim() || statusFilter)

  return (
    <>
      <PageHeader
        title="Giám sát phụ huynh"
        subtitle="Theo dõi tài khoản phụ huynh, học sinh được liên kết và tình trạng đăng nhập."
      />

      <div className="stat-grid">
        <StatCard label="Tổng tài khoản" value={totalAll ?? '—'} />
        <StatCard label="Chưa đăng nhập" value={totalNotLogin ?? '—'} />
        <StatCard label="Đã đăng nhập" value={totalLoggedIn ?? '—'} />
        <StatCard label="Đã đổi mật khẩu" value={totalChanged ?? '—'} />
      </div>

      <div className="toolbar">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="Tìm theo tên hoặc email phụ huynh..."
        />
        <select
          className="field__control"
          style={{ maxWidth: 220 }}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ParentAccountStatus | '')}
          aria-label="Lọc theo trạng thái tài khoản"
        >
          <option value="">Tất cả trạng thái</option>
          {PARENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PARENT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <Button variant="secondary" loading={isFetching} onClick={() => void refetch()}>
          Làm mới
        </Button>
        <Button onClick={() => setGenerateOpen(true)}>
          <IconPlus size={16} />
          Tạo tài khoản phụ huynh
        </Button>
      </div>

      <Card flush>
        {parents.length === 0 ? (
          <EmptyState
            message={
              hasFilter
                ? 'Không tìm thấy phụ huynh phù hợp.'
                : 'Chưa có tài khoản phụ huynh nào trong hệ thống.'
            }
            action={
              !hasFilter && (
                <Button size="sm" onClick={() => setGenerateOpen(true)}>
                  Tạo tài khoản cho học sinh hiện có
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table__index">STT</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Học sinh liên kết</th>
                    <th>Trạng thái</th>
                    <th>Đăng nhập gần nhất</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {parents.map((parent, index) => {
                    const status = getParentStatus(parent)

                    return (
                      <tr key={parent.id}>
                        <td className="table__index">{from + index}</td>
                        <td>{parent.name}</td>
                        <td>{parent.email}</td>
                        <td>
                          <Badge tone={parent.studentCount > 0 ? 'info' : 'neutral'}>
                            {parent.studentCount} học sinh
                          </Badge>
                        </td>
                        <td>
                          <Badge tone={STATUS_TONE[status]}>{PARENT_STATUS_LABELS[status]}</Badge>
                        </td>
                        <td>{formatDate(parent.lastLoginAt)}</td>
                        <td>{formatDate(parent.createdAt)}</td>
                        <td>
                          <div className="table__actions">
                            <Button variant="soft" size="sm" onClick={() => setDetailId(parent.id)}>
                              Chi tiết
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <TableFooter
              from={from}
              to={to}
              total={total}
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              unit="phụ huynh"
            />
          </>
        )}
      </Card>

      <GenerateParentAccountModal open={generateOpen} onClose={() => setGenerateOpen(false)} />

      <ParentDetailModal
        open={detailId != null}
        parentId={detailId}
        onClose={() => setDetailId(undefined)}
      />
    </>
  )
}
