import type { ReactNode } from 'react'

export function Loading({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="state">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="state">
      <span>{message}</span>
      {action}
    </div>
  )
}

export function ErrorState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="state">
      <span style={{ color: 'var(--color-danger)' }}>{message}</span>
      {action}
    </div>
  )
}
