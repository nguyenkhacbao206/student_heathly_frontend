import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { IconBell, IconChevronDown, IconMenu, IconUser } from '@/components/ui/Icon'
import { env } from '@/config/env'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/routes/paths'

interface TopbarProps {
  onToggleSidebar: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Click ra ngoài thì đóng dropdown.
  useEffect(() => {
    if (!open) return
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleLogout() {
    logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <header className="topbar">
      <button type="button" className="icon-btn" onClick={onToggleSidebar} aria-label="Ẩn/hiện menu">
        <IconMenu size={20} />
      </button>

      <div className="topbar__spacer" />

      <button type="button" className="icon-btn topbar__bell" aria-label="Thông báo">
        <IconBell size={19} />
        <span className="topbar__bell-dot" />
      </button>

      <div className="user-menu" ref={menuRef}>
        <button
          type="button"
          className="user-menu__trigger"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <IconUser size={20} />
          <span className="user-menu__name">{user?.name ?? 'Người dùng'}</span>
          <IconChevronDown size={16} />
        </button>

        {open && (
          <div className="user-menu__dropdown" role="menu">
            <div className="user-menu__info">
              <div className="user-menu__info-name">{user?.name ?? 'Người dùng'}</div>
              <div className="user-menu__info-email">{user?.email}</div>
            </div>
            {env.authDisabled ? (
              <div className="user-menu__item" style={{ color: 'var(--color-muted)' }}>
                Đang tắt đăng nhập (VITE_AUTH_DISABLED)
              </div>
            ) : (
              <button
                type="button"
                className="user-menu__item"
                role="menuitem"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
