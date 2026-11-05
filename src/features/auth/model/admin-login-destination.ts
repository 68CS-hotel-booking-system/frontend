import { sanitizeReturnTo } from './sanitize-return-to'

/** Only admin destinations can follow an admin login; never return to the login itself. */
export function adminLoginDestination(value: unknown): string {
  const destination = sanitizeReturnTo(value)
  if (destination) {
    try {
      const pathname = decodeURIComponent(new URL(destination, 'https://stayhub.internal').pathname)
      if (/^\/admin\/.+/i.test(pathname) && !/^\/admin\/login(?:\/|$)/i.test(pathname)) {
        return destination
      }
    } catch {
      // Đường dẫn lỗi hoặc chưa xác định sẽ về trang Tổng quan.
    }
  }
  return '/admin/overview'
}
