# Student Health — Frontend

Base frontend cho API NestJS ở `student-health-backend`.
Stack: **React 19 + TypeScript + Vite + React Router 7 + TanStack Query + Axios**.

## Chạy dự án

```bash
npm install
cp .env.example .env   # sửa VITE_API_PROXY_TARGET nếu backend không chạy ở :5000
npm run dev            # http://localhost:3000
```

Backend chạy song song:

```bash
cd ../student-health-backend && npm run start:dev   # http://localhost:5000
```

| Lệnh              | Việc                                      |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Dev server + proxy `/api` sang backend     |
| `npm run build`   | Typecheck (`tsc -b`) rồi build production  |
| `npm run preview` | Xem thử bản build                          |
| `npm run lint`    | oxlint                                     |

## Tắt đăng nhập khi dựng giao diện

`.env` đang đặt `VITE_AUTH_DISABLED=true`: mở link là vào thẳng khu quản trị với tài khoản
giả lập (`MOCK_ADMIN` trong [src/config/env.ts](src/config/env.ts)), `/login` tự chuyển về `/`,
và lỗi 401 cũng không đá ngược ra trang đăng nhập.

Toàn bộ code auth (AuthProvider, guards, interceptor refresh token) vẫn giữ nguyên — đổi cờ
thành `VITE_AUTH_DISABLED=false` rồi restart `npm run dev` là luồng đăng nhập chạy lại như cũ.
**Nhớ tắt cờ này trước khi build production.**

## CORS

Backend (`src/main.ts`) **chưa bật CORS**. Để không phải sửa backend, Vite dev server proxy
`/api/*` → `http://localhost:5000/*` (cấu hình ở [vite.config.ts](vite.config.ts)), nên mọi
request đều cùng origin.

Khi deploy production mà FE/BE khác domain thì phải bật CORS ở backend:

```ts
// src/main.ts
app.enableCors({ origin: 'http://localhost:3000', credentials: true })
```

rồi đổi `VITE_API_BASE_URL` thành URL đầy đủ của backend.

## Cấu trúc

```
src/
├── config/env.ts          # nơi duy nhất đọc import.meta.env
├── types/                 # kiểu dữ liệu khớp DTO của backend
│   ├── api.ts             #   ApiEnvelope + class ApiError
│   ├── auth.ts  student.ts  health.ts  teacher.ts
├── lib/
│   ├── http.ts            # axios instance: gắn Bearer, auto-refresh 401, chuẩn hoá lỗi
│   ├── token-storage.ts   # đọc/ghi token + user trong localStorage
│   ├── unwrap.ts          # bóc `data` khi backend trả ApiResponse
│   ├── query-client.ts    # QueryClient + queryKeys tập trung
│   └── format.ts          # formatDate / formatNumber / calcBmi
├── services/              # 1 file 1 module backend, chỉ gọi API, không chứa state
│   ├── auth.service.ts  student.service.ts  health.service.ts  teacher.service.ts
├── contexts/              # AuthProvider + auth-context (tách để Fast Refresh sạch)
├── hooks/                 # useAuth, useTeachers, useStudents, useHealthRecords,
│                          # usePagination, getErrorMessage
├── components/
│   ├── layout/            # AppLayout (shell), Sidebar, Topbar, nav-items, PageHeader
│   └── ui/                # Button, Field, Card, Alert, States, Icon (SVG inline),
│                          # Badge, SearchInput, Pagination, TableFooter, Modal
├── pages/
│   ├── auth/              # LoginPage, RegisterPage
│   ├── staff/             # StaffPage (NHÂN SỰ), StaffFormModal
│   ├── students/          # StudentListPage, StudentFormPage (dùng chung cho tạo & sửa)
│   ├── health/            # HealthListPage, HealthFormPage, HealthStatusBadge
│   ├── DashboardPage.tsx  PlaceholderPage.tsx  NotFoundPage.tsx
└── routes/                # AppRoutes, guards (RequireAuth), paths.ts
```

Import dùng alias `@/` → `src/` (khai báo ở `vite.config.ts` + `tsconfig.app.json`).

## Giao diện

