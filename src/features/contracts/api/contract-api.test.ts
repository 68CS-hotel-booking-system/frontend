import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const fetcher = vi.fn<typeof fetch>()
const id = '11111111-1111-4111-8111-111111111111'
const contract = {
  id, hotelId: id, ownerUserId: id, contractCode: 'a', commissionRate: 0,
  commissionBasis: 'AFTER_HOTEL_DISCOUNT', startsAt: '2027-01-01T00:00:00Z',
  endsAt: '2028-01-01T00:00:00Z', status: 'DRAFT', createdByUserId: id,
  createdAt: '2026-11-09T00:00:00Z', updatedAt: '2026-11-09T00:00:00Z',
}
beforeEach(() => { vi.resetModules(); vi.stubGlobal('fetch', fetcher); fetcher.mockReset() })
afterEach(() => vi.unstubAllGlobals())
function respond(data: unknown) { fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data }))) }

it('reads the real paginated contracts and backend status filter without inventing currency or terms', async () => {
  respond({ content: [contract], page: 1, size: 5, totalElements: 6, totalPages: 2, first: false, last: true })
  const { getHotelContracts } = await import('./contract-api')
  const result = await getHotelContracts(id, { page: 1, size: 5, status: 'DRAFT' }, new AbortController().signal)
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/finance/hotels/${id}/contracts?page=1&size=5&status=DRAFT&sort=createdAt%2Cdesc&sort=id%2Cdesc`)
  expect(fetcher.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal)
  expect(result).toMatchObject({ content: [contract], totalElements: 6 })
  expect(result.content[0]).not.toHaveProperty('currency')
})

it('creates only the supported draft contract fields and serializes dates as instants', async () => {
  respond(contract)
  const { createHotelContractDraft } = await import('./contract-api')
  await createHotelContractDraft(id, {
    ownerUserId: id, commissionRate: 0, commissionBasis: 'AFTER_HOTEL_DISCOUNT',
    startsAt: '2027-01-01T07:00', endsAt: '2028-01-01T07:00',
  })
  const body = JSON.parse(fetcher.mock.calls[0][1]?.body as string)
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/admin/hotels/${id}/contracts`)
  expect(body).toEqual({ ownerUserId: id, commissionRate: 0, commissionBasis: 'AFTER_HOTEL_DISCOUNT',
    startsAt: new Date('2027-01-01T07:00').toISOString(), endsAt: new Date('2028-01-01T07:00').toISOString(), status: 'DRAFT' })
})

it('rejects equal contract instants before sending the request', async () => {
  const { createHotelContractDraft } = await import('./contract-api')
  await expect(createHotelContractDraft(id, { ownerUserId: id, commissionRate: 100,
    commissionBasis: 'BEFORE_DISCOUNT', startsAt: '2027-01-01T00:00', endsAt: '2027-01-01T00:00' })).rejects.toMatchObject({ name: 'ZodError' })
  expect(fetcher).not.toHaveBeenCalled()
})

it('creates a linked renewal draft without sending the predecessor as an editable term', async () => {
  respond(contract)
  const { createHotelContractDraft } = await import('./contract-api')
  await createHotelContractDraft(id, { ownerUserId: id, commissionRate: 10,
    commissionBasis: 'AFTER_DISCOUNT', startsAt: '2027-01-01T07:00:30', endsAt: '2028-01-01T07:00:30',
    renewalOfContractId: id })
  expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/admin/hotels/${id}/contracts/${id}/renewals`)
  const body = JSON.parse(fetcher.mock.calls[0][1]?.body as string)
  expect(body.status).toBe('DRAFT')
  expect(body).not.toHaveProperty('renewalOfContractId')
  expect(body).not.toHaveProperty('contractCode')
  expect(body.startsAt).toBe(new Date('2027-01-01T07:00:30').toISOString())
})

it('activates and terminates through supported status commands without resending terms', async () => {
  const { changeContractStatus } = await import('./contract-api')
  for (const action of ['activate', 'terminate'] as const) {
    respond({ ...contract, status: action === 'activate' ? 'ACTIVE' : 'TERMINATED' })
    await changeContractStatus(id, id, action)
    const [url, options] = fetcher.mock.calls.at(-1)!
    expect(url).toBe(`/api/v1/admin/hotels/${id}/contracts/${id}/${action}`)
    expect(options?.method).toBe('POST')
    expect(options?.body).toBeUndefined()
  }
})
