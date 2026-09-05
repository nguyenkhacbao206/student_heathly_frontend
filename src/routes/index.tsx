import { Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { HealthFormPage } from '@/pages/health/HealthFormPage'
import { HealthListPage } from '@/pages/health/HealthListPage'
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

          {/* Giám sát phụ huynh — chưa có API, để chỗ sẵn */}
          <Route
            path="parents"
            element={
              <PlaceholderPage
                title="Giám sát phụ huynh"
                description="Theo dõi tài khoản phụ huynh và quyền xem hồ sơ sức khoẻ của con."
              />
            }
          />

          {/* Lớp & Học sinh */}
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

          {/* Đợt đo & Năm học */}
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
