import type { ReactNode } from 'react'

import {
  IconCalendar,
  IconHome,
  IconParents,
  IconReport,
  IconStudents,
  IconTeacher,
} from '@/components/ui/Icon'
import { ROUTES } from '@/routes/paths'

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
  /** true = chỉ active khi khớp chính xác (dùng cho route index "/"). */
  end?: boolean
}

/** Nguồn duy nhất của menu sidebar — sửa ở đây là đổi cả sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Tổng quan', icon: <IconHome />, end: true },
  { to: ROUTES.staff, label: 'Quản lý giáo viên', icon: <IconTeacher /> },
  { to: ROUTES.parents, label: 'Giám sát phụ huynh', icon: <IconParents /> },
  { to: ROUTES.students, label: 'Lớp & Học sinh', icon: <IconStudents /> },
  { to: ROUTES.reports, label: 'Báo cáo thống kê', icon: <IconReport /> },
  { to: ROUTES.campaigns, label: 'Đợt đo & Năm học', icon: <IconCalendar /> },
]
