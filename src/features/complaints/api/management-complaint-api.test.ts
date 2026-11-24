import { beforeEach, afterEach, expect, it, vi } from 'vitest'
const fetcher = vi.fn<typeof fetch>()
const id = '11111111-1111-4111-8111-111111111111'
const sample = { complaint: { id, bookingId: id, hotelId: id, category: 'BILLING', content: 'Sai hóa đơn', status: 'IN_REVIEW',
  createdAt: '2030-01-01T00:00:00Z', updatedAt: '2030-01-01T00:00:00Z', version: 1,
  history: [{ id, actorRole: 'HOTEL_OWNER', fromStatus: 'OPEN', toStatus: 'IN_REVIEW', response: 'Đã tiếp nhận', createdAt: '2030-01-01T00:00:00Z', version: 1 }] },
  hotelName: 'Khách sạn', bookingCode: 'BK001', bookerName: 'Người đặt', bookerEmail: 'guest@example.test', bookerPhone: '0901234567' }
beforeEach(() => { vi.resetModules(); fetcher.mockReset(); vi.stubGlobal('fetch', fetcher) })
afterEach(() => vi.unstubAllGlobals())
it('searches and paginates the server-scoped queue without client-controlled ownership', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data: { content: [sample], page: 2, size: 10, totalElements: 21, totalPages: 3, first: false, last: true } })))
  const { listManagedComplaints } = await import('./management-complaint-api')
  const controller = new AbortController()
  const result = await listManagedComplaints({ page: 2, size: 10, status: 'IN_REVIEW', keyword: ' BK001 ' }, controller.signal)
  expect(fetcher.mock.calls[0][0]).toBe('/api/v1/management/complaints?page=2&size=10&status=IN_REVIEW&keyword=BK001')
  expect(fetcher.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal)
  expect(result.content[0].complaint.history[0].response).toBe('Đã tiếp nhận')
})
it('posts normalized feedback with the version loaded by the form', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data: sample })))
  const { handleComplaint } = await import('./management-complaint-api')
  await handleComplaint(id, { status: 'IN_REVIEW', response: ' Đã tiếp nhận ' }, 0)
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/management/complaints/${id}/actions`)
  expect(fetcher.mock.calls[0][1]?.method).toBe('POST')
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ status: 'IN_REVIEW', response: 'Đã tiếp nhận', expectedVersion: 0 })
})
it('rejects empty feedback, invalid statuses and negative versions before HTTP', async () => {
  const { handleComplaint, handlingSchema } = await import('./management-complaint-api')
  expect(() => handleComplaint(id, { status: 'IN_REVIEW', response: '  ' }, 0)).toThrow()
  expect(() => handleComplaint(id, { status: 'IN_REVIEW', response: 'a' }, -1)).toThrow()
  expect(handlingSchema.safeParse({ status: 'OPEN', response: 'test' }).success).toBe(false)
  expect(fetcher).not.toHaveBeenCalled()
})
it('preserves conflict errors for explicit reload without retrying a mutation', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ title: 'Conflict', detail: 'Tải lại khiếu nại.', code: 'COMPLAINT_VERSION_CONFLICT' }), { status: 409 }))
  const { handleComplaint } = await import('./management-complaint-api')
  await expect(handleComplaint(id, { status: 'RESOLVED', response: 'Đã xử lý' }, 0)).rejects.toMatchObject({ status: 409, code: 'COMPLAINT_VERSION_CONFLICT' })
  expect(fetcher).toHaveBeenCalledTimes(1)
})
