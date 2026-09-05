import type { SVGProps } from 'react'

/**
 * Bộ icon inline (stroke 1.7, viewBox 24) — không kéo thêm thư viện icon nào.
 * Thêm icon mới: copy một <Base> rồi đổi phần <path>.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 18, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function IconHome(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </Base>
  )
}

export function IconTeacher(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16v4" />
    </Base>
  )
}

export function IconParents(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M17 14c2.3 0 4 1.6 4 4" />
    </Base>
  )
}

export function IconStudents(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="6" r="3" />
      <path d="M5 21c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
    </Base>
  )
}

export function IconReport(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 12v5M12 9v8M16 14v3" />
    </Base>
  )
}

export function IconCalendar(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Base>
  )
}

export function IconMenu(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Base>
  )
}

export function IconBell(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M18 15V10a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 15Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </Base>
  )
}

export function IconUser(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 19a6 6 0 0 1 11 0" />
    </Base>
  )
}

export function IconChevronDown(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  )
}

export function IconChevronLeft(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m14 6-6 6 6 6" />
    </Base>
  )
}

export function IconChevronRight(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m10 6 6 6-6 6" />
    </Base>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Base>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  )
}

export function IconClose(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  )
}

/** Logo khiên EDU HEALTH — dùng ở sidebar và trang đăng nhập. */
export function IconShield({ size = 30, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" {...rest}>
      <path
        d="M16 2.5 27 6.5v9.2C27 22.5 22.4 27.6 16 29.5 9.6 27.6 5 22.5 5 15.7V6.5L16 2.5Z"
        fill="currentColor"
      />
      <path
        d="M16 6 23.5 8.7v7c0 5-3.2 8.8-7.5 10.3-4.3-1.5-7.5-5.3-7.5-10.3v-7L16 6Z"
        fill="#fff"
        fillOpacity="0.15"
        stroke="#fff"
        strokeWidth="1.2"
      />
      <path d="M16 11v9M11.5 15.5h9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
