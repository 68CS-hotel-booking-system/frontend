import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const fetcher = vi.fn<typeof fetch>()
beforeEach(() => { vi.resetModules(); vi.stubGlobal('fetch', fetcher); fetcher.mockReset() })
afterEach(() => vi.unstubAllGlobals())
const response = (data: unknown, status = 200) => fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data }), { status }))

it('returns an empty search page without substituting sample hotels', async () => {
  response({ content: [], page: 0, size: 12, totalElements: 0, totalPages: 0, first: true, last: true })
  const { searchHotels } = await import('./public-discovery-api')
  const result = await searchHotels({ cityId: '', checkIn: '', checkOut: '', guests: 1, page: 0 })
  expect(result.content).toEqual([])
})

it('propagates search errors rather than substituting sample hotels', async () => {
  response(null, 503)
  const { searchHotels } = await import('./public-discovery-api')
  await expect(searchHotels({ cityId: '', checkIn: '', checkOut: '', guests: 1, page: 0 })).rejects.toMatchObject({ status: 503 })
})

it('passes the selection to quote and preserves nightly prices and total from the server', async () => {
  response({ currency: 'VND', nights: 2, roomSubtotalAmount: 500000, surchargeAmount: 0, subtotalAmount: 500000, discountAmount: 0, totalAmount: 500000, items: [{ roomTypeId: 'room', nightlyPrices: [{ stayDate: '2026-12-01', unitPrice: 300000 }, { stayDate: '2026-12-02', unitPrice: 200000 }] }] })
  const { getQuote } = await import('./public-discovery-api')
  const params = { checkIn: '2026-12-01', checkOut: '2026-12-03', adults: 2, children: 0, quantity: 1 }
  const result = await getQuote('hotel', params, 'room')
  expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ checkIn: params.checkIn, checkOut: params.checkOut, items: [{ roomTypeId: 'room', quantity: 1, adults: 2, children: 0 }] })
  expect(result.items[0].nightlyPrices.map(n => n.unitPrice)).toEqual([300000, 200000])
  expect(result.totalAmount).toBe(500000)
})
