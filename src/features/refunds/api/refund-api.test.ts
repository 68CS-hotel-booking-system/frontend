import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const fetcher = vi.fn<typeof fetch>()
const id = '11111111-1111-4111-8111-111111111111'
const sample = { id, paymentId: id, bookingId: id, hotelId: id, bookingCode: 'BK001', hotelName: 'Khách sạn', bookerName: 'Khách', bookerEmail: 'a@example.test', bookerPhone: '0901234567',
  amount: 500000, currency: 'VND', reason: 'CUSTOMER_CANCELLATION', customerNote: null, status: 'PENDING', settlementReference: null, note: null,
  createdAt: '2030-01-01T00:00:00Z', updatedAt: '2030-01-01T00:00:00Z', completedAt: null, version: 0, canProcess: true, history: [] }
beforeEach(() => { vi.resetModules(); fetcher.mockReset(); vi.stubGlobal('fetch', fetcher) })
afterEach(() => vi.unstubAllGlobals())
it('uses server-scoped customer and management lists without client ownership parameters', async () => {
  fetcher.mockImplementation(async () => new Response(JSON.stringify({ message: 'ok', data: { content: [sample], page: 0, size: 10, totalElements: 1, totalPages: 1, first: true, last: true } })))
  const { listRefunds } = await import('./refund-api')
  await listRefunds(false, { page: 0, size: 10, bookingId: id })
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/me/refunds?page=0&size=10&bookingId=${id}`)
  await listRefunds(true, { page: 0, size: 10, status: 'PENDING', keyword: ' BK001 ' })
  expect(fetcher.mock.calls[1][0]).toBe('/api/v1/management/refunds?page=0&size=10&status=PENDING&keyword=BK001')
})
it('records normalized manual settlement and version without allowing an editable amount', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data: { ...sample, status: 'COMPLETED', version: 2 } })))
  const { processRefund } = await import('./refund-api')
  await processRefund(id, { status: 'COMPLETED', reference: ' TX123 ', note: ' Đã hoàn ' }, 1)
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/admin/refunds/${id}/actions`)
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ status: 'COMPLETED', reference: 'TX123', note: 'Đã hoàn', expectedVersion: 1 })
})
it('requires a settlement reference and customer note and preserves conflict errors', async () => {
  const { processRefund, refundActionSchema, refundSchema } = await import('./refund-api')
  expect(() => processRefund(id, { status: 'COMPLETED', reference: '', note: 'a' }, 1)).toThrow()
  expect(refundActionSchema.safeParse({ status: 'PROCESSING', reference: '', note: ' ' }).success).toBe(false)
  expect(refundSchema.safeParse({ ...sample, amount: -1 }).success).toBe(false)
  expect(fetcher).not.toHaveBeenCalled()
  fetcher.mockResolvedValue(new Response(JSON.stringify({ detail: 'Tải lại.', code: 'REFUND_VERSION_CONFLICT' }), { status: 409 }))
  await expect(processRefund(id, { status: 'PROCESSING', reference: '', note: 'a' }, 0)).rejects.toMatchObject({ status: 409 })
  expect(fetcher).toHaveBeenCalledTimes(1)
})
