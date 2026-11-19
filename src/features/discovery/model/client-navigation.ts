export const clientNavigation = [
  { to: '/', label: 'Chỗ ở' },
  { to: '/experiences', label: 'Trải nghiệm' },
  { to: '/services', label: 'Dịch vụ' },
] as const

export const accountSavedStaysPath = '/my-bookings?section=saved'

export function isStaySection(pathname: string) {
  return pathname === '/' || pathname === '/explore' || pathname.startsWith('/stays/')
}
