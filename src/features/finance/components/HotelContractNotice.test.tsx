import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { HotelContractNotice } from './HotelContractNotice'

vi.mock('@/features/auth', () => ({ useCurrentUser: () => ({
  currentUser: { id: 'notice-owner' }, isAdmin: false, isOwner: true,
}) }))

function renderNotice(contractStatus: string, acceptingBookings: boolean) {
  const client = new QueryClient()
  client.setQueryData(['finance-dashboard', 'notice-owner'], {
    hotels: [{ hotelId: 'hotel-test', contractStatus, acceptingBookings, endsAt: '2026-11-01T00:00:00Z' }],
  })
  return renderToStaticMarkup(<MemoryRouter><QueryClientProvider client={client}>
    <HotelContractNotice hotelId="hotel-test" />
  </QueryClientProvider></MemoryRouter>)
}

it('explains expiry and directs the owner to admin while preserving existing bookings', () => {
  const html = renderNotice('EXPIRED', false)
  expect(html).toContain('Hết hạn · Đã ngừng bán')
  expect(html).toContain('Liên hệ quản trị viên')
  expect(html).toContain('Các đơn đã tạo vẫn được phục vụ')
  expect(html).toContain('/contracts?hotelId=hotel-test')
})

it('does not blame the contract when a hotel is stopped for another reason', () => {
  const html = renderNotice('EFFECTIVE', false)
  expect(html).toContain('Kiểm tra hồ sơ và trạng thái khách sạn')
  expect(html).not.toContain('Hết hạn')
})
