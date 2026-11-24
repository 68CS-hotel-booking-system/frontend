import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import { parseCheckoutSelection } from '../model/client-checkout'
import { ClientBookingCheckout } from './ClientBookingCheckout'

const checkoutState = vi.hoisted(() => ({ uncertain: false }))

vi.mock('../hooks/use-client-checkout', () => ({
  useClientCheckout: () => ({
    uncertain: checkoutState.uncertain,
    available: true,
    availability: {},
    quote: {},
    submit: {},
    current: {
      currency: 'VND',
      nights: 2,
      roomSubtotalAmount: 900000,
      surchargeAmount: 100000,
      discountAmount: 50000,
      totalAmount: 950000,
      items: [],
    },
  }),
}))

it('renders the checkout quote in the summary and mobile bar, with guest and trip information', () => {
  const hotelId = '11111111-1111-4111-8111-111111111111'
  const roomTypeId = '22222222-2222-4222-8222-222222222222'
  const selection = parseCheckoutSelection(hotelId, new URLSearchParams({ roomTypeId, checkIn: '2099-01-10', checkOut: '2099-01-12', adults: '2' }))!
  const user = { id: hotelId, fullName: 'Khách kiểm thử', email: 'qa@example.invalid', phone: '0900000000', emailVerified: true }
  const html = renderToStaticMarkup(<MemoryRouter>
    <ClientBookingCheckout selection={selection} user={user} hotelName="Khách sạn kiểm thử" roomName="Deluxe"
      checkInTime="14:00:00" checkOutTime="12:00:00" coverUrl="/assets/hotel-placeholder.svg" />
  </MemoryRouter>)
  expect(html).toContain('aria-current="step"')
  expect(html.match(/950\.000/g)).toHaveLength(2)
  expect(html.match(/form="checkout-form"/g)).toHaveLength(2)
  expect(html).toContain('Người nhận phòng khác với người đặt')
  expect(html).toContain('Chuyến đi của bạn')
})

it('does not render a booking form for an admin even with the customer role', () => {
  const hotelId = '11111111-1111-4111-8111-111111111111'
  const selection = parseCheckoutSelection(hotelId, new URLSearchParams({ roomTypeId: '22222222-2222-4222-8222-222222222222', checkIn: '2099-01-10', checkOut: '2099-01-12', adults: '2' }))!
  const html = renderToStaticMarkup(<MemoryRouter>
    <ClientBookingCheckout selection={selection} user={{ id: hotelId, fullName: 'Admin', email: 'admin@example.test', phone: '0900000000', emailVerified: true, roles: ['ADMIN', 'CUSTOMER'] }}
      hotelName="Khách sạn kiểm thử" roomName="Deluxe" checkInTime="14:00" checkOutTime="12:00" />
  </MemoryRouter>)
  expect(html).toContain('Tài khoản quản trị không được đặt phòng')
  expect(html).not.toContain('<form')
  expect(html).not.toContain('form="checkout-form"')
})

it('keeps confirmation available for a customer retry after an uncertain idempotent request', () => {
  checkoutState.uncertain = true
  try {
    const hotelId = '11111111-1111-4111-8111-111111111111'
    const selection = parseCheckoutSelection(hotelId, new URLSearchParams({ roomTypeId: '22222222-2222-4222-8222-222222222222', checkIn: '2099-01-10', checkOut: '2099-01-12', adults: '2' }))!
    const html = renderToStaticMarkup(<MemoryRouter><ClientBookingCheckout selection={selection}
      user={{ id: hotelId, fullName: 'Khách', email: 'guest@test.local', phone: '0900000000', emailVerified: true }}
      hotelName="Khách sạn" roomName="Deluxe" checkInTime="14:00" checkOutTime="12:00" /></MemoryRouter>)
    expect(html).toContain('Chưa xác định được kết quả tạo đơn')
    const buttons = [...html.matchAll(/<button\b[^>]*form="checkout-form"[^>]*>/g)].map(match => match[0])
    expect(buttons).toHaveLength(2)
    for (const button of buttons) expect(button).not.toContain('disabled')
  } finally { checkoutState.uncertain = false }
})
