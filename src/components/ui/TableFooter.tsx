import { useId } from 'react'

import { Pagination } from '@/components/ui/Pagination'
import { PAGE_SIZE_OPTIONS } from '@/hooks/usePagination'

interface TableFooterProps {
  from: number
  to: number
  total: number
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  pageSize: number
  onPageSizeChange: (pageSize: number) => void
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
  pageSize,
  onPageSizeChange,
  unit,
}: TableFooterProps) {
  const selectId = useId()

  return (
    <div className="table-footer">
      <span className="table-footer__summary">
        Hiển thị {from} - {to} trong tổng số {total} {unit}
      </span>

      <div className="table-footer__controls">
        <div className="table-footer__size">
          <label htmlFor={selectId}>Số dòng mỗi trang</label>
          <select
            id={selectId}
            className="table-footer__select"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <Pagination page={page} pageCount={pageCount} onChange={onPageChange} />
      </div>
    </div>
  )
}
