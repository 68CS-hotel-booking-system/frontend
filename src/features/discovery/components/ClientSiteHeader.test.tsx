import type { ReactNode } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { ClientSiteHeader } from './ClientSiteHeader'

const state = vi.hoisted(() => ({
  session: null as null | { accessToken: string },
  user: null as null | { id: string; fullName: string; email: string },
  isOwner: false,
  isAdmin: false,
  navigate: vi.fn(),
  items: [] as { key: string; label?: ReactNode; onClick?: () => void }[],
}))

vi.mock('react-router', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router')>(),
  useNavigate: () => state.navigate,
}))
vi.mock('@/features/auth', () => ({
  useSession: () => state.session,
  useCurrentUser: () => ({ currentUser: state.user, isOwner: state.isOwner, isAdmin: state.isAdmin }),
  UserAvatar: () => <span>Ảnh đại diện</span>,
  useAuthAction: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))
vi.mock('antd', () => ({
  App: { useApp: () => ({ message: { info: vi.fn(), error: vi.fn() } }) },
  Dropdown: ({ menu, children }: { menu: { items: typeof state.items }; children: ReactNode }) => {
    state.items = menu.items
    return <>{children}{state.items.map(item => item.key && <div key={item.key}>{item.label}</div>)}</>
  },
}))

beforeEach(() => {
  state.session = null
  state.user = null
  state.isOwner = false
  state.isAdmin = false
  state.items = []
  state.navigate.mockReset()
})

it('renders an explicit sign-in button in place of the account menu for visitors', () => {
  const html = renderHeader()
  expect(html).toContain('aria-label="Đăng nhập"')
  expect(html).toContain('aria-haspopup="dialog"')
  expect(state.items).toEqual([])
})

function renderHeader(path = '/') {
  return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><ClientSiteHeader savedCount={0}
    onOpenMobileMenu={vi.fn()} /></MemoryRouter>)
}

it('places the owner dashboard entry directly below the account entry', () => {
  state.session = { accessToken: 'test' }
  state.isOwner = true
  const html = renderHeader('/account')
  expect(html).not.toContain('Đăng ký khách sạn')
  expect(state.items.slice(0, 2).map(item => item.label)).toEqual(['Tài khoản của tôi', 'Khách sạn của tôi'])
  state.items[1].onClick?.()
  expect(state.navigate).toHaveBeenCalledWith('/admin/overview')
})

it('shows the signed-in guest identity in the avatar menu and opens their profile', () => {
  state.session = { accessToken: 'test' }
  state.user = { id: 'user-1', fullName: 'Khách StayHub', email: 'guest@example.test' }
  const html = renderHeader('/account')
  expect(html).toContain('Menu tài khoản Khách StayHub')
  expect(html).toContain('guest@example.test')
  expect(html).toContain('Xem thông tin cá nhân')
  state.items[0].onClick?.()
  expect(state.navigate).toHaveBeenCalledWith('/account')
})

it.each(['guest', 'customer', 'admin'])('hides the owner entry and registration link for %s', (role) => {
  state.session = role === 'guest' ? null : { accessToken: 'test' }
  state.isAdmin = role === 'admin'
  expect(renderHeader('/account')).not.toContain('Đăng ký khách sạn')
  expect(state.items.some(item => item.key === 'my-hotels')).toBe(false)
  expect(state.items.some(item => item.key === 'admin')).toBe(role === 'admin')
})

it.each(['/', '/experiences', '/my-bookings', '/account?section=security'])('links the signed-in avatar directly to the profile from %s', (path) => {
  state.session = { accessToken: 'test' }
  state.user = { id: 'user-1', fullName: 'Khách StayHub', email: 'guest@example.test' }
  const html = renderHeader(path)
  expect(html).toContain('href="/account"')
  expect(html).toContain('aria-label="Xem thông tin cá nhân của Khách StayHub"')
  expect(state.items).toEqual([])
})

it('links experiences, services and saved stays to their own routes', () => {
  const html = renderHeader()
  expect(html).toContain('Trải nghiệm')
  expect(html).toContain('Dịch vụ')
  expect(html).toContain('href="/experiences"')
  expect(html).toContain('href="/services"')
  expect(html).toContain('href="/saved-stays"')
})

it('routes signed-in saved stays to account area and admin entry to /admin/overview', () => {
  state.session = { accessToken: 'test' }
  state.isAdmin = true
  const html = renderHeader('/account')
  expect(html).toContain('href="/account/saved-stays"')
  const adminItem = state.items.find(item => item.key === 'admin')
  expect(adminItem).toBeDefined()
  adminItem?.onClick?.()
  expect(state.navigate).toHaveBeenCalledWith('/admin/overview')
})
