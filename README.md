# EDU HEALTH — Frontend

Giao diện quản trị hệ thống theo dõi sức khoẻ học sinh, nối với API NestJS ở
[`student-health-backend`](../student-health-backend).

> **Trạng thái:** base UI — khung layout, design system và luồng dữ liệu đã xong;
> một số module còn chờ API (xem [Lộ trình](#lộ-trình)).

---

## Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ](#công-nghệ)
- [Yêu cầu](#yêu-cầu)
- [Cài đặt & chạy](#cài-đặt--chạy)
- [Biến môi trường](#biến-môi-trường)
- [Scripts](#scripts)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Định tuyến](#định-tuyến)
- [Giao diện & design system](#giao-diện--design-system)
- [Kết nối API](#kết-nối-api)
- [Xác thực](#xác-thực)
- [Thêm một module mới](#thêm-một-module-mới)
- [Build & deploy](#build--deploy)
- [Xử lý sự cố](#xử-lý-sự-cố)
- [Lộ trình](#lộ-trình)

---

## Tính năng

- **Khung quản trị**: sidebar 6 mục thu gọn được, topbar (thông báo, menu người dùng).
- **Nhân sự (giáo viên)**: danh sách + thẻ thống kê, tìm kiếm, phân trang, thêm/sửa qua modal,
  khoá/mở khoá tài khoản.
- **Lớp & Học sinh**: danh sách, tạo/sửa/xoá học sinh.
- **Đợt đo & Năm học**: danh sách hồ sơ sức khoẻ, thêm hồ sơ, tự tính BMI.
- **Tổng quan**: số liệu nhanh + hồ sơ sức khoẻ gần đây.
- **Nền tảng dùng chung**: axios interceptor tự gắn token và tự refresh khi 401, chuẩn hoá lỗi
  về một class `ApiError`, cache/invalidate bằng TanStack Query.

## Công nghệ

| Thành phần   | Lựa chọn                        |
| ------------ | ------------------------------- |
| Framework    | React 19 + TypeScript           |
| Build tool   | Vite 8                          |
| Routing      | React Router 7                  |
| Data fetching| TanStack Query 5                |
| HTTP client  | Axios                           |
| Lint         | oxlint                          |
| Styling      | CSS thuần + biến CSS (không dùng UI framework) |

## Yêu cầu

- Node.js **≥ 20.19** (hoặc ≥ 22.12) — yêu cầu của Vite 8. Đang phát triển trên Node 22.
- npm ≥ 10.
- Backend NestJS chạy ở `http://localhost:5000` (không bắt buộc nếu chỉ xem giao diện).

## Cài đặt & chạy

```bash
git clone https://github.com/nguyenkhacbao206/student_heathly_frontend.git
cd student_heathly_frontend

npm install
cp .env.example .env    # Windows: copy .env.example .env
npm run dev             # http://localhost:3000
```

Chạy backend song song (cửa sổ terminal khác):

```bash
cd ../student-health-backend
npm run start:dev       # http://localhost:5000
```

## Biến môi trường

Khai báo trong `.env` (mẫu ở `.env.example`). Chỉ [`src/config/env.ts`](src/config/env.ts) được
đọc `import.meta.env`; component và service lấy qua object `env`.

| Biến                    | Mặc định                | Mô tả                                                                 |
| ----------------------- | ----------------------- | --------------------------------------------------------------------- |
| `VITE_API_BASE_URL`     | `/api`                  | Base URL cho mọi request. Để `/api` thì đi qua dev proxy của Vite.     |
| `VITE_API_PROXY_TARGET` | `http://localhost:5000` | Địa chỉ backend thật mà dev server proxy tới.                         |
| `VITE_AUTH_DISABLED`    | `true`                  | `true` = bỏ qua đăng nhập, vào thẳng khu quản trị. Xem [Xác thực](#xác-thực). |

> Sửa `.env` xong phải **restart `npm run dev`** thì Vite mới nạp lại.

## Scripts

| Lệnh              | Việc                                              |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Dev server ở cổng 3000 + proxy `/api` sang backend |
| `npm run build`   | Typecheck (`tsc -b`) rồi build production vào `dist/` |
| `npm run preview` | Chạy thử bản build trong `dist/`                   |
| `npm run lint`    | oxlint toàn bộ `src/`                              |

## Cấu trúc thư mục

```
src/
├── config/env.ts          # nơi duy nhất đọc import.meta.env + MOCK_ADMIN
├── types/                 # kiểu dữ liệu khớp DTO của backend
│   ├── api.ts             #   ApiEnvelope + class ApiError
│   └── auth.ts  student.ts  health.ts  teacher.ts
├── lib/
│   ├── http.ts            # axios instance: gắn Bearer, auto-refresh 401, chuẩn hoá lỗi
│   ├── token-storage.ts   # đọc/ghi token + user trong localStorage
│   ├── unwrap.ts          # bóc `data` khi backend trả ApiResponse
│   ├── query-client.ts    # QueryClient + queryKeys tập trung
│   └── format.ts          # formatDate / formatNumber / calcBmi
├── services/              # 1 file 1 module backend, chỉ gọi API, không giữ state
│   └── auth.service.ts  student.service.ts  health.service.ts  teacher.service.ts
├── contexts/              # AuthProvider + auth-context (tách để Fast Refresh sạch)
├── hooks/                 # useAuth, useTeachers, useStudents, useHealthRecords,
│                          # usePagination, getErrorMessage
├── components/
│   ├── layout/            # AppLayout, Sidebar, Topbar, nav-items, PageHeader
│   └── ui/                # Button, Field, Card, Alert, States, Icon (SVG inline),
│                          # Badge, SearchInput, Pagination, TableFooter, Modal
├── pages/
│   ├── auth/              # LoginPage, RegisterPage
│   ├── staff/             # StaffPage (NHÂN SỰ), StaffFormModal
│   ├── students/          # StudentListPage, StudentFormPage (dùng chung tạo & sửa)
│   ├── health/            # HealthListPage, HealthFormPage, HealthStatusBadge
│   └── DashboardPage.tsx  PlaceholderPage.tsx  NotFoundPage.tsx
├── routes/                # AppRoutes, guards (RequireAuth), paths.ts
├── index.css              # toàn bộ style + biến màu
└── main.tsx  App.tsx
```

**Quy ước**

- Import dùng alias `@/` → `src/` (khai báo ở [`vite.config.ts`](vite.config.ts) và
  [`tsconfig.app.json`](tsconfig.app.json)).
- Luồng dữ liệu một chiều: `page` → `hook` → `service` → `lib/http`. Page không gọi axios trực
  tiếp, service không giữ state.
- Mọi đường dẫn route khai báo trong [`src/routes/paths.ts`](src/routes/paths.ts), không viết
  chuỗi `"/students/..."` rải rác.
- Mọi khoá cache khai báo trong `queryKeys` ([`src/lib/query-client.ts`](src/lib/query-client.ts)).

## Định tuyến

| Mục sidebar        | Route        | Trang                                  |
| ------------------ | ------------ | -------------------------------------- |
| Tổng quan          | `/`          | `DashboardPage`                        |
| Quản lý giáo viên  | `/staff`     | `StaffPage` — bảng NHÂN SỰ             |
| Giám sát phụ huynh | `/parents`   | `PlaceholderPage` (chưa có API)        |
| Lớp & Học sinh     | `/students`  | `StudentListPage` + form tạo/sửa       |
| Báo cáo thống kê   | `/reports`   | `PlaceholderPage` (chưa có API)        |
| Đợt đo & Năm học   | `/campaigns` | `HealthListPage` + form tạo            |

Route công khai: `/login`, `/register`. Mọi route còn lại nằm trong `RequireAuth` + `AppLayout`.
Menu sidebar khai báo một chỗ duy nhất ở
[`src/components/layout/nav-items.tsx`](src/components/layout/nav-items.tsx).

## Giao diện & design system

Toàn bộ style nằm trong một file [`src/index.css`](src/index.css): biến màu ở `:root`
(`--color-primary` đỏ EDU HEALTH `#c8102e`, `--color-navy` `#16325c`, nền `#f1f3f7`) và class
thuần kiểu BEM rút gọn. Không dùng Tailwind hay UI framework, không có thư viện icon — icon là
SVG inline trong [`src/components/ui/Icon.tsx`](src/components/ui/Icon.tsx).

Khung màn hình: `AppLayout` = `Sidebar` + `Topbar` + `<Outlet />`.

[`StaffPage`](src/pages/staff/StaffPage.tsx) là **trang mẫu** nên copy khi làm module mới:

```
PageHeader → stat cards → toolbar (SearchInput + nút thêm) → Card chứa bảng → TableFooter
```

Tìm kiếm và phân trang đang xử lý ở client qua [`usePagination`](src/hooks/usePagination.ts);
khi backend hỗ trợ `?page=&limit=` thì bỏ hook này, truyền tham số vào service và đọc meta từ
response.

## Kết nối API

| FE service                | Method & path            |
| ------------------------- | ------------------------ |
| `authService.login`       | `POST /v1/auth/login`    |
| `authService.register`    | `POST /v1/auth/register` |
| `authService.refresh`     | `POST /v1/auth/refresh`  |
| `authService.listUsers`   | `GET /v1/auth/user`      |
| `teacherService.list`     | `GET /teacher`           |
| `teacherService.getById`  | `GET /teacher/:id`       |
| `teacherService.create`   | `POST /teacher`          |
| `teacherService.update`   | `PUT /teacher/:id`       |
| `teacherService.remove`   | `DELETE /teacher/:id`    |
| `studentService.list`     | `GET /student`           |
| `studentService.getById`  | `GET /student/:id`       |
| `studentService.create`   | `POST /student`          |
| `studentService.update`   | `PUT /student/:id`       |
| `studentService.remove`   | `DELETE /student/:id`    |
| `healthService.list`      | `GET /health`            |
| `healthService.create`    | `POST /health`           |

Backend trả về hai dạng — bọc `ApiResponse` (`{ status, code, data, ... }`) hoặc object Prisma
thô — nên [`lib/unwrap.ts`](src/lib/unwrap.ts) tự nhận diện và bóc `data`.

> ⚠️ **Cần sửa ở backend:** `teacher.controller.ts` khai báo hai handler cùng `@Put(':id')`
> (`updateTeacher` và `updateTeacherStatus`) nên handler thứ hai không bao giờ chạy → nút
> **Khoá / Mở khoá** ở trang NHÂN SỰ chưa đổi được trạng thái. Đổi route status thành
> `@Put(':id/status')` rồi sửa `teacherService.updateStatus` cho khớp.

## Xác thực

**Luồng đầy đủ** (khi `VITE_AUTH_DISABLED=false`):

1. `login` lưu `accessToken`, `refreshToken` và thông tin user vào localStorage.
2. Request interceptor gắn `Authorization: Bearer <accessToken>` (trừ các route auth công khai).
3. Gặp 401 → gọi `POST /v1/auth/refresh` **một lần duy nhất** dù có bao nhiêu request đang chờ
   (gộp qua `refreshPromise`), rồi retry request gốc.
4. Refresh cũng hỏng → xoá session, `AuthProvider` clear state, `RequireAuth` đẩy về `/login`
   và nhớ trang đang định vào để quay lại sau khi đăng nhập.

**Chế độ bỏ qua đăng nhập** (mặc định hiện tại, `VITE_AUTH_DISABLED=true`): mở link là vào thẳng
khu quản trị với tài khoản giả lập `MOCK_ADMIN` ([`src/config/env.ts`](src/config/env.ts)),
`/login` tự chuyển về `/`, lỗi 401 không đá ngược ra trang đăng nhập, nút "Đăng xuất" bị ẩn.
Code auth vẫn còn nguyên — đổi cờ thành `false` rồi restart dev server là chạy lại như cũ.

> **Nhớ đặt `VITE_AUTH_DISABLED=false` trước khi build production.**

## Thêm một module mới

1. Khai báo kiểu trong `src/types/<module>.ts`.
2. Viết `src/services/<module>.service.ts`, chỉ dùng `api.get/post/put/delete`.
3. Thêm khoá cache vào `queryKeys` trong `src/lib/query-client.ts`.
4. Viết hook `src/hooks/use<Module>.ts` (query + mutation, mutation nhớ `invalidateQueries`).
5. Tạo page trong `src/pages/<module>/` — copy bố cục của `StaffPage`.
6. Khai báo path trong `src/routes/paths.ts`, gắn route trong `src/routes/index.tsx`, thêm mục
   vào `src/components/layout/nav-items.tsx` nếu cần hiện trên sidebar.

## Build & deploy

```bash
npm run build     # tsc -b && vite build  ->  dist/
npm run preview   # xem thử bản build
```

`dist/` là static site, deploy được lên bất kỳ static host nào (Nginx, Vercel, Netlify...).
Vì dùng React Router ở chế độ history, **server phải fallback mọi đường dẫn về `index.html`**.

Khi FE và BE khác domain, dev proxy không còn tác dụng:

1. Bật CORS ở backend:
   ```ts
   // src/main.ts
   app.enableCors({ origin: 'https://fe.example.com', credentials: true })
   ```
2. Đặt `VITE_API_BASE_URL` thành URL đầy đủ của backend (ví dụ `https://api.example.com`).

## Xử lý sự cố

| Hiện tượng                                   | Nguyên nhân & cách xử lý                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Lỗi CORS khi gọi API                          | Backend chưa bật CORS. Ở môi trường dev hãy để `VITE_API_BASE_URL=/api` để đi qua proxy.  |
| Gọi API trả 404 / HTML                        | `VITE_API_PROXY_TARGET` sai cổng, hoặc backend chưa chạy.                                 |
| Đổi `.env` mà không có tác dụng                | Vite chỉ đọc `.env` lúc khởi động — restart `npm run dev`.                                |
| Bị đẩy về `/login` liên tục                   | Refresh token hết hạn. Xoá localStorage rồi đăng nhập lại, hoặc bật `VITE_AUTH_DISABLED`. |
| Nút Khoá/Mở khoá không đổi trạng thái          | Bug route trùng `@Put(':id')` ở backend — xem [Kết nối API](#kết-nối-api).                |
| `npm run dev` báo cổng 3000 bận               | Đổi `server.port` trong [`vite.config.ts`](vite.config.ts).                               |

## Lộ trình

- [ ] Nối API cho **Giám sát phụ huynh** và **Báo cáo thống kê** (đang là `PlaceholderPage`).
- [ ] Thêm cột `role` cho giáo viên ở backend — cột "Vai trò" đang mặc định hiển thị `User`.
- [ ] Chuyển tìm kiếm/phân trang sang server khi API hỗ trợ `?page=&limit=&q=`.
- [ ] Quản lý năm học & đợt đo — backend đã có `SchoolYearModule` nhưng **chưa đăng ký trong
      `app.module.ts`**, cần bật lên rồi FE mới nối được.
- [ ] Tắt `VITE_AUTH_DISABLED` và hoàn thiện phân quyền theo vai trò.
