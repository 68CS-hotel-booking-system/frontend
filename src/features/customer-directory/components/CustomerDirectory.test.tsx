import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { CustomerDirectory } from './CustomerDirectory'
import { customerDirectoryKey } from '../hooks/use-customer-directory'
import type { CustomerRow } from '../api/customer-directory-api'

const access = vi.hoisted(() => ({ isAdmin: false, id: '11111111-1111-4111-8111-111111111111' }))
vi.mock('@/features/auth', () => ({ useCurrentUser: () => ({ currentUser: { id: access.id }, isAdmin: access.isAdmin }) }))
afterEach(() => { access.isAdmin = false })
const contact = { id: '22222222-2222-4222-8222-222222222222', fullName: 'Tên từ API', email: 'contact@example.test', phone: '0900000000', hotelCount: 2 }

function render(rows: CustomerRow[]) {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  client.setQueryData(customerDirectoryKey(access.id, access.isAdmin ? 'partners' : 'hotel-guests', { page: 0, size: 10, keyword: '' }), {
    content: rows, page: 0, size: 10, totalElements: rows.length, totalPages: rows.length ? 1 : 0, first: true, last: true,
  })
  return renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter><CustomerDirectory /></MemoryRouter></QueryClientProvider>)
}

it('shows owner booking contacts and scoped booking counts rather than contract partners', () => {
  const html = render([{ ...contact, bookingCount: 5, completedBookingCount: 3, lastBookedAt: '2026-11-24T00:00:00Z' }])
  expect(html).toContain('Người đặt phòng')
  expect(html).toContain('Tên từ API')
  expect(html).toContain('contact@example.test')
  expect(html).toContain('Tổng đơn đặt')
  expect(html).not.toContain('Hợp đồng đã kích hoạt')
})

it('shows signed owners and contract counts to admin while retaining expired partners', () => {
  access.isAdmin = true
  const html = render([{ ...contact, contractCount: 3, activeContractCount: 0, lastContractCreatedAt: '2025-01-01T00:00:00Z' }])
  expect(html).toContain('Owner đã ký hợp đồng')
  expect(html).toContain('Tên từ API')
  expect(html).toContain('Hợp đồng đã kích hoạt')
  expect(html).not.toContain('Đơn hoàn thành')
})

it('explains an empty list without fabricating customers', () => {
  expect(render([])).toContain('Chưa có khách đặt phòng')
  access.isAdmin = true
  const html = render([])
  expect(html).toContain('Chưa có owner đã ký hợp đồng')
  expect(html).toContain('chưa xác định được lịch sử kích hoạt chưa được tính')
  expect(html).not.toContain('Tên từ API')
})

it('isolates cached contacts by actor and business scope', () => {
  const client = new QueryClient()
  const params = { page: 0, size: 10, keyword: '' }
  client.setQueryData(customerDirectoryKey('owner-a', 'hotel-guests', params), [contact])
  expect(client.getQueryData(customerDirectoryKey('owner-b', 'hotel-guests', params))).toBeUndefined()
  expect(client.getQueryData(customerDirectoryKey('owner-a', 'partners', params))).toBeUndefined()
  client.clear()
})
