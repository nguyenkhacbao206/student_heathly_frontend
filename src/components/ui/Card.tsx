import type { ReactNode } from 'react'

interface CardProps {
  title?: ReactNode
  children: ReactNode
  /** Bỏ padding của body — dùng khi nhét bảng full-width vào card. */
  flush?: boolean
  className?: string
}

export function Card({ title, children, flush = false, className = '' }: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {title && <header className="card__header">{title}</header>}
      <div className={flush ? '' : 'card__body'}>{children}</div>
    </section>
  )
}

export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="card stat">
      <div className="stat__label">{label}</div>
      <div className="stat__value">{value}</div>
    </div>
  )
}
