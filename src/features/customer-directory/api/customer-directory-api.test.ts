import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const id = '11111111-1111-4111-8111-111111111111'
const contact = { id, fullName: 'Khách kiểm thử', email: 'guest@example.test', phone: '0900000000', hotelCount: 2 }
const fetcher = vi.fn<typeof fetch>()
const paged = (content: unknown[]) => ({ content, page: 1, size: 10, totalElements: 11, totalPages: 2, first: false, last: true })
beforeEach(() => { vi.resetModules(); fetcher.mockReset(); vi.stubGlobal('fetch', fetcher) })
afterEach(() => vi.unstubAllGlobals())

it('reads owner customers from the scoped booking endpoint and preserves server pagination', async () => {
  const customer = { ...contact, bookingCount: 4, completedBookingCount: 2, lastBookedAt: '2026-11-24T00:00:00Z' }
  fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data: paged([customer]) })))
  const { getCustomers } = await import('./customer-directory-api')
  const signal = new AbortController().signal
  const result = await getCustomers('hotel-guests', { page: 1, size: 10, keyword: '  Khách %  ' }, signal)
  expect(fetcher.mock.calls[0][0]).toBe('/api/v1/management/customers?page=1&size=10&keyword=Kh%C3%A1ch+%25')
  expect(fetcher.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal)
  expect(result).toEqual(paged([customer]))
})

it('reads signed owner partners for admin without sending a caller-controlled owner scope', async () => {
  const partner = { ...contact, contractCount: 3, activeContractCount: 0, lastContractCreatedAt: '2025-01-01T00:00:00Z' }
  fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data: paged([partner]) })))
  const { getCustomers } = await import('./customer-directory-api')
  const result = await getCustomers('partners', { page: 1, size: 10, keyword: '' })
  expect(fetcher.mock.calls[0][0]).toBe('/api/v1/admin/customers?page=1&size=10')
  expect(result.content).toEqual([partner])
})

it('reports a backend denial and rejects malformed customer data without falling back to samples', async () => {
  const { getCustomers } = await import('./customer-directory-api')
  fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ code: 'ACCESS_DENIED', detail: 'Không có quyền.' }), { status: 403 }))
  await expect(getCustomers('partners', { page: 0, size: 10, keyword: '' })).rejects.toMatchObject({ status: 403, code: 'ACCESS_DENIED' })
  fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ message: 'ok', data: paged([{ ...contact, bookingCount: -1 }]) })))
  await expect(getCustomers('hotel-guests', { page: 0, size: 10, keyword: '' })).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
})
