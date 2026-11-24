import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, it, vi } from 'vitest'
import { ApiHotelContractsSection } from './ApiHotelContractsSection'

const access = vi.hoisted(() => ({ isAdmin: false }))
vi.mock('@/features/auth', () => ({ useCurrentUser: () => access }))

it('shows owners the contract list without an unavailable admin form or user UUID', () => {
  access.isAdmin = false
  const html = renderToStaticMarkup(createElement(QueryClientProvider, { client: new QueryClient() },
    createElement(ApiHotelContractsSection, { hotelId: '11111111-1111-4111-8111-111111111111', ownerUserId: '22222222-2222-4222-8222-222222222222' })))
  expect(html).not.toContain('detail-grid-layout')
  expect(html).toContain('do quản trị viên thực hiện')
  expect(html).not.toContain('<form')
  expect(html).not.toContain('22222222-2222-4222-8222-222222222222')
  expect(html).not.toContain('Đơn vị tiền tệ')
  expect(html).not.toContain('Tóm tắt điều khoản')
})

it('keeps the creation form available to admins with the hotel owner fixed', () => {
  access.isAdmin = true
  const html = renderToStaticMarkup(createElement(QueryClientProvider, { client: new QueryClient() },
    createElement(ApiHotelContractsSection, { hotelId: '11111111-1111-4111-8111-111111111111', ownerUserId: '22222222-2222-4222-8222-222222222222' })))
  expect(html).toContain('detail-grid-layout')
  expect(html).toContain('Tạo dự thảo hợp đồng')
  expect(html).toContain('Chủ sở hữu hiện tại của khách sạn')
  expect(html).toContain('Mã hợp đồng được tạo tự động sau khi lưu.')
  expect(html).not.toContain('name="contractCode"')
  expect(html).not.toContain('UUID chủ sở hữu')
  access.isAdmin = false
})

it('renders clickable owner name button without exposing raw UUID and includes all status filter tabs', () => {
  access.isAdmin = true
  const html = renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client: new QueryClient() },
      createElement(ApiHotelContractsSection, {
        hotelId: '11111111-1111-4111-8111-111111111111',
        ownerUserId: '22222222-2222-4222-8222-222222222222',
        owner: { fullName: 'Nguyễn Văn Chủ', email: 'owner@stayhub.vn' },
        onViewOwner: () => {},
      }),
    ),
  )

  expect(html).toContain('Nguyễn Văn Chủ')
  expect(html).toContain('owner@stayhub.vn')
  expect(html).toContain('Xem thông tin')
  expect(html).not.toContain('UUID chủ sở hữu')

  for (const label of ['Tất cả', 'Đang hiệu lực', 'Dự thảo', 'Hết hiệu lực', 'Đã chấm dứt']) {
    expect(html).toContain(label)
  }
  access.isAdmin = false
})
