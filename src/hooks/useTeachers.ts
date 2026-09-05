import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-client'
import { teacherService } from '@/services/teacher.service'
import type { TeacherPayload, TeacherStatus } from '@/types/teacher'

export function useTeachers() {
  return useQuery({
    queryKey: queryKeys.teachers.all,
    queryFn: teacherService.list,
  })
}

export function useTeacher(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teachers.detail(id ?? ''),
    queryFn: () => teacherService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateTeacher() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: TeacherPayload) => teacherService.create(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.teachers.all }),
  })
}

export function useUpdateTeacher() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TeacherPayload }) =>
      teacherService.update(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.teachers.all }),
  })
}

export function useUpdateTeacherStatus() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TeacherStatus }) =>
      teacherService.updateStatus(id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.teachers.all }),
  })
}

export function useDeleteTeacher() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teacherService.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.teachers.all }),
  })
}
