import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-client'
import { classService } from '@/services/class.service'
import type { ClassPayload } from '@/types/class'

export function useClasses(schoolYearId?: string) {
  return useQuery({
    queryKey: queryKeys.classes.list(schoolYearId),
    queryFn: () => classService.list(schoolYearId),
  })
}

export function useClass(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.classes.detail(id ?? ''),
    queryFn: () => classService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useClassStudents(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.classes.students(id ?? ''),
    queryFn: () => classService.getStudents(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateClass() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClassPayload) => classService.create(payload),
    // Khoá list gồm cả biến thể lọc theo năm học -> invalidate cả nhánh 'classes'.
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.classes.all }),
  })
}

export function useUpdateClass() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ClassPayload }) =>
      classService.update(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.classes.all }),
  })
}

export function useDeleteClass() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => classService.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.classes.all }),
  })
}
