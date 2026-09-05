import { Link } from 'react-router-dom'

import { ROUTES } from '@/routes/paths'

export function NotFoundPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1 className="auth-card__title">404</h1>
        <p className="auth-card__subtitle">Không tìm thấy trang bạn yêu cầu.</p>
        <Link to={ROUTES.dashboard}>Về trang tổng quan</Link>
      </div>
    </div>
  )
}
