import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const fetcher = vi.fn<typeof fetch>()
const id = '11111111-1111-4111-8111-111111111111'
beforeEach(() => { vi.resetModules(); fetcher.mockReset(); vi.stubGlobal('fetch', fetcher) })
afterEach(() => vi.unstubAllGlobals())
it('validates OTHER descriptions before sending and rejects unknown categories', async () => {
  const { submitComplaint, complaintFormSchema } = await import('./complaint-api')
  expect(() => submitComplaint(id, { category: 'OTHER', content: 'Ngắn' })).toThrow()
  expect(complaintFormSchema.safeParse({ category: 'FAKE', content: 'Nội dung' }).success).toBe(false)
  expect(fetcher).not.toHaveBeenCalled()
})
it('submits only content/category against the owned booking and preserves server state', async () => {
  const payload = { category: 'BILLING' as const, content: 'Đơn chưa xác nhận sau thanh toán.' }
  fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data: { id, bookingId: id, hotelId: id, ...payload, status: 'OPEN', createdAt: '2030-01-01T00:00:00Z', updatedAt: '2030-01-01T00:00:00Z' } })))
  const { submitComplaint } = await import('./complaint-api')
  expect((await submitComplaint(id, payload)).status).toBe('OPEN')
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/bookings/${id}/complaints`)
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual(payload)
})
