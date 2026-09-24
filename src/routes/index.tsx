import { Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ClassPage } from '@/pages/classes/ClassPage'
import { HealthFormPage } from '@/pages/health/HealthFormPage'
import { HealthListPage } from '@/pages/health/HealthListPage'
import { HealthIndicatorPage } from '@/pages/health-indicators/HealthIndicatorPage'
import { MeasurementPeriodPage } from '@/pages/measurement/MeasurementPeriodPage'
import { ParentPage } from '@/pages/parents/ParentPage'
import { SchoolYearPage } from '@/pages/school-year/SchoolYearPage'
import { SchoolYearCreatePage } from '@/pages/school-year/SchoolYearCreatePage'
import { SchoolYearDetailPage } from '@/pages/school-year/SchoolYearDetailPage'
import { StaffPage } from '@/pages/staff/StaffPage'
import { StudentFormPage } from '@/pages/students/StudentFormPage'
import { StudentListPage } from '@/pages/students/StudentListPage'
import { RedirectIfAuthenticated, RequireAuth } from '@/routes/guards'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<RedirectIfAuthenticated />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Private */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          {/* Quản lý giáo viên */}
          <Route path="staff" element={<StaffPage />} />

          {/* Giám sát phụ huynh */}
          <Route path="parents" element={<ParentPage />} />

          {/* Lớp học */}
          <Route path="classes" element={<ClassPage />} />

          {/* Học sinh */}
          <Route path="students">
            <Route index element={<StudentListPage />} />
            <Route path="new" element={<StudentFormPage />} />
            <Route path=":id/edit" element={<StudentFormPage />} />
          </Route>

          {/* Báo cáo thống kê — chưa có API, để chỗ sẵn */}
          <Route
            path="reports"
            element={
              <PlaceholderPage
                title="Báo cáo thống kê"
                description="Biểu đồ BMI, tỉ lệ suy dinh dưỡng, thừa cân theo lớp và theo đợt đo."
              />
            }
          />

          {/* Năm học */}
          <Route path="school-years">
            <Route index element={<SchoolYearPage />} />
            <Route path="new" element={<SchoolYearCreatePage />} />
            <Route path=":id" element={<SchoolYearDetailPage />} />
          </Route>

          {/* Đợt đo */}
          <Route path="measurement-periods" element={<MeasurementPeriodPage />} />

          {/* Chỉ số sức khỏe */}
          <Route path="health-indicators" element={<HealthIndicatorPage />} />

          {/* Hồ sơ sức khoẻ (giữ nguyên để không break existing) */}
          <Route path="campaigns">
            <Route index element={<HealthListPage />} />
            <Route path="new" element={<HealthFormPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
