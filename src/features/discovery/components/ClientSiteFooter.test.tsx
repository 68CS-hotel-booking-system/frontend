import { beforeEach, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { ClientSiteFooter } from './ClientSiteFooter'

const user = vi.hoisted(() => ({ session: false, isOwner: false, isAdmin: false }))
vi.mock('@/features/auth', () => ({
  useSession: () => user.session ? { accessToken: 'test' } : null,
  useCurrentUser: () => ({ isOwner: user.isOwner, isAdmin: user.isAdmin }),
}))
beforeEach(() => { user.session = false; user.isOwner = false; user.isAdmin = false })

function renderFooter(path = '/') {
  return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><ClientSiteFooter /></MemoryRouter>)
}

it('links guests to available customer pages without advertising unfinished services', () => {
  const html = renderFooter()
  for (const path of ['/explore', '/my-bookings', '/my-complaints', '/account', '/login', '/register']) {
    expect(html).toContain(`href="${path}"`)
  }
  expect(html).not.toContain('Đăng ký khách sạn')
  expect(html).not.toContain('AirCover')
  expect(html).not.toContain('Quyền riêng tư')
  expect(html).not.toContain('<button')
  expect(html).not.toContain('/admin/overview')
})

it('gives owners a dashboard destination without offering account registration again', () => {
  user.session = true
  user.isOwner = true
  const html = renderFooter()
  expect(html).toContain('Khách sạn của tôi')
  expect(html).toContain('href="/admin/overview"')
  expect(html).not.toContain('href="/register"')
})

it('also removes unfinished policy actions from the compact hotel footer', () => {
  const html = renderFooter('/stays/hotel')
  expect(html).toContain('hotel-detail-site-footer')
  expect(html).toContain('href="/my-bookings"')
  expect(html).not.toContain('<button')
})
