import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { useAuth } from '@/hooks/useAuth'
import { getErrorDetails, getErrorMessage } from '@/hooks/useApiErrorMessage'
import { ROUTES } from '@/routes/paths'

const MIN_PASSWORD_LENGTH = 8

export function RegisterPage() {
  const { register, login } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [submitting, setSubmitting] = useState(false)

  // Chặn sớm ở FE cho khớp @MinLength(8) của RegisterDto.
  const passwordError =
    password.length > 0 && password.length < MIN_PASSWORD_LENGTH
      ? `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`
      : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (passwordError) return

    setError(null)
    setSubmitting(true)

    try {
      await register({ name, email, password })
      // Đăng ký xong đăng nhập luôn cho mượt.
      await login({ email, password })
      navigate(ROUTES.dashboard, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-card__title">Tạo tài khoản</h1>
        <p className="auth-card__subtitle">Đăng ký để bắt đầu quản lý hồ sơ học sinh</p>

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          {error != null && (
            <Alert message={getErrorMessage(error)} details={getErrorDetails(error)} />
          )}

          <TextField
            label="Họ và tên"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            hint={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
            required
          />

          <Button type="submit" block loading={submitting}>
            Đăng ký
          </Button>
        </form>

        <p className="auth-card__footer">
          Đã có tài khoản? <Link to={ROUTES.login}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
