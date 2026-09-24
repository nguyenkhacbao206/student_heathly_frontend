import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-client'
import { parentService } from '@/services/parent.service'
import type { GenerateParentAccountPayload, ParentQueryParams } from '@/types/parent'

export function useParents(params?: ParentQueryParams) {
  return useQuery({
    queryKey: queryKeys.parents.list(params),
    queryFn: () => parentService.list(params),
  })
}

export function useParent(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.parents.detail(id ?? 0),
    queryFn: () => parentService.getById(id as number),
    enabled: id != null,
  })
}

export function useLinkStudent() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ parentId, studentId }: { parentId: number; studentId: string }) =>
      parentService.linkStudent(parentId, studentId),
    onSuccess: () => {
      // studentCount ở list và students ở detail đều đổi -> invalidate cả nhánh 'parents'.
      void client.invalidateQueries({ queryKey: queryKeys.parents.all })
      // Student.parentId đổi -> danh sách học sinh chưa có phụ huynh cũng đổi.
      void client.invalidateQueries({ queryKey: queryKeys.students.all })
    },
  })
}

export function useUnlinkStudent() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ parentId, studentId }: { parentId: number; studentId: string }) =>
      parentService.unlinkStudent(parentId, studentId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.parents.all })
      void client.invalidateQueries({ queryKey: queryKeys.students.all })
    },
  })
}

export function useResetParentPassword() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ parentId, studentId }: { parentId: number; studentId: string }) =>
      parentService.resetPassword(parentId, studentId),
    // Reset làm firstLogin = true, passwordChanged = false -> trạng thái ở bảng đổi theo.
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.parents.all }),
  })
}

export function useGenerateParentAccounts() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: GenerateParentAccountPayload) => parentService.generate(payload),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.parents.all })
      void client.invalidateQueries({ queryKey: queryKeys.students.all })
    },
  })
}
