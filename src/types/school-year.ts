export interface SchoolYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}


export interface SchoolYearPayload {
  name: string
  startDate: string
  enDate: string
  endDate: string
  isActive?: boolean
}

export interface SchoolYearFormValues {
  name: string
  startDate: string
  endDate: string
}
