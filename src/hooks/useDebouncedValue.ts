import { useEffect, useState } from 'react'

/**
 * Hoãn giá trị lại `delay` ms — dùng cho ô tìm kiếm gọi API trên server
 * (như /admin/parents) để không bắn một request cho mỗi ký tự gõ vào.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