Toàn bộ style nằm trong một file [src/index.css](src/index.css): biến màu (`--color-primary`
đỏ EDU HEALTH `#c8102e`, `--color-navy`, nền `#f1f3f7`) + class thuần kiểu BEM rút gọn.
Không dùng Tailwind/UI framework, không có thư viện icon — icon là SVG inline trong
[src/components/ui/Icon.tsx](src/components/ui/Icon.tsx).

Khung màn hình: `AppLayout` = `Sidebar` (6 mục, thu gọn được) + `Topbar` (hamburger, chuông,
menu người dùng) + `<Outlet />`. Menu sidebar khai báo một chỗ duy nhất ở
[src/components/layout/nav-items.tsx](src/components/layout/nav-items.tsx).

| Sidebar              | Route        | Trang                                    |
| -------------------- | ------------ | ---------------------------------------- |
| Tổng quan            | `/`          | `DashboardPage`                          |
| Quản lý giáo viên    | `/staff`     | `StaffPage` — bảng NHÂN SỰ (mẫu chuẩn)   |
| Giám sát phụ huynh   | `/parents`   | `PlaceholderPage` (chưa có API)          |
| Lớp & Học sinh       | `/students`  | `StudentListPage` + form tạo/sửa         |
| Báo cáo thống kê     | `/reports`   | `PlaceholderPage` (chưa có API)          |
| Đợt đo & Năm học     | `/campaigns` | `HealthListPage` + form tạo              |

`StaffPage` là trang mẫu để copy khi làm module mới: stat cards → toolbar (search + nút thêm)
→ card chứa bảng → `TableFooter` (dòng "Hiển thị x - y" + phân trang). Phân trang/tìm kiếm
đang làm ở client qua `usePagination`; khi backend hỗ trợ `?page=&limit=` thì bỏ hook đó và
đọc meta từ response.

## Endpoint đã nối

| FE service                | Method & path              |
| ------------------------- | -------------------------- |
| `authService.login`       | `POST /v1/auth/login`      |
| `authService.register`    | `POST /v1/auth/register`   |
| `authService.refresh`     | `POST /v1/auth/refresh`    |
| `authService.listUsers`   | `GET /v1/auth/user`        |
| `studentService.list`     | `GET /student`             |
| `studentService.getById`  | `GET /student/:id`         |
| `studentService.create`   | `POST /student`            |
| `studentService.update`   | `PUT /student/:id`         |
| `studentService.remove`   | `DELETE /student/:id`      |
| `healthService.list`      | `GET /health`              |
| `healthService.create`    | `POST /health`             |
| `teacherService.list`     | `GET /teacher`             |
| `teacherService.getById`  | `GET /teacher/:id`         |
| `teacherService.create`   | `POST /teacher`            |
| `teacherService.update`   | `PUT /teacher/:id`         |
| `teacherService.remove`   | `DELETE /teacher/:id`      |

> **Cần sửa backend:** `teacher.controller.ts` khai báo hai handler cùng `@Put(':id')`
> (`updateTeacher` và `updateTeacherStatus`) nên handler thứ hai không bao giờ chạy — nút
> Khoá/Mở khoá ở trang NHÂN SỰ sẽ không đổi được trạng thái cho tới khi đổi route status
> thành `@Put(':id/status')` (rồi sửa `teacherService.updateStatus` cho khớp).

## Auth flow

1. `login` lưu `accessToken` + `refreshToken` + thông tin user vào localStorage.
2. Request interceptor gắn `Authorization: Bearer <accessToken>` (trừ các route auth công khai).
3. Gặp 401 → gọi `POST /v1/auth/refresh` **một lần duy nhất** dù có bao nhiêu request đang chờ
   (gộp qua `refreshPromise`), rồi retry request gốc.
4. Refresh cũng hỏng → xoá session, `AuthProvider` clear state, `RequireAuth` đẩy về `/login`
   và nhớ trang đang định vào để quay lại.

## Thêm một module mới

1. Khai báo kiểu trong `src/types/<module>.ts`.
2. Viết `src/services/<module>.service.ts` dùng `api.get/post/put/delete`.
3. Thêm khoá cache vào `queryKeys` (`src/lib/query-client.ts`).
4. Viết hook trong `src/hooks/use<Module>.ts`.
5. Thêm page vào `src/pages/<module>/`, khai báo path trong `src/routes/paths.ts`
   và gắn route trong `src/routes/index.tsx`.
#   s t u d e n t _ h e a t h l y _ f r o n t e n d  
 