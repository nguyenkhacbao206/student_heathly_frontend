import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Loading } from '@/components/ui/States'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/routes/paths'

/** Chặn khách vãng lai; nhớ trang đang định vào để quay lại sau khi đăng nhập. */
export function RequireAuth() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) return <Loading label="Đang kiểm tra phiên đăng nhập..." />
  if (!isAuthenticated) return <Navigate to={ROUTES.login} state={{ from: location }} replace />

  return <Outlet />
}

/** Đã đăng nhập thì không cho vào lại /login, /register. */
export function RedirectIfAuthenticated() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) return <Loading />
  if (isAuthenticated) return <Navigate to={ROUTES.dashboard} replace />

  return <Outlet />
}
