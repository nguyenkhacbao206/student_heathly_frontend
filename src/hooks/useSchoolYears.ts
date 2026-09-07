import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-client'
import { schoolYearService } from '@/services/school-year.service'
import type { SchoolYearPayload } from '@/types/school-year'

export function useSchoolYears() {
  return useQuery({
    queryKey: queryKeys.schoolYears.all,
    queryFn: schoolYearService.list,
  })
}

export function useSchoolYear(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.schoolYears.detail(id ?? ''),
    queryFn: () => schoolYearService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateSchoolYear() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: SchoolYearPayload) => schoolYearService.create(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.schoolYears.all }),
  })
}

export function useUpdateSchoolYear() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SchoolYearPayload }) =>
      schoolYearService.update(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.schoolYears.all }),
  })
}

export function useActivateSchoolYear() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => schoolYearService.activate(id),
    // Đổi năm áp dụng làm isActive của MỌI năm thay đổi -> nạp lại cả danh sách.
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.schoolYears.all }),
  })
}

export function useDeleteSchoolYear() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => schoolYearService.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.schoolYears.all }),
  })
}
