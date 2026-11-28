import { beforeEach, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { PaymentReturn } from './PaymentReturn'

const { query } = vi.hoisted(() => ({ query: {
  isPending: false, isError: false, isFetching: false,
  refetch: vi.fn(),
  data: {
    id: '11111111-1111-4111-8111-111111111111',
    bookingId: '22222222-2222-4222-8222-222222222222',
    amountVnd: 123456, currency: 'VND', status: 'SUCCEEDED',
    bookingConfirmed: true, expired: false, expiresAt: '2030-01-01T00:00:00Z',
  },
} }))
vi.mock('../hooks/use-payment', () => ({ usePayment: () => query }))

beforeEach(() => {
  query.data.status = 'SUCCEEDED'
  query.data.bookingConfirmed = true
  query.data.expired = false
  query.data.expiresAt = '2030-01-01T00:00:00Z'
})

function renderReturn() {
  return renderToStaticMarkup(<MemoryRouter initialEntries={['/payment/return?vnp_TxnRef=11111111-1111-4111-8111-111111111111']}>
    <PaymentReturn />
  </MemoryRouter>)
}

it('reports receipt and links to current booking status without claiming a cancelled booking is still confirmed', () => {
  expect(renderReturn()).toContain('Xem trạng thái hiện tại của đơn')
  expect(renderReturn()).toContain('href="/my-bookings"')
})

it('warns against paying again when money was received without a booking confirmation', () => {
  query.data.bookingConfirmed = false
  const html = renderReturn()
  expect(html).toContain('Đã nhận thanh toán, cần kiểm tra đặt phòng')
  expect(html).toContain('không thanh toán lại')
  expect(html).toContain('Yêu cầu hoàn tiền đã được tạo')
  expect(html).toContain('/my-refunds?bookingId=')
  expect(html).not.toContain('đơn đặt phòng đã được xác nhận')
})

it('shows expired pending payment without claiming failure or success', () => {
  query.data.status = 'PENDING'
  query.data.bookingConfirmed = false
  query.data.expiresAt = '2000-01-01T00:00:00Z'
  query.data.expired = true
  expect(renderReturn()).toContain('Đã hết hạn thanh toán')
})
