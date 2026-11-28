import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const fetcher = vi.fn<typeof fetch>()
beforeEach(() => {
  vi.resetModules()
  fetcher.mockReset()
  vi.stubGlobal('fetch', fetcher)
})
afterEach(() => vi.unstubAllGlobals())

const hotelId = '11111111-1111-4111-8111-111111111111'

const sampleReport = {
  from: '2027-03-01',
  to: '2027-03-31',
  hotelId,
  currency: 'VND',
  totals: {
    availableRoomNights: 62,
    soldRoomNights: 3,
    roomRevenue: 1800000,
    occupancyRate: 0.0484,
    adr: 600000,
    revpar: 29032,
    completedRevenue: 750000,
    newBookings: 4,
    cancelledBookings: 1,
    noShowBookings: 1,
  },
  months: [
    {
      month: '2027-03',
      availableRoomNights: 62,
      soldRoomNights: 3,
      roomRevenue: 1800000,
      occupancyRate: 0.0484,
      adr: 600000,
      revpar: 29032,
      completedRevenue: 750000,
      newBookings: 4,
      cancelledBookings: 1,
      noShowBookings: 1,
    },
  ],
  hotels: [
    {
      hotelId,
      hotelName: 'Khách sạn Biển Xanh',
      availableRoomNights: 62,
      soldRoomNights: 3,
      roomRevenue: 1800000,
      occupancyRate: 0.0484,
      adr: 600000,
      revpar: 29032,
      completedRevenue: 750000,
    },
  ],
  scopeHotels: [{ hotelId, hotelName: 'Khách sạn Biển Xanh' }],
}

it('requests operations report with date range and optional hotelId', async () => {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data: sampleReport })))
  const { getOperationsReport } = await import('./reports-api')
  const data = await getOperationsReport({ from: '2027-03-01', to: '2027-03-31', hotelId })
  expect(fetcher.mock.calls[0][0]).toBe(
    `/api/v1/management/reports/operations?from=2027-03-01&to=2027-03-31&hotelId=${hotelId}`,
  )
  expect(data.totals.adr).toBe(600000)
  expect(data.months).toHaveLength(1)
})

it('omits hotelId query parameter when requesting all hotels', async () => {
  fetcher.mockResolvedValue(
    new Response(JSON.stringify({ message: 'ok', data: { ...sampleReport, hotelId: null } })),
  )
  const { getOperationsReport } = await import('./reports-api')
  await getOperationsReport({ from: '2027-03-01', to: '2027-03-31' })
  expect(fetcher.mock.calls[0][0]).toBe(
    '/api/v1/management/reports/operations?from=2027-03-01&to=2027-03-31',
  )
})
