import { api } from '@/lib/http';
import type {
  CreateGroupPayload,
  CreateIndicatorPayload,
  HealthIndicator,
  HealthIndicatorDashboard,
  HealthIndicatorGroup,
  HealthIndicatorListResponse,
  IndicatorQueryParams,
  IndicatorStatus,
  UpdateGroupPayload,
  UpdateIndicatorPayload,
} from '@/types/health-indicator';

const GROUP_BASE = '/v1/health-indicator-groups';
const IND_BASE = '/v1/health-indicators';

export const healthIndicatorService = {
  // --- Groups ---
  listGroups: () => api.get<HealthIndicatorGroup[]>(GROUP_BASE),
  createGroup: (payload: CreateGroupPayload) =>
    api.post<HealthIndicatorGroup>(GROUP_BASE, payload),
  updateGroup: (id: string, payload: UpdateGroupPayload) =>
    api.patch<HealthIndicatorGroup>(`${GROUP_BASE}/${id}`, payload),
  updateGroupStatus: (id: string, isActive: boolean) =>
    api.patch<HealthIndicatorGroup>(`${GROUP_BASE}/${id}/status`, { isActive }),

  // --- Indicators ---
  dashboard: () => api.get<HealthIndicatorDashboard>(`${IND_BASE}/dashboard`),
  list: (params?: IndicatorQueryParams) =>
    api.get<HealthIndicatorListResponse>(IND_BASE, { params }),
  getById: (id: string) => api.get<HealthIndicator>(`${IND_BASE}/${id}`),
  create: (payload: CreateIndicatorPayload) =>
    api.post<HealthIndicator>(IND_BASE, payload),
  update: (id: string, payload: UpdateIndicatorPayload) =>
    api.patch<HealthIndicator>(`${IND_BASE}/${id}`, payload),
  updateStatus: (id: string, status: IndicatorStatus) =>
    api.patch<HealthIndicator>(`${IND_BASE}/${id}/status`, { status }),
};
