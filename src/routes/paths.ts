export const ROUTES = {
  login: '/login',
  register: '/register',


  dashboard: '/',
  staff: '/staff',
  parents: '/parents',
  classes: '/classes',
  students: '/students',
  reports: '/reports',
  campaigns: '/campaigns',
  schoolYears: '/school-years',
  measurementPeriods: '/measurement-periods',


  studentCreate: '/students/new',
  studentEdit: (id: string) => `/students/${id}/edit`,


  health: '/campaigns',
  healthCreate: '/campaigns/new',
} as const
