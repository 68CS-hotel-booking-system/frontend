import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { HotelStaffPage } from './HotelStaffPage'

const state = vi.hoisted(() => ({
  hotels: [] as { id: string; name: string; canAssignManager: boolean }[],
  isPending: false,
  isError: false,
}))

vi.mock('@/features/hotel-staff', () => ({
  useStaffHotels: () => ({
    data: {
      content: state.hotels,
      page: 0,
      size: 20,
      totalElements: state.hotels.length,
      totalPages: state.hotels.length ? 1 : 0,
      first: true,
      last: true,
    },
    isPending: state.isPending,
    isError: state.isError,
    error: state.isError ? new Error('Lỗi tải dữ liệu') : null,
    refetch: vi.fn(),
  }),
  HotelStaffPanel: ({ hotel }: { hotel: { id: string; name: string } }) => (
    <div data-testid="staff-panel">Bảng nhân sự: {hotel.name}</div>
  ),
}))

afterEach(() => {
  state.hotels = []
  state.isPending = false
  state.isError = false
})

it('shows empty state when the actor manages no hotels', () => {
  const markup = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/staff']}>
      <HotelStaffPage />
    </MemoryRouter>,
  )
  expect(markup).toContain('Nhân sự khách sạn')
  expect(markup).toContain('Bạn chưa quản lý khách sạn nào')
})

it('renders the selected hotel staff panel synced with hotelId query param', () => {
  state.hotels = [
    { id: '11111111-1111-4111-8111-111111111111', name: 'Khách sạn Biển Xanh', canAssignManager: true },
    { id: '22222222-2222-4222-8222-222222222222', name: 'Khách sạn Núi Rừng', canAssignManager: false },
  ]
  const markup = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/staff?hotelId=22222222-2222-4222-8222-222222222222']}>
      <HotelStaffPage />
    </MemoryRouter>,
  )
  expect(markup).toContain('Bảng nhân sự: Khách sạn Núi Rừng')
  expect(markup).toContain('Chọn khách sạn')
})
