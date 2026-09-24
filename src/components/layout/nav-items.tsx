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

export interface NavChild {
  to: string
  label: string
}

/** Mục đơn: bấm là điều hướng luôn. */
interface NavLinkItem {
  kind: 'link'
  to: string
  label: string
  icon: ReactNode
  /** true = chỉ active khi khớp chính xác (dùng cho route index "/"). */
  end?: boolean
}

/** Mục nhóm: bấm là mở/đóng danh sách con, bản thân nó không phải một trang. */
interface NavGroupItem {
  kind: 'group'
  label: string
  icon: ReactNode
  children: NavChild[]
}

export type NavItem = NavLinkItem | NavGroupItem

/** Nguồn duy nhất của menu sidebar — sửa ở đây là đổi cả sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { kind: 'link', to: ROUTES.dashboard, label: 'Tổng quan', icon: <IconHome />, end: true },
  { kind: 'link', to: ROUTES.staff, label: 'Quản lý giáo viên', icon: <IconTeacher /> },
  { kind: 'link', to: ROUTES.parents, label: 'Giám sát phụ huynh', icon: <IconParents /> },
  {
    kind: 'group',
    label: 'Lớp & Học sinh',
    icon: <IconStudents />,
    children: [
      { to: ROUTES.classes, label: 'Lớp học' },
      { to: ROUTES.students, label: 'Học sinh' },
    ],
  },
  { kind: 'link', to: ROUTES.reports, label: 'Báo cáo thống kê', icon: <IconReport /> },
  {
    kind: 'group',
    label: 'Đợt đo & Năm học',
    icon: <IconCalendar />,
    children: [
      { to: ROUTES.schoolYears, label: 'Năm học' },
      { to: ROUTES.measurementPeriods, label: 'Đợt đo' },
      { to: ROUTES.healthIndicators, label: 'Chỉ số sức khỏe' },
    ],
  },
]
