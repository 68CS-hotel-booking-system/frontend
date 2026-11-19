import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import type { BookingSummary } from '../api/booking-api'
import { bookingKeys } from '../hooks/use-bookings'
import { tripGroups } from '../hooks/use-customer-trips'
import { CustomerBookingList } from './CustomerBookingList'

const hotelId = '11111111-1111-4111-8111-111111111111'
const booking: BookingSummary = {
  id: '22222222-2222-4222-8222-222222222222',
  customerId: '33333333-3333-4333-8333-333333333333',
  hotelId, bookingCode: 'SH-TEST-01', bookerName: 'Khách đặt', guestName: null,
  checkIn: '2099-01-10', checkOut: '2099-01-12', nights: 2, adults: 2, children: 1,
  status: 'PENDING_PAYMENT', currency: 'VND', totalAmount: 990000,
  expiresAt: '2099-01-09T12:00:00Z', createdAt: '2099-01-08T12:00:00Z',
}

function renderTrips(bookings: BookingSummary[]) {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  const params = { page: 0, size: 10, status: 'PENDING_PAYMENT' }
  client.setQueryData([...bookingKeys.list(), 'trips', tripGroups.upcoming], {
    pages: [[{ params, result: { content: bookings, totalElements: bookings.length } }]],
    pageParams: [[params]],
  })
  client.setQueryData(['hotels', 'public-detail', hotelId], { name: 'Khách sạn test', address: 'Hà Nội' })
  client.setQueryData(['hotels', 'public-room-types', hotelId], [])
  return renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter>
    <CustomerBookingList CoverImage={() => <img src="/test-photo.jpg" alt="" />} />
  </MemoryRouter></QueryClientProvider>)
}

it('renders backend booking data and payment actions in a customer trip card', () => {
  const html = renderTrips([booking])
  expect(html).toContain('SH-TEST-01')
  expect(html).toContain('990.000')
  expect(html).toContain('10/01/2099')
  expect(html).toContain('Thanh toán qua VNPay')
  expect(html).toContain('Hủy đặt phòng')
  expect(html).toContain(`href="/stays/${hotelId}"`)
})

it('renders the upcoming empty state instead of a sample trip', () => {
  const html = renderTrips([])
  expect(html).toContain('Chưa có đơn đặt phòng sắp tới')
  expect(html).not.toContain('Thanh toán qua VNPay')
})

it.each([
  { status: 'PENDING_PAYMENT', expiresAt: '2000-01-01T00:00:00Z' },
  { status: 'EXPIRED', expiresAt: null },
])('keeps details and hides cancellation and payment for an expired hold (%s)', state => {
  const html = renderTrips([{ ...booking, ...state }])
  expect(html).toContain('Hết hạn thanh toán')
  expect(html).toContain('Đơn đã hết thời gian giữ phòng.')
  expect(html).toContain('Xem chi tiết')
  expect(html).not.toContain('Thanh toán qua VNPay')
  expect(html).not.toContain('Hủy đặt phòng')
})
