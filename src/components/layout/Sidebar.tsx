import { NavLink } from 'react-router-dom'

import { NAV_ITEMS } from '@/components/layout/nav-items'
import { IconShield } from '@/components/ui/Icon'

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
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
