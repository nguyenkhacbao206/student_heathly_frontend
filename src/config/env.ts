/**
 * Nơi duy nhất đọc biến môi trường. Component/service không đọc import.meta.env trực tiếp.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  isDev: import.meta.env.DEV,
  /**
   * true = bỏ qua đăng nhập, vào thẳng khu quản trị với tài khoản giả lập.
   * Chỉ dùng khi dựng giao diện; đặt lại `false` trước khi lên production.
   */
  authDisabled: import.meta.env.VITE_AUTH_DISABLED === 'true',
} as const

/** Người dùng giả lập khi `authDisabled` — chỉ tồn tại ở FE, không gọi API nào. */
export const MOCK_ADMIN = {
  name: 'Mường Kho',
  email: 'admin@eduhealth.local',
} as const

export const STORAGE_KEYS = {
  accessToken: 'shm.accessToken',
  refreshToken: 'shm.refreshToken',
  user: 'shm.user',
} as const
