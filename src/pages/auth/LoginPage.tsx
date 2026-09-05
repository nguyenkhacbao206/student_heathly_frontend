import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { IconShield } from '@/components/ui/Icon'
import { useAuth } from '@/hooks/useAuth'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import { ROUTES } from '@/routes/paths'

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login({ email, password })
      const redirectTo = (location.state as LocationState | null)?.from?.pathname
      navigate(redirectTo ?? ROUTES.dashboard, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="sidebar__brand" style={{ padding: 0, marginBottom: 18 }}>
          <IconShield className="sidebar__logo" size={34} />
          <span className="sidebar__wordmark">
            EDU <em>HEALTH</em>
          </span>
        </div>

        <h1 className="auth-card__title">Đăng nhập</h1>
        <p className="auth-card__subtitle">Hệ thống quản lý sức khoẻ học sinh</p>

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          {error != null && (
            <Alert message={getErrorMessage(error)} details={getErrorDetails(error)} />
          )}

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Mật khẩu"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" block loading={submitting}>
            Đăng nhập
          </Button>
        </form>

        <p className="auth-card__footer">
          Chưa có tài khoản? <Link to={ROUTES.register}>Đăng ký</Link>
        </p>
      </div>
    </div>
  )
}
