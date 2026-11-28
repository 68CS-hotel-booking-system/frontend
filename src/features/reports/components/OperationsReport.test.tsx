import { MemoryRouter } from 'react-router'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { OperationsReport } from './OperationsReport'

const hotelId = '11111111-1111-4111-8111-111111111111'

vi.mock('../hooks/use-operations-report', () => ({
  useOperationsReport: () => ({
    isAdmin: false,
    canView: true,
    query: {
      isPending: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      data: {
        from: '2027-03-01',
        to: '2027-03-31',
        hotelId: null,
        currency: 'VND',
        totals: {
          availableRoomNights: 62,
          soldRoomNights: 31,
          roomRevenue: 18600000,
          occupancyRate: 0.5,
          adr: 600000,
          revpar: 300000,
          completedRevenue: 12000000,
          newBookings: 10,
          cancelledBookings: 2,
          noShowBookings: 1,
        },
        months: [
          {
            month: '2027-03',
            availableRoomNights: 62,
            soldRoomNights: 31,
            roomRevenue: 18600000,
            occupancyRate: 0.5,
            adr: 600000,
            revpar: 300000,
            completedRevenue: 12000000,
            newBookings: 10,
            cancelledBookings: 2,
            noShowBookings: 1,
          },
        ],
        hotels: [
          {
            hotelId,
            hotelName: 'Khách sạn Biển Xanh',
            availableRoomNights: 62,
            soldRoomNights: 31,
            roomRevenue: 18600000,
            occupancyRate: 0.5,
            adr: 600000,
            revpar: 300000,
            completedRevenue: 12000000,
          },
        ],
        scopeHotels: [{ hotelId, hotelName: 'Khách sạn Biển Xanh' }],
      },
    },
  }),
}))

it('renders occupancy, ADR, RevPAR, monthly chart and hotel breakdown from API data', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <OperationsReport />
    </MemoryRouter>,
  )
  expect(html).toContain('Tỷ lệ lấp đầy')
  expect(html).toContain('50.0%')
  expect(html).toContain('600.000')
  expect(html).toContain('300.000')
  expect(html).toContain('Khách sạn Biển Xanh')
  expect(html).toContain('03/2027')
  expect(html).toContain('không trừ lịch chặn phòng')
})
