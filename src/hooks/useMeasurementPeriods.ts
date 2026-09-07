import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-client'
import { measurementPeriodService } from '@/services/measurement-period.service'
import type { MeasurementPeriodPayload, MeasurementStatus } from '@/types/measurement-period'

export function useMeasurementPeriods() {
  return useQuery({
    queryKey: queryKeys.measurementPeriods.all,
    queryFn: measurementPeriodService.list,
  })
}

export function useMeasurementPeriod(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.measurementPeriods.detail(id ?? ''),
    queryFn: () => measurementPeriodService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateMeasurementPeriod() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: MeasurementPeriodPayload) => measurementPeriodService.create(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.measurementPeriods.all }),
  })
}

export function useUpdateMeasurementPeriod() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MeasurementPeriodPayload }) =>
      measurementPeriodService.update(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.measurementPeriods.all }),
  })
}

export function useUpdateMeasurementStatus() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MeasurementStatus }) =>
      measurementPeriodService.updateStatus(id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.measurementPeriods.all }),
  })
}

export function useDeleteMeasurementPeriod() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => measurementPeriodService.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.measurementPeriods.all }),
  })
}
