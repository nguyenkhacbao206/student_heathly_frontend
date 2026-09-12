import { useEffect, useMemo, useState } from 'react'

/** Các lựa chọn "số dòng mỗi trang" dùng chung cho mọi bảng. */
export const PAGE_SIZE_OPTIONS = [10, 15, 20, 25] as const

export const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0]

interface UsePaginationResult<T> {
  page: number
  pageCount: number
  setPage: (page: number) => void
  pageSize: number
  setPageSize: (pageSize: number) => void
  items: T[]
  from: number
  to: number
  total: number
}

export function usePagination<T>(
  source: T[],
  initialPageSize: number = DEFAULT_PAGE_SIZE,
): UsePaginationResult<T> {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const total = source.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount))
  }, [pageCount])

  /**
   * Đổi số dòng mỗi trang thì nhảy tới trang chứa bản ghi đầu tiên đang xem,
   * thay vì quăng người dùng về trang 1.
   */
  function setPageSize(next: number) {
    if (next === pageSize) return
    const firstIndex = (page - 1) * pageSize
    setPageSizeState(next)
    setPage(Math.floor(firstIndex / next) + 1)
  }

  const items = useMemo(
    () => source.slice((page - 1) * pageSize, page * pageSize),
    [source, page, pageSize],
  )

  return {
    page,
    pageCount,
    setPage,
    pageSize,
    setPageSize,
    items,
    from: total === 0 ? 0 : (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, total),
    total,
  }
}
