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
  expect(html).not.toContain('UUID chủ sở hữu')
  access.isAdmin = false
})
