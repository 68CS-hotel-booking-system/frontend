import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import { parseCheckoutSelection } from '../model/client-checkout'
import { ClientBookingCheckout } from './ClientBookingCheckout'

vi.mock('../hooks/use-client-checkout', () => ({
  useClientCheckout: () => ({
    available: true, availability: {}, quote: {}, submit: {},
    current: {
      currency: 'VND', nights: 2, roomSubtotalAmount: 900000, surchargeAmount: 100000, discountAmount: 50000,
      totalAmount: 950000, items: [],
    },
  }),
}))

it('renders the checkout quote in the summary and mobile bar, with a separate guest section', () => {
  const hotelId = '11111111-1111-4111-8111-111111111111'
  const roomTypeId = '22222222-2222-4222-8222-222222222222'
  const selection = parseCheckoutSelection(hotelId, new URLSearchParams({ roomTypeId, checkIn: '2099-01-10', checkOut: '2099-01-12', adults: '2' }))!
  const user = { id: hotelId, fullName: 'Khách kiểm thử', email: 'qa@example.invalid', phone: '0900000000', emailVerified: true }
  const html = renderToStaticMarkup(<MemoryRouter>
    <ClientBookingCheckout selection={selection} user={user} hotelName="Khách sạn kiểm thử" roomName="Deluxe"
      checkInTime="14:00:00" checkOutTime="12:00:00" hotelCover={<img alt="" src="/assets/hotel-placeholder.svg" />} />
  </MemoryRouter>)
  expect(html).toContain('aria-current="step"')
  expect(html).toContain('VNPay')
  expect(html.match(/950\.000/g)).toHaveLength(2)
  expect(html.match(/form="checkout-form"/g)).toHaveLength(2)
  expect(html.match(/<div[^>]*id="checkout-other-guest-fields"[^>]*>/)?.[0]).toContain('hidden')
  expect(html).not.toContain('Miễn phí hủy')
})
