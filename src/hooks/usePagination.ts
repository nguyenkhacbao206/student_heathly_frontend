import { useEffect, useMemo, useState } from 'react'

interface UsePaginationResult<T> {
  page: number
  pageCount: number
  setPage: (page: number) => void
  /** Phần tử của trang hiện tại. */
  items: T[]
  /** Chỉ số (1-based) của phần tử đầu trang — dùng cho cột STT và dòng "Hiển thị x - y". */
  from: number
  to: number
  total: number
}

/**
 * Phân trang phía client. Khi backend hỗ trợ `?page=&limit=` thì bỏ hook này,
 * truyền thẳng page/limit vào service và đọc meta từ response.
 */
export function usePagination<T>(source: T[], pageSize = 10): UsePaginationResult<T> {
  const [page, setPage] = useState(1)
  const total = source.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  // Lọc/tìm kiếm làm ngắn danh sách -> kéo trang hiện tại về trong khoảng hợp lệ.
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount))
  }, [pageCount])

  const items = useMemo(
    () => source.slice((page - 1) * pageSize, page * pageSize),
    [source, page, pageSize],
  )

  return {
    page,
    pageCount,
    setPage,
    items,
    from: total === 0 ? 0 : (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, total),
    total,
  }
}
