export const INDICATOR_DATA_TYPES = [
  'INTEGER', 'DECIMAL', 'SELECT', 'BLOOD_PRESSURE', 'AUTO_CALCULATED', 'TEXT',
] as const;
export type IndicatorDataType = (typeof INDICATOR_DATA_TYPES)[number];

export const INDICATOR_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type IndicatorStatus = (typeof INDICATOR_STATUSES)[number];

export const INDICATOR_CALCULATION_TYPES = ['NONE', 'BMI'] as const;
export type IndicatorCalculationType = (typeof INDICATOR_CALCULATION_TYPES)[number];

export const DATA_TYPE_LABELS: Record<IndicatorDataType, string> = {
  INTEGER: 'Số nguyên',
  DECIMAL: 'Số thực',
  SELECT: 'Lựa chọn',
  BLOOD_PRESSURE: 'Huyết áp',
  AUTO_CALCULATED: 'Tự tính',
  TEXT: 'Văn bản',
};

export const STATUS_LABELS: Record<IndicatorStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng dùng',
};

export interface IndicatorOption {
  id: string;
  value: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
}

export interface HealthIndicatorGroup {
  id: string;
  name: string;
  code: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  indicatorCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HealthIndicator {
  id: string;
  name: string;
  code: string;
  description: string | null;
  group: { id: string; name: string; code: string };
  dataType: IndicatorDataType;
  unit: string | null;
  collectionMethod: string | null;
  status: IndicatorStatus;
  isDailyUse: boolean;
  calculationType: IndicatorCalculationType;
  sortOrder: number;
  options?: IndicatorOption[];
  createdAt: string;
  updatedAt: string;
}

export interface HealthIndicatorListResponse {
  data: HealthIndicator[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface HealthIndicatorDashboard {
  total: number;
  active: number;
  inactive: number;
  byGroup: { groupId: string; code: string; name: string; count: number }[];
}

// Payloads
export interface CreateGroupPayload {
  name: string;
  code: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateGroupPayload {
  name?: string;
  description?: string;
  sortOrder?: number;
}

export interface OptionPayload {
  value: string;
  label: string;
  sortOrder?: number;
}

export interface CreateIndicatorPayload {
  name: string;
  code: string;
  groupId: string;
  dataType: IndicatorDataType;
  unit?: string;
  collectionMethod?: string;
  description?: string;
  isDailyUse?: boolean;
  calculationType?: IndicatorCalculationType;
  sortOrder?: number;
  options?: OptionPayload[];
}

export interface UpdateIndicatorPayload {
  name?: string;
  groupId?: string;
  description?: string;
  unit?: string;
  collectionMethod?: string;
  isDailyUse?: boolean;
  sortOrder?: number;
  options?: OptionPayload[];
}

export interface IndicatorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  groupId?: string;
  status?: IndicatorStatus;
}
