import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { NAV_ITEMS, type NavChild } from '@/components/layout/nav-items'
import { IconChevronDown, IconShield } from '@/components/ui/Icon'

function linkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
}

function subLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'sidebar__sublink sidebar__sublink--active' : 'sidebar__sublink'
}

interface SidebarGroupProps {
  label: string
  icon: ReactNode
  items: NavChild[]
}

function SidebarGroup({ label, icon, items }: SidebarGroupProps) {
  const { pathname } = useLocation()
  const hasActiveChild = items.some(
    (child) => pathname === child.to || pathname.startsWith(`${child.to}/`),
  )
  const [open, setOpen] = useState(hasActiveChild)

  // Điều hướng vào một trang con (từ nơi khác) thì tự bung nhóm ra.
  useEffect(() => {
    if (hasActiveChild) setOpen(true)
  }, [hasActiveChild])

  return (
    <div className={hasActiveChild ? 'sidebar__group sidebar__group--current' : 'sidebar__group'}>
      <button
        type="button"
        className={hasActiveChild ? 'sidebar__link sidebar__link--parent' : 'sidebar__link'}
        title={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {icon}
        <span>{label}</span>
        <IconChevronDown
          size={16}
          className={open ? 'sidebar__caret sidebar__caret--open' : 'sidebar__caret'}
        />
      </button>

      {open && (
        <div className="sidebar__sub">
          {items.map((child) => (
            <NavLink key={child.to} to={child.to} className={subLinkClass}>
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <IconShield className="sidebar__logo" />
        <span className="sidebar__wordmark">
          EDU <em>HEALTH</em>
        </span>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) =>
          item.kind === 'group' ? (
            <SidebarGroup
              key={item.label}
              label={item.label}
              icon={item.icon}
              items={item.children}
            />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={linkClass}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>
    </aside>
  )
}
