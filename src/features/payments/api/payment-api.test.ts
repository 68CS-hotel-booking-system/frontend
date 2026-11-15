import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const fetcher = vi.fn<typeof fetch>()
const id = '11111111-1111-4111-8111-111111111111'
beforeEach(() => { vi.resetModules(); fetcher.mockReset(); vi.stubGlobal('fetch', fetcher) })
afterEach(() => vi.unstubAllGlobals())
it('reads the owned payment using bearer auth and preserves server PENDING', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'Payment', data: {
    id, bookingId: '22222222-2222-4222-8222-222222222222', amountVnd: 123456,
    currency: 'VND', status: 'PENDING', paymentUrl: null, expiresAt: '2026-11-10T10:00:00Z',
  } })))
  const { setSession } = await import('@/shared/api/session')
  setSession({ accessToken: 'qa-only', expiresAt: '2030-01-01T00:00:00Z' })
  const { getPayment } = await import('./payment-api')
  expect((await getPayment(id)).status).toBe('PENDING')
  expect(fetcher.mock.calls[0][0]).toBe('/api/v1/payments/' + id)
  expect(new Headers(fetcher.mock.calls[0][1]?.headers).get('Authorization')).toBe('Bearer qa-only')
  expect(fetcher.mock.calls[0][1]?.body).toBeUndefined()
})
it('propagates denied access without substituting success', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ detail: 'Not found' }), { status: 404 }))
  const { getPayment } = await import('./payment-api')
  await expect(getPayment(id)).rejects.toMatchObject({ status: 404 })
})
it('rejects malformed references before making a request', async () => {
  const { getPayment } = await import('./payment-api')
  await expect(getPayment('../admin/users')).rejects.toBeDefined()
  expect(fetcher).not.toHaveBeenCalled()
})
it('rejects unsafe payment redirects and accepts the VNPay sandbox', async () => {
  const { paymentRedirectUrl } = await import('./payment-api')
  expect(paymentRedirectUrl('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html')).toContain('sandbox.vnpayment.vn')
  for (const url of ['javascript:alert(1)', 'http://sandbox.vnpayment.vn/', 'https://vnpayment.vn.evil.example/', 'https://user:password@sandbox.vnpayment.vn/']) {
    expect(() => paymentRedirectUrl(url)).toThrow()
  }
})
