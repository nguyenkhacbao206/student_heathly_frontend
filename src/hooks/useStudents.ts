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

export function useImportStudents() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ file, classId }: { file: File; classId: string }) =>
      studentService.importExcel(file, classId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.students.all })
      // Sĩ số của lớp vừa nhập đã đổi -> nạp lại cả danh sách lớp và chi tiết lớp.
      void client.invalidateQueries({ queryKey: queryKeys.classes.all })
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
