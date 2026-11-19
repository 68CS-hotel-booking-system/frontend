import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClientBookingConfirmation } from './ClientBookingConfirmation'

const hotelId = '11111111-1111-4111-8111-111111111111'
const bookingId = '22222222-2222-4222-8222-222222222222'
const customerId = '33333333-3333-4333-8333-333333333333'

function renderConfirmation(status: string, actualHotelId = hotelId, expiresAt = '2099-01-01T00:00:00Z') {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } })
  client.setQueryData(['bookings', 'client-confirmation', customerId, bookingId], {
    id: bookingId, hotelId: actualHotelId, status, bookingCode: 'TEST-BOOKING',
    checkIn: '2099-01-10', checkOut: '2099-01-12', nights: 2, adults: 1, children: 0,
    booker: { fullName: 'Test User', phone: '0901234567' },
    guest: { fullName: 'Test User', phone: '0901234567', email: 'test@example.com' },
    items: [{ roomTypeName: 'Deluxe' }], totalAmount: 1100000, currency: 'VND', expiresAt,
    createdAt: '2026-11-18T10:00:00Z',
    roomSubtotalAmount: 1100000, surchargeAmount: 0, discountAmount: 0,
  })
  return renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter>
    <ClientBookingConfirmation hotelId={hotelId} bookingId={bookingId} customerId={customerId} />
  </MemoryRouter></QueryClientProvider>)
}

it('lets the customer pay a pending booking from the confirmation page', () => {
  const markup = renderConfirmation('PENDING_PAYMENT')
  expect(markup).toContain('aria-label="VNPay"')
  expect(markup).toContain('Đang lấy mã QR từ VNPay')
  expect(markup).not.toContain('Hiện mã QR')
  expect(markup).toContain('Hoàn tất thanh toán')
})

it('closes both payment options when the hold expires before the booking status updates', () => {
  const markup = renderConfirmation('PENDING_PAYMENT', hotelId, '2000-01-01T00:00:00Z')
  expect(markup).toContain('00:00')
  expect(markup).not.toContain('Hiện mã QR')
  expect(markup).not.toContain('aria-label="VNPay"')
})

it.each(['CONFIRMED', 'CANCELLED', 'EXPIRED'])('does not offer payment for a %s booking', status => {
  expect(renderConfirmation(status)).not.toContain('aria-label="VNPay"')
})

it('does not offer payment when the booking belongs to another hotel', () => {
  const markup = renderConfirmation('PENDING_PAYMENT', customerId)
  expect(markup).toContain('Đơn đặt phòng không thuộc khách sạn này')
  expect(markup).not.toContain('aria-label="VNPay"')
})
