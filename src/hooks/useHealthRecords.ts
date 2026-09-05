import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-client'
import { healthService } from '@/services/health.service'
import type { HealthPayload } from '@/types/health'

export function useHealthRecords() {
  return useQuery({
    queryKey: queryKeys.health.all,
    queryFn: healthService.list,
  })
}

export function useCreateHealthRecord() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: HealthPayload) => healthService.create(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.health.all }),
  })
}
