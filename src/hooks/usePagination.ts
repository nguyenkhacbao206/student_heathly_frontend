import { useEffect, useMemo, useState } from 'react'

interface UsePaginationResult<T> {
  page: number
  pageCount: number
  setPage: (page: number) => void
  items: T[]
  from: number
  to: number
  total: number
}


export function usePagination<T>(source: T[], pageSize = 10): UsePaginationResult<T> {
  const [page, setPage] = useState(1)
  const total = source.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))


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
