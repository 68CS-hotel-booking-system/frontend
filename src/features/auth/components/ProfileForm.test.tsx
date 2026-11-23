import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { ProfileForm } from './ProfileForm'

function renderProfile(phone: string) {
  const user = {
    id: '11111111-1111-4111-8111-111111111111', email: 'qa@example.invalid',
    fullName: 'Khách kiểm thử', phone, status: 'active',
    emailVerified: true, version: 2, roles: ['CUSTOMER'],
  }
  return renderToStaticMarkup(<QueryClientProvider client={new QueryClient()}><ProfileForm user={user} /></QueryClientProvider>)
}

it('shows supported profile fields and removes unavailable sections', () => {
  const html = renderProfile('0900000000')
  expect(html).toContain('Khách kiểm thử')
  expect(html).toContain('qa@example.invalid')
  expect(html).toContain('Đã xác minh')
  for (const removed of ['Tên hiển thị', 'Ngày sinh', 'Giới tính', 'Địa chỉ', 'Tùy chọn', 'Xác minh danh tính', 'Chưa hỗ trợ']) {
    expect(html).not.toContain(removed)
  }
  expect(html).toContain('Đổi ảnh')
  expect(html).toContain('accept="image/jpeg,image/png,image/webp"')
  expect(html).not.toContain('id="profile-address"')
  expect(html.match(/<input[^>]*id="profile-phone"[^>]*>/)?.[0]).not.toContain('disabled')
  expect(html.match(/<input[^>]*id="profile-phone"[^>]*>/)?.[0]).toContain('value="0900000000"')
  expect(html.match(/<button[^>]*type="submit"[^>]*>/)?.[0]).toContain('disabled')
})

it.each([['+84900000000', '+84', '900000000'], ['+442079460000', '', '+442079460000']])(
  'displays the phone %s without silently changing the stored number',
  (phone, code, visibleNumber) => {
    const html = renderProfile(phone)
    expect(html).toContain(`value="${code}" selected=""`)
    expect(html.match(/<input[^>]*id="profile-phone"[^>]*>/)?.[0]).toContain(`value="${visibleNumber}"`)
    expect(html.match(/<button[^>]*type="submit"[^>]*>/)?.[0]).toContain('disabled')
  },
)
