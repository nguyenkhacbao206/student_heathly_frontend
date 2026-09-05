import { Pagination } from '@/components/ui/Pagination'

interface TableFooterProps {
  from: number
  to: number
  total: number
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  /** Danh từ đứng sau con số: "nhân sự", "học sinh"... */
  unit: string
}

export function TableFooter({
  from,
  to,
  total,
  page,
  pageCount,
  onPageChange,
  unit,
}: TableFooterProps) {
  return (
    <div className="table-footer">
      <span className="table-footer__summary">
        Hiển thị {from} - {to} trong tổng số {total} {unit}
      </span>
      <Pagination page={page} pageCount={pageCount} onChange={onPageChange} />
    </div>
  )
}
