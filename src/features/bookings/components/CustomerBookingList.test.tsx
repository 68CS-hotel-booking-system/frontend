import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it } from 'vitest'
import { setSession } from '@/shared/api/session'
import type { BookingSummary } from '../api/booking-api'
import { bookingKeys } from '../hooks/use-bookings'
import { tripGroups } from '../hooks/use-customer-trips'
import { CustomerBookingList } from './CustomerBookingList'

const hotelId = '11111111-1111-4111-8111-111111111111'
const userAId = '33333333-3333-4333-8333-333333333333'
const userBId = '44444444-4444-4444-8444-444444444444'
const booking: BookingSummary = {
  id: '22222222-2222-4222-8222-222222222222',
  customerId: userAId,
  hotelId, bookingCode: 'SH-TEST-01', bookerName: 'Khách đặt', guestName: 'Nguyễn Văn A',
  checkIn: '2099-01-10', checkOut: '2099-01-12', nights: 2, adults: 2, children: 1,
  status: 'PENDING_PAYMENT', currency: 'VND', totalAmount: 990000,
  expiresAt: '2099-01-09T12:00:00Z', createdAt: '2099-01-08T12:00:00Z',
}

afterEach(() => {
  setSession(null)
})

function renderTrips(bookings: BookingSummary[], identity = userAId) {
  setSession({ accessToken: `token-${identity}`, expiresAt: '2099-01-01T00:00:00Z', userId: identity })
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  const params = { page: 0, size: 10, status: 'PENDING_PAYMENT' }
  client.setQueryData(bookingKeys.trips(tripGroups.upcoming, identity), {
    pages: [[{ params, result: { content: bookings, totalElements: bookings.length } }]],
    pageParams: [[params]],
  })
  client.setQueryData(['hotels', 'public-detail', hotelId], { name: 'Khách sạn test', address: 'Hà Nội' })
  client.setQueryData(['hotels', 'public-room-types', hotelId], [])
  return {
    client,
    html: renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter>
      <CustomerBookingList CoverImage={() => <img src="/test-photo.jpg" alt="" />} />
    </MemoryRouter></QueryClientProvider>),
  }
}

it('renders backend booking data and payment actions in a customer trip card', () => {
  const { html } = renderTrips([booking])
  expect(html).toContain('SH-TEST-01')
  expect(html).toContain('990.000')
  expect(html).toContain('10/01/2099')
  expect(html).toContain('Thanh toán qua VNPay')
  expect(html).toContain('Hủy đặt phòng')
  expect(html).toContain(`href="/stays/${hotelId}"`)
})

it('renders the upcoming empty state instead of a sample trip', () => {
  const { html } = renderTrips([])
  expect(html).toContain('Chưa có đơn đặt phòng sắp tới')
  expect(html).not.toContain('Thanh toán qua VNPay')
})

it('does not offer cancellation for confirmed paid bookings', () => {
  const { html } = renderTrips([{ ...booking, status: 'CONFIRMED' }])
  expect(html).not.toContain('Hủy đặt phòng')
  expect(html).not.toContain('Thanh toán qua VNPay')
  expect(html).toContain('Xem chi tiết')
})

it('scopes the trips query key by user identity so switching accounts never renders the previous user guest name or booking', () => {
  expect(bookingKeys.trips(tripGroups.upcoming, userAId)).toContain(userAId)
  expect(bookingKeys.trips(tripGroups.upcoming, userAId)).not.toEqual(bookingKeys.trips(tripGroups.upcoming, userBId))

  const { client, html: htmlUserA } = renderTrips([booking], userAId)
  expect(htmlUserA).toContain('Nguyễn Văn A')
  expect(htmlUserA).toContain('SH-TEST-01')

  // Simulate another account becoming active in the same QueryClient without sharing the old cache slot
  setSession({ accessToken: `token-${userBId}`, expiresAt: '2099-01-01T00:00:00Z', userId: userBId })
  const htmlUserB = renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter>
    <CustomerBookingList CoverImage={() => <img src="/test-photo.jpg" alt="" />} />
  </MemoryRouter></QueryClientProvider>)

  expect(htmlUserB).not.toContain('Nguyễn Văn A')
  expect(htmlUserB).not.toContain('SH-TEST-01')
})
