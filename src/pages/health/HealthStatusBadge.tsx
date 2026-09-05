import { HEALTH_STATUS_LABELS, type HealthStatus } from '@/types/health'

const VARIANTS: Record<HealthStatus, string> = {
  NORMAL: 'badge--success',
  UNDERWEIGHT: 'badge--warning',
  OVERWEIGHT: 'badge--warning',
  OBESE: 'badge--danger',
}

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  const variant = VARIANTS[status] ?? 'badge--neutral'
  return <span className={`badge ${variant}`}>{HEALTH_STATUS_LABELS[status] ?? status}</span>
}
