import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

/** Khung chung mọi trang sau đăng nhập: sidebar trái + topbar trên + nội dung. */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`app-shell${collapsed ? ' app-shell--collapsed' : ''}`}>
      <Sidebar />

      <div className="app-shell__body">
        <Topbar onToggleSidebar={() => setCollapsed((value) => !value)} />
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
