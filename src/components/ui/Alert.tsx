interface AlertProps {
  variant?: 'error' | 'success'
  message: string
  /** Danh sách lỗi validate chi tiết (class-validator trả về mảng). */
  details?: string[]
}

export function Alert({ variant = 'error', message, details = [] }: AlertProps) {
  return (
    <div className={`alert alert--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      {message}
      {details.length > 1 && (
        <ul className="alert__list">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
