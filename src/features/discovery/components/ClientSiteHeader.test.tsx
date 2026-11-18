import type { ReactNode } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { ClientSiteHeader } from './ClientSiteHeader'

const state = vi.hoisted(() => ({
  session: null as null | { accessToken: string },
  isOwner: false,
  isAdmin: false,
  navigate: vi.fn(),
  items: [] as { key: string; label?: string; onClick?: () => void }[],
}))

vi.mock('react-router', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router')>(),
  useNavigate: () => state.navigate,
}))
vi.mock('@/features/auth', () => ({
  useSession: () => state.session,
  useCurrentUser: () => ({ currentUser: null, isOwner: state.isOwner, isAdmin: state.isAdmin }),
  useAuthAction: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))
vi.mock('antd', () => ({
  App: { useApp: () => ({ message: { info: vi.fn(), error: vi.fn() } }) },
  Dropdown: ({ menu, children }: { menu: { items: typeof state.items }; children: ReactNode }) => {
    state.items = menu.items
    return children
  },
}))

beforeEach(() => {
  state.session = null
  state.isOwner = false
  state.isAdmin = false
  state.navigate.mockReset()
})

function renderHeader() {
  return renderToStaticMarkup(<MemoryRouter><ClientSiteHeader savedCount={0} isSavedActive={false}
    pulseSaved={false} onToggleSaved={vi.fn()} onOpenMobileMenu={vi.fn()} /></MemoryRouter>)
}

it('places the owner dashboard entry directly below the account entry', () => {
  state.session = { accessToken: 'test' }
  state.isOwner = true
  const html = renderHeader()
  expect(html).not.toContain('Đăng ký khách sạn')
  expect(state.items.slice(0, 2).map(item => item.label)).toEqual(['Tài khoản của tôi', 'Khách sạn của tôi'])
  state.items[1].onClick?.()
  expect(state.navigate).toHaveBeenCalledWith('/admin/overview')
})

it.each(['guest', 'customer', 'admin'])('hides the owner entry and registration link for %s', (role) => {
  state.session = role === 'guest' ? null : { accessToken: 'test' }
  state.isAdmin = role === 'admin'
  expect(renderHeader()).not.toContain('Đăng ký khách sạn')
  expect(state.items.some(item => item.key === 'my-hotels')).toBe(false)
  expect(state.items.some(item => item.key === 'admin')).toBe(role === 'admin')
})

it('shows the requested experiences and services navigation alongside stays', () => {
  const html = renderHeader()
  expect(html).toContain('Trải nghiệm')
  expect(html).toContain('Dịch vụ')
  expect(html).toContain('id="client-account-menu-trigger"')
})
