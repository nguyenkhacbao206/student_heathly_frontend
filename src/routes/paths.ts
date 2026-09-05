export const ROUTES = {
  login: '/login',
  register: '/register',

  /** 6 mục của sidebar */
  dashboard: '/',
  staff: '/staff',
  parents: '/parents',
  students: '/students',
  reports: '/reports',
  campaigns: '/campaigns',

  /** Con của "Lớp & Học sinh" */
  studentCreate: '/students/new',
  studentEdit: (id: string) => `/students/${id}/edit`,

  /** Con của "Đợt đo & Năm học" — hồ sơ sức khoẻ của một đợt đo */
  health: '/campaigns',
  healthCreate: '/campaigns/new',
} as const
