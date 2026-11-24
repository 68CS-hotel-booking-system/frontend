import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { HotelModulePage } from './HotelModulePage'

const authState = vi.hoisted(() => ({ isAdmin: true }))
const hotelData = vi.hoisted(() => [
  {
    id: 'hotel-1',
    ownerUserId: 'owner-1',
    name: 'Thai Binh Hotel',
    slug: 'thai-binh',
    cityName: 'Thái Bình',
    cityId: 'city-1',
    address: '12 Lê Lợi',
    starRating: 4,
    status: 'ACTIVE' as const,
    checkInTime: '14:00:00',
    checkOutTime: '12:00:00',
    roomTypeCount: 2,
    coverImageUrl: null,
    updatedAt: '2026-11-24T00:00:00Z',
  },
  {
    id: 'hotel-2',
    ownerUserId: 'owner-2',
    name: 'Test 02 Hotel',
    slug: 'test-02',
    cityName: 'Hà Nội',
    cityId: 'city-2',
    address: '45 Hai Bà Trưng',
    starRating: 3,
    status: 'ACTIVE' as const,
    checkInTime: '14:00:00',
    checkOutTime: '12:00:00',
    roomTypeCount: 1,
    coverImageUrl: null,
    updatedAt: '2026-11-24T00:00:00Z',
  },
])
const ownersData = vi.hoisted(() => [
  {
    id: 'owner-1',
    fullName: 'NGUYEN THANH DAT',
    email: 'nguyendat2knam@gmail.com',
    phone: '0901234567',
    role: 'HOTEL_OWNER' as const,
    status: 'ACTIVE' as const,
    emailVerified: true,
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'owner-2',
    fullName: 'TRAN MINH ANH',
    email: 'minhanh@example.test',
    phone: '0907654321',
    role: 'HOTEL_OWNER' as const,
    status: 'ACTIVE' as const,
    emailVerified: true,
    createdAt: '2026-11-02T00:00:00Z',
  },
])

vi.mock('@/features/auth', () => ({
  useCurrentUser: () => authState,
}))

vi.mock('@/features/hotels', () => ({
  useManagementHotelsQuery: () => ({
    isPending: false,
    isError: false,
    isSuccess: true,
    data: {
      content: hotelData,
      page: 0,
      size: 50,
      totalElements: hotelData.length,
      totalPages: 1,
      first: true,
      last: true,
    },
    refetch: vi.fn(),
  }),
  useManagementHotelDetailQuery: () => ({
    isPending: false,
    isError: false,
    data: undefined,
    refetch: vi.fn(),
  }),
}))

vi.mock('@/features/users', () => ({
  useHotelOwnerLookup: (ownerUserId?: string, enabled = true) => ({
    owner: enabled && ownerUserId ? ownersData.find((owner) => owner.id === ownerUserId) ?? null : null,
    owners: enabled ? ownersData : [],
    isPending: false,
    isError: false,
  }),
  UserDetailModal: () => null,
}))

vi.mock('@/features/contracts', () => ({
  ApiHotelContractsSection: ({ hotelName, owner }: { hotelName?: string; owner?: { fullName: string } | null }) => (
    <div data-testid="contracts-section">
      <span>{hotelName}</span>
      <span>{owner?.fullName ?? ''}</span>
    </div>
  ),
}))

vi.mock('@/features/finance', () => ({
  HotelContractNotice: () => <div data-testid="contract-notice" />,
}))

vi.mock('@/features/bookings', () => ({
  BookingList: () => <div data-testid="booking-list" />,
}))

describe('HotelModulePage', () => {
  it('renders both owner and hotel filters for admins', () => {
    authState.isAdmin = true
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/contracts']}>
        <QueryClientProvider client={new QueryClient()}>
          <HotelModulePage module="contracts" />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(html).toContain('for="module-owner"')
    expect(html).toContain('Chủ sở hữu')
    expect(html).toContain('Tất cả chủ sở hữu')
    expect(html).toContain('for="module-hotel"')
    expect(html).toContain('Khách sạn')
    expect(html).toContain('Thai Binh Hotel')
    expect(html).toContain('NGUYEN THANH DAT')
  })

  it('hides the owner filter for non-admin hotel owners', () => {
    authState.isAdmin = false
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/contracts']}>
        <QueryClientProvider client={new QueryClient()}>
          <HotelModulePage module="contracts" />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(html).not.toContain('for="module-owner"')
    expect(html).toContain('for="module-hotel"')
    expect(html).toContain('Khách sạn')
    expect(html).toContain('Thai Binh Hotel')
  })
})
