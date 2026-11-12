import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { hotelManagementKeys } from '@/features/hotels/hooks/hotel-query-keys'
import { useHotelWorkspace } from '@/features/hotels'
import { HotelWorkspaceLayout } from './HotelWorkspaceLayout'

const mockHotel = {
  id: 'h123',
  ownerUserId: 'u123',
  name: 'Khách sạn Biển Xanh',
  slug: 'khach-san-bien-xanh',
  cityName: 'Đà Nẵng',
  cityId: 'c1',
  address: '123 Đường Võ Nguyên Giáp',
  description: 'Khách sạn nghỉ dưỡng cao cấp view biển.',
  starRating: 5,
  status: 'DRAFT' as const,
  checkInTime: '14:00:00',
  checkOutTime: '12:00:00',
  amenityIds: ['pool', 'wifi'],
  roomTypes: [],
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
}

describe('HotelWorkspaceLayout', () => {
  it('renders 404 error state when hotel does not exist', () => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    qc.setQueryData(hotelManagementKeys.detail('api', 'non-existent'), null)

    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/hotels/non-existent/info']}>
        <QueryClientProvider client={qc}>
          <Routes>
            <Route path="hotels/:hotelId" element={<HotelWorkspaceLayout />}>
              <Route path="info" element={<div>Info View</div>} />
            </Route>
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('Không tìm thấy khách sạn')
    expect(markup).toContain('Về danh sách khách sạn')
  })

  it('renders 2-level workspace navigation with HotelSwitcher and subnav items', () => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    qc.setQueryData(hotelManagementKeys.detail('api', 'h123'), mockHotel)
    qc.setQueryData(hotelManagementKeys.list('api', { page: 0, size: 50 }), {
      content: [mockHotel],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 50,
      first: true,
      last: true,
    })

    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/hotels/h123/info']}>
        <QueryClientProvider client={qc}>
          <Routes>
            <Route path="hotels/:hotelId" element={<HotelWorkspaceLayout />}>
              <Route path="info" element={<div>Nội dung thông tin chung</div>} />
            </Route>
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    // Hotel Switcher
    expect(markup).toContain('Khách sạn Biển Xanh')
    expect(markup).toContain('Đang tải hồ sơ')

    // SubNav items
    expect(markup).toContain('Tổng quan')
    expect(markup).toContain('Thông tin chung')
    expect(markup).toContain('Hình ảnh')
    expect(markup).toContain('Tiện ích khách sạn')
    expect(markup).toContain('Phòng')
    expect(markup).toContain('Giá &amp; Tồn kho')
    expect(markup).toContain('Chính sách')
    expect(markup).toContain('Đặt phòng')
    expect(markup).toContain('Đánh giá')

    // Active item aria-current="page"
    expect(markup).toContain('aria-current="page"')
    expect(markup).toContain('Nội dung thông tin chung')
  })
})

function CompletionProbe() {
  const { hotelId, completion } = useHotelWorkspace()
  return <output>{hotelId}:{completion.percent}:{String(completion.sections.amenities)}:{String(completion.sections.pricing)}</output>
}

function renderWorkspace(qc: QueryClient, hotelId = 'h123') {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[`/hotels/${hotelId}/info`]}>
      <QueryClientProvider client={qc}><Routes>
        <Route path="hotels/:hotelId" element={<HotelWorkspaceLayout />}>
          <Route path="info" element={<CompletionProbe />} />
        </Route>
      </Routes></QueryClientProvider>
    </MemoryRouter>,
  )
}

function seedWorkspace(qc: QueryClient, hotelId = 'h123') {
  qc.setQueryData(hotelManagementKeys.detail('api', hotelId), { ...mockHotel, id: hotelId, amenityIds: undefined })
  qc.setQueryData(['hotels', hotelId, 'room-types'], [{ id: 'rt', name: 'Double', active: true, basePrice: 500000, maxAdults: 2, maxChildren: 0 }])
  qc.setQueryData(hotelManagementKeys.images('api', hotelId), [{ id: 'image', url: 'cover.jpg', cover: true }])
}

it('derives completion from independently loaded amenities and base prices on a fresh cache', () => {
  const qc = new QueryClient()
  seedWorkspace(qc)
  qc.setQueryData(hotelManagementKeys.scopedAmenities('h123'), {
    catalogAmenities: [], customAmenities: [{ id: 'custom', attached: true }], inheritedAmenities: [],
  })
  expect(renderWorkspace(qc)).toContain('h123:100:true:true')
  qc.setQueryData(hotelManagementKeys.scopedAmenities('h123'), {
    catalogAmenities: [], customAmenities: [{ id: 'custom', attached: false }], inheritedAmenities: [],
  })
  expect(renderWorkspace(qc)).toContain('h123:85:false:true')
  qc.setQueryData(hotelManagementKeys.scopedAmenities('h123'), {
    catalogAmenities: [{ id: 'wifi' }], customAmenities: [], inheritedAmenities: [],
  })
  qc.setQueryData(['hotels', 'h123', 'room-types'], [{ id: 'rt', name: 'Double', active: true, basePrice: 0, maxAdults: 2, maxChildren: 0 }])
  expect(renderWorkspace(qc)).toContain('h123:90:true:false')
})

it('does not reuse the previous hotel amenities when switching hotels', () => {
  const qc = new QueryClient()
  seedWorkspace(qc)
  seedWorkspace(qc, 'other')
  qc.setQueryData(hotelManagementKeys.scopedAmenities('h123'), { catalogAmenities: [{ id: 'wifi' }], customAmenities: [], inheritedAmenities: [] })
  expect(renderWorkspace(qc)).toContain('h123:100:true:true')
  expect(renderWorkspace(qc, 'other')).toContain('other:85:false:true')
  expect(renderWorkspace(qc, 'other')).toContain('Đang tải hồ sơ')
})
