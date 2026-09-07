import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/types/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Lỗi nghiệp vụ (4xx) thì không retry, chỉ retry lỗi mạng/5xx.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
        return failureCount < 2
      },
    },
    mutations: { retry: false },
  },
})

/** Khoá cache tập trung để tránh gõ chuỗi rải rác trong hooks. */
export const queryKeys = {
  auth: {
    users: ['auth', 'users'] as const,
  },
  teachers: {
    all: ['teachers'] as const,
    detail: (id: string) => ['teachers', id] as const,
  },
  students: {
    all: ['students'] as const,
    detail: (id: string) => ['students', id] as const,
  },
  health: {
    all: ['health'] as const,
  },
  schoolYears: {
    all: ['school-years'] as const,
    detail: (id: string) => ['school-years', id] as const,
  },
  measurementPeriods: {
    all: ['measurement-periods'] as const,
    detail: (id: string) => ['measurement-periods', id] as const,
  },
}
