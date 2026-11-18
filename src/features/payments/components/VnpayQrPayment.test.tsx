import { beforeEach, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import type { Payment } from '../api/payment-api'
import { VnpayQrPayment } from './VnpayQrPayment'

const { query } = vi.hoisted(() => ({ query: {
  data: undefined as Payment | undefined, isError: false, isFetching: false, error: null, refetch: vi.fn(),
} }))
vi.mock('../hooks/use-payment', () => ({ usePayment: () => query }))

const payment: Payment = {
  id: '11111111-1111-4111-8111-111111111111', bookingId: '22222222-2222-4222-8222-222222222222',
  amountVnd: 1100000, currency: 'VND', status: 'PENDING', qrContent: '000201-test-qr',
  paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', expiresAt: '2099-01-01T00:00:00Z',
  bookingConfirmed: false, expired: false,
}
beforeEach(() => { query.data = undefined; query.isError = false })
function renderQr() {
  return renderToStaticMarkup(<MemoryRouter><VnpayQrPayment initialPayment={payment} portalUrl={payment.paymentUrl} /></MemoryRouter>)
}

it('displays a provider QR and server amount while waiting for IPN', () => {
  const markup = renderQr()
  expect(markup).toContain('aria-label="Mã QR thanh toán VNPAY"')
  expect(markup).toContain('<svg')
  expect(markup).toContain('1.100.000')
  expect(markup).toContain('Đang chờ xác nhận thanh toán')
  expect(markup).toContain('VNPAY Sandbox')
})

it('removes the QR after the backend confirms the booking', () => {
  query.data = { ...payment, status: 'SUCCEEDED', bookingConfirmed: true }
  const markup = renderQr()
  expect(markup).toContain('Đơn đặt phòng đã được xác nhận')
  expect(markup).not.toContain('aria-label="Mã QR thanh toán VNPAY"')
})

it('does not claim a confirmed booking for late received money', () => {
  query.data = { ...payment, status: 'SUCCEEDED', bookingConfirmed: false }
  const markup = renderQr()
  expect(markup).toContain('cần kiểm tra đặt phòng')
  expect(markup).toContain('không thanh toán lại')
  expect(markup).not.toContain('Đơn đặt phòng đã được xác nhận')
})

it.each(['expired', 'failed', 'missing-qr'])('does not show a payable QR for %s', state => {
  query.data = { ...payment, ...(state === 'expired' ? { expiresAt: '2000-01-01T00:00:00Z' }
    : state === 'failed' ? { status: 'FAILED' as const } : { qrContent: null }) }
  const markup = renderQr()
  expect(markup).not.toContain('aria-label="Mã QR thanh toán VNPAY"')
  expect(markup).not.toContain('Đơn đặt phòng đã được xác nhận')
})
