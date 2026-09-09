/** Khớp với ClassService.getAll() ở backend (GET /class). */
export interface ClassItem {
  id: string
  name: string
  grade: number
  schoolYearId: string
  schoolYearName: string
  isCurrentYear: boolean
  studentCount: number
}

export interface ClassTeacher {
  id: string
  name: string
  email: string
  phone: string | null
}

export interface ClassDetail extends ClassItem {
  teachers: ClassTeacher[]
}


export interface ClassPayload {
  name: string
  grade: number
  schoolYearId: string
}

export interface ClassFormValues {
  name: string
  grade: string
  schoolYearId: string
}


export const GRADES = [1, 2, 3, 4, 5] as const
