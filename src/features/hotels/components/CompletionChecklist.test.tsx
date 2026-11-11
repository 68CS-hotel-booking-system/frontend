import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp } from 'antd'
import { CompletionChecklist } from './CompletionChecklist'
import { hotelReviewKeys } from '../hooks/use-hotel-reviews'
import type { ManagementHotelDetail } from '../model/hotel'
import type { HotelCompletionStatus } from '../context/hotel-workspace-context'

const roles = vi.hoisted(() => ({ isAdmin: false, isOwner: true, currentUser: { id: 'u101' } }))
vi.mock('@/features/auth', () => ({ useCurrentUser: () => roles }))

const mockHotel: ManagementHotelDetail = {
  id: 'h101', version: 0,
  ownerUserId: 'u101',
  name: 'StayHub Seaside Resort',
  slug: 'stayhub-seaside',
  cityName: 'Đà Nẵng',
  cityId: 'c1',
  address: '100 Đường Biển, Đà Nẵng',
  description: 'Khu nghỉ dưỡng view biển đẹp.',
  starRating: 5,
  latitude: null,
  longitude: null,
  status: 'DRAFT',
  checkInTime: '14:00:00',
  checkOutTime: '12:00:00',
  amenityIds: ['wifi', 'pool'],
  roomTypes: [],
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
}

function reviewClient() {
  const client = new QueryClient()
  client.setQueryData(hotelReviewKeys.management(mockHotel.id), { content: [] })
  return client
}

describe('CompletionChecklist component', () => {
  afterEach(() => { roles.isAdmin = false })
  it('renders checklist progress and allows the Owner to send saved data for server validation', () => {
    const qc = reviewClient()
    const partialCompletion: HotelCompletionStatus = {
      percent: 40,
      sections: {
        info: true,
        photos: false,
        amenities: true,
        rooms: false,
        pricing: false,
        policies: true,
        bookings: false,
        reviews: false,
      },
    }

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <QueryClientProvider client={qc}>
          <AntApp>
            <CompletionChecklist hotel={mockHotel} completion={partialCompletion} />
          </AntApp>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    // Heading & Progress
    expect(markup).toContain('Checklist hoàn thiện hồ sơ')
    expect(markup).toContain('40% hoàn tất')
    expect(markup).toContain('Còn 3 mục chưa xác minh hoặc hoàn tất')

    // 5 criteria present
    expect(markup).toContain('Thông tin cơ bản')
    expect(markup).toContain('Ảnh đại diện khách sạn')
    expect(markup).toContain('Chọn tiện ích khách sạn')
    expect(markup).toContain('Có ít nhất 1 loại phòng')
    expect(markup).toContain('Thiết lập giá bán theo đêm')

    // Action buttons for subpages present
    expect(markup).toContain('Cập nhật')
    expect(markup).toContain('Thêm ảnh')
    expect(markup).toContain('Chọn tiện ích')
    expect(markup).toContain('Tạo phòng')
    expect(markup).toContain('Đặt giá')

    // Submit for approval button present
    expect(markup).toContain('Gửi hồ sơ xét duyệt')
    expect(markup).not.toContain('Backend chưa hỗ trợ gửi hồ sơ kiểm duyệt')
  })

  it('allows Owner submission when the review state is known', () => {
    const qc = reviewClient()
    const fullCompletion: HotelCompletionStatus = {
      percent: 100,
      sections: {
        info: true,
        photos: true,
        amenities: true,
        rooms: true,
        pricing: true,
        policies: true,
        bookings: false,
        reviews: false,
      },
    }

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <QueryClientProvider client={qc}>
          <AntApp>
            <CompletionChecklist hotel={mockHotel} completion={fullCompletion} />
          </AntApp>
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(markup).toContain('100% hoàn tất')
    expect(markup).toContain('Đã hoàn thiện các mục kiểm tra')
    expect(markup).toContain('Gửi hồ sơ xét duyệt')
    const button = markup.match(/<button\b[^>]*>[\s\S]*?<\/button>/g)?.find((item) => item.includes('Gửi hồ sơ xét duyệt'))
    expect(button).not.toContain('disabled')
  })

  it('routes Admin to submitted reviews without direct draft approval', () => {
    roles.isAdmin = true
    const completion: HotelCompletionStatus = {
      percent: 0,
      sections: { info: false, photos: false, amenities: false, rooms: false, pricing: false, policies: false, bookings: false, reviews: false },
    }
    const markup = renderToStaticMarkup(
      <MemoryRouter><QueryClientProvider client={reviewClient()}><AntApp>
        <CompletionChecklist hotel={mockHotel} completion={completion} />
      </AntApp></QueryClientProvider></MemoryRouter>,
    )
    expect(markup).toContain('/admin/hotel-review-requests')
    expect(markup).toContain('Danh sách chờ xét duyệt')
    expect(markup).not.toContain('Duyệt khách sạn')
    expect(markup).not.toContain('Gửi hồ sơ xét duyệt</span>')
  })
})
