import { IconChevronLeft, IconChevronRight } from '@/components/ui/Icon'

interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

/** [1, 2, 3, '…', 10] — luôn giữ trang đầu, trang cuối và 1 trang quanh trang hiện tại. */
function buildPages(page: number, pageCount: number): (number | '…')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1)

  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1])
  // Trang đầu/cuối luôn kèm thêm 2 trang kế để dải số không bị hụt.
  if (page <= 3) [2, 3, 4].forEach((value) => pages.add(value))
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((v) => pages.add(v))

  const sorted = [...pages].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b)

  const result: (number | '…')[] = []
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push('…')
    result.push(value)
  })
  return result
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        type="button"
        className="pagination__btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Trang trước"
      >
        <IconChevronLeft size={16} />
      </button>

      {buildPages(page, pageCount).map((item, index) =>
        item === '…' ? (
          // eslint-disable-next-line react/no-array-index-key -- dấu "…" không có id riêng
          <span key={`gap-${index}`} className="pagination__ellipsis">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`pagination__btn${item === page ? ' pagination__btn--active' : ''}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className="pagination__btn"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        aria-label="Trang sau"
      >
        <IconChevronRight size={16} />
      </button>
    </nav>
  )
}
