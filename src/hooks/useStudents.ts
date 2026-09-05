import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-client'
import { studentService } from '@/services/student.service'
import type { StudentPayload } from '@/types/student'

export function useStudents() {
  return useQuery({
    queryKey: queryKeys.students.all,
    queryFn: studentService.list,
  })
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.students.detail(id ?? ''),
    queryFn: () => studentService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateStudent() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: StudentPayload) => studentService.create(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.students.all }),
  })
}

export function useUpdateStudent(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: StudentPayload) => studentService.update(id, payload),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.students.all })
      void client.invalidateQueries({ queryKey: queryKeys.students.detail(id) })
    },
  })
}

export function useDeleteStudent() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => studentService.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.students.all }),
  })
}
