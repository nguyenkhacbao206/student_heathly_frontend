import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-client'
import { healthIndicatorService } from '@/services/health-indicator.service'
import type {
  CreateGroupPayload,
  CreateIndicatorPayload,
  IndicatorQueryParams,
  IndicatorStatus,
  UpdateGroupPayload,
  UpdateIndicatorPayload,
} from '@/types/health-indicator'

// ---- Groups ----
export function useHealthIndicatorGroups() {
  return useQuery({
    queryKey: queryKeys.healthIndicators.groups,
    queryFn: healthIndicatorService.listGroups,
  })
}

export function useCreateGroup() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => healthIndicatorService.createGroup(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.healthIndicators.groups }),
  })
}

export function useUpdateGroup() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGroupPayload }) =>
      healthIndicatorService.updateGroup(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.healthIndicators.groups }),
  })
}

export function useUpdateGroupStatus() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      healthIndicatorService.updateGroupStatus(id, isActive),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.healthIndicators.groups }),
  })
}

// ---- Indicators ----
export function useHealthIndicatorDashboard() {
  return useQuery({
    queryKey: queryKeys.healthIndicators.dashboard,
    queryFn: healthIndicatorService.dashboard,
  })
}

export function useHealthIndicators(params?: IndicatorQueryParams) {
  return useQuery({
    queryKey: queryKeys.healthIndicators.all(params),
    queryFn: () => healthIndicatorService.list(params),
  })
}

export function useHealthIndicator(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.healthIndicators.detail(id ?? ''),
    queryFn: () => healthIndicatorService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateIndicator() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateIndicatorPayload) => healthIndicatorService.create(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['health-indicators'] })
    },
  })
}

export function useUpdateIndicator() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateIndicatorPayload }) =>
      healthIndicatorService.update(id, payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['health-indicators'] })
    },
  })
}

export function useUpdateIndicatorStatus() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: IndicatorStatus }) =>
      healthIndicatorService.updateStatus(id, status),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['health-indicators'] })
    },
  })
}
