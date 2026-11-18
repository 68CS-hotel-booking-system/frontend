import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BookingCheckout } from './BookingCheckout'

const stay = { checkIn: '2030-01-10', checkOut: '2030-01-12', adults: 1, children: 0, quantity: 1 }
const preparedQuote = {
  input: { checkIn: stay.checkIn, checkOut: stay.checkOut, items: [{ roomTypeId: '22222222-2222-4222-8222-222222222222', quantity: 1, adults: 1, children: 0 }] },
  quote: { currency: 'VND', nights: 2, roomSubtotalAmount: 1100000, surchargeAmount: 0, discountAmount: 0, totalAmount: 1100000 },
}

function renderCheckout(ready: boolean) {
  return renderToStaticMarkup(<QueryClientProvider client={new QueryClient()}><MemoryRouter>
    <BookingCheckout hotelId="11111111-1111-4111-8111-111111111111" stay={stay} preparedQuote={ready ? preparedQuote : null} />
  </MemoryRouter></QueryClientProvider>)
}

it('enables the booking button for a current server quote', () => {
  const markup = renderCheckout(true)
  const button = markup.match(/<button[^>]*>Tiếp tục đặt phòng<\/button>/)?.[0]
  expect(button).toBeDefined()
  expect(button).not.toContain('disabled')
  expect(markup).not.toContain('Thanh toán qua VNPay')
})

it('disables booking when the current selection has no usable quote', () => {
  expect(renderCheckout(false).match(/<button[^>]*>Tiếp tục đặt phòng<\/button>/)?.[0]).toContain('disabled')
})
